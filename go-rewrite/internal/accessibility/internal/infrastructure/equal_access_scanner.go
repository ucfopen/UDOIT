package infrastructure

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"rewritetest/internal/accessibility/internal/domain"
)

type EqualAccessScanner struct {
	httpClient *http.Client
	baseURL    string
}

func NewEqualAccessScanner(httpClient *http.Client, baseURL string) *EqualAccessScanner {
	return &EqualAccessScanner{
		httpClient: httpClient,
		baseURL:    baseURL,
	}
}

type contentScanRequest struct {
	Items        []contentScanRequestItem `json:"items"`
	GuidelineIDs []string                 `json:"guidelineIds"`
	ReportLevels []string                 `json:"reportLevels"`
}

type contentScanRequestItem struct {
	ContentItemID int64  `json:"contentItemId"`
	HTML          string `json:"html"`
}

type contentScanResponse struct {
	Results    []processedScanIssue `json:"results"`
	References []scanReference      `json:"references"`
}

type processedScanIssue struct {
	ContentItemID int64          `json:"contentItemId"`
	RuleID        string         `json:"ruleId"`
	ContentXPath  string         `json:"contentXPath"`
	Severity      string         `json:"severity"`
	Details       map[string]any `json:"details"`
}

type scanReference struct {
	ContentItemID int64  `json:"contentItemId"`
	Kind          string `json:"kind"`
	TagName       string `json:"tagName"`
	Attribute     string `json:"attribute"`
	Value         string `json:"value"`
	XPath         string `json:"xpath"`
}

func (e *EqualAccessScanner) ScanContent(ctx context.Context, items []domain.ScanItem) (domain.ScanContentResult, error) {
	requestItems := make([]contentScanRequestItem, len(items))
	for i, item := range items {
		requestItems[i] = contentScanRequestItem{
			ContentItemID: item.ContentItemID,
			HTML:          item.HTML,
		}
	}

	body := contentScanRequest{
		Items:        requestItems,
		GuidelineIDs: nil,
		ReportLevels: nil,
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return domain.ScanContentResult{}, err
	}

	scanResponse, err := e.httpClient.Post(e.baseURL+"/scan", "application/json", bytes.NewReader(payload))
	if err != nil {
		return domain.ScanContentResult{}, err
	}
	defer scanResponse.Body.Close()

	var result contentScanResponse
	err = json.NewDecoder(scanResponse.Body).Decode(&result)
	if err != nil {
		return domain.ScanContentResult{}, err
	}

	e.logReferenceSummary(result.References)

	scanResults := make([]domain.ScanResult, 0, len(result.Results))
	for _, issue := range result.Results {
		severity, err := domain.ParseIssueSeverity(issue.Severity)
		if err != nil {
			return domain.ScanContentResult{}, err
		}

		domainResult := domain.ScanResult{
			ContentItemID: issue.ContentItemID,
			ScanRule:      domain.ScanRule(issue.RuleID),
			ContentXPath:  issue.ContentXPath,
			Severity:      severity,
			Details:       issue.Details,
		}

		scanResults = append(scanResults, domainResult)
	}

	scanReferences := make([]domain.ExtractedReference, 0, len(result.References))
	for _, ref := range result.References {
		scanReferences = append(scanReferences, domain.ExtractedReference{
			ContentItemID: ref.ContentItemID,
			Kind:          ref.Kind,
			TagName:       ref.TagName,
			Attribute:     ref.Attribute,
			Value:         ref.Value,
			XPath:         ref.XPath,
		})
	}

	return domain.ScanContentResult{
		Issues:     scanResults,
		References: scanReferences,
	}, nil
}

func (e *EqualAccessScanner) logReferenceSummary(references []scanReference) {
	if len(references) == 0 {
		slog.Info("scanner references extracted", "total", 0)
		return
	}

	countByKind := map[string]int{}
	countByContentItem := map[int64]int{}
	valuesByKind := map[string][]string{}
	uniqueValues := map[string]struct{}{}
	allValues := make([]string, 0)
	for _, ref := range references {
		countByKind[ref.Kind]++
		countByContentItem[ref.ContentItemID]++

		valuesByKind[ref.Kind] = append(valuesByKind[ref.Kind], ref.Value)
		if _, exists := uniqueValues[ref.Value]; !exists {
			uniqueValues[ref.Value] = struct{}{}
			allValues = append(allValues, ref.Value)
		}
	}

	slog.Info(
		"scanner references extracted",
		"total", len(references),
		"by_kind", countByKind,
		"by_content_item", countByContentItem,
		"values", allValues,
		"values_by_kind", valuesByKind,
	)
}

var _ domain.Scanner = (*EqualAccessScanner)(nil)
