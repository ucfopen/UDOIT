package infrastructure

import (
	"bytes"
	"context"
	"encoding/json"
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

var _ domain.Scanner = (*EqualAccessScanner)(nil)
