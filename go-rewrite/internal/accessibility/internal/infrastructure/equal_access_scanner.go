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
	HTML         string   `json:"html"`
	GuidelineIDs []string `json:"guidelineIds"`
	ReportLevels []string `json:"reportLevels"`
}

// scanResponse represents the structure of the scan results returned by the
// EqualAccess scanning service.
type contentScanResponse struct {
	Results []scanIssue `json:"results"`
}

type scanIssue struct {
	Message     string   `json:"message"`
	Path        scanPath `json:"path"`
	ReasonID    string   `json:"reasonId"`
	RuleID      string   `json:"ruleId"`
	Value       []string `json:"value"`
	MessageArgs []any    `json:"messageArgs"`
}

type scanPath struct {
	ARIA string `json:"aria"`
	DOM  string `json:"dom"`
}

func (e *EqualAccessScanner) ScanContent(ctx context.Context, items []domain.ScanItem) ([]domain.ScanResult, error) {
	scanResults := make([]domain.ScanResult, 0)

	for _, item := range items {
		body := contentScanRequest{
			HTML:         item.HTML,
			GuidelineIDs: nil,
			ReportLevels: nil,
		}

		payload, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}

		scanResponse, err := e.httpClient.Post(e.baseURL+"/scan", "application/json", bytes.NewReader(payload))
		if err != nil {
			return nil, err
		}
		defer scanResponse.Body.Close()

		var result contentScanResponse
		err = json.NewDecoder(scanResponse.Body).Decode(&result)
		if err != nil {
			return nil, err
		}

		for _, issue := range result.Results {
			domainResult := domain.ScanResult{
				ContentItemID: item.ContentItemID,
				ScanRule:      domain.ScanRule(issue.RuleID),
				ContentXPath:  issue.Path.DOM,
				Severity:      e.getScanIssueSeverity(issue),
				Details: map[string]any{
					"message":     issue.Message,
					"messageArgs": issue.MessageArgs,
				},
			}

			scanResults = append(scanResults, domainResult)
		}

	}

	return scanResults, nil
}

func (e *EqualAccessScanner) getScanIssueSeverity(issue scanIssue) domain.IssueSeverity {
	// TODO: handle "PASS"

	if issue.Value[1] == "MANUAL" {
		return domain.IssueSeverityPotential
	}

	if issue.Value[0] == "VIOLATION" {
		if issue.Value[1] == "FAIL" {
			return domain.IssueSeverityError
		} else {
			return domain.IssueSeverityPotential
		}
	}

	if issue.Value[0] == "RECOMMENDATION" {
		return domain.IssueSeverityPotential
	}

	return domain.IssueSeverityError
}

var _ domain.Scanner = (*EqualAccessScanner)(nil)
