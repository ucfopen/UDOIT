package canvas

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
	"rewritetest/internal/shared/apperr"
)

var canvasFilePathPattern = regexp.MustCompile(`(^|/)files/([0-9]+)(?:/|$)`)

type canvasPage struct {
	PageID int64  `json:"page_id"`
	URL    string `json:"url"`
	Body   string `json:"body"`
}

type canvasSyllabusResponse struct {
	ID           int64  `json:"id"`
	SyllabusBody string `json:"syllabus_body"`
}

// replaceCourseFileReferences updates rich-text and module references to the
// old Canvas file. Each update is safe to retry: completed changes no longer
// contain the old file ID, and module-item swaps detect an already-created
// replacement before creating another one.
func (p *Canvas) replaceCourseFileReferences(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	if oldFileID == newFileID {
		return nil
	}
	if err := p.replaceSyllabusFileReference(ctx, userID, courseID, oldFileID, newFileID, oldFileName, newFileName); err != nil {
		return err
	}
	if err := p.replacePageFileReferences(ctx, userID, courseID, oldFileID, newFileID, oldFileName, newFileName); err != nil {
		return err
	}
	if err := p.replaceAssignmentFileReferences(ctx, userID, courseID, oldFileID, newFileID, oldFileName, newFileName); err != nil {
		return err
	}
	if err := p.replaceDiscussionFileReferences(ctx, userID, courseID, oldFileID, newFileID, oldFileName, newFileName); err != nil {
		return err
	}
	if err := p.replaceAnnouncementFileReferences(ctx, userID, courseID, oldFileID, newFileID, oldFileName, newFileName); err != nil {
		return err
	}
	if err := p.replaceQuizFileReferences(ctx, userID, courseID, oldFileID, newFileID, oldFileName, newFileName); err != nil {
		return err
	}
	return p.replaceModuleFileItems(ctx, userID, courseID, oldFileID, newFileID, oldFileName, newFileName)
}

func (p *Canvas) replaceSyllabusFileReference(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	path := fmt.Sprintf("/api/v1/courses/%s?include[]=syllabus_body", courseID)
	course, _, err := fetchOneJSON[canvasSyllabusResponse](p, ctx, userID, path)
	if err != nil {
		return fmt.Errorf("read course syllabus: %w", err)
	}
	updatedHTML, changed, err := replaceFileReferencesInHTML(course.SyllabusBody, oldFileID, newFileID, oldFileName, newFileName)
	if err != nil || !changed {
		return err
	}
	return p.updateCanvasResource(ctx, userID, "/api/v1/courses/"+courseID, map[string]any{
		"course": map[string]any{"syllabus_body": updatedHTML},
	})
}

func (p *Canvas) replacePageFileReferences(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	path := fmt.Sprintf("/api/v1/courses/%s/pages?include[]=body&per_page=100", courseID)
	pages, err := fetchPaginatedJSON[canvasPage](p, ctx, userID, path)
	if err != nil {
		return fmt.Errorf("list course pages: %w", err)
	}
	for _, page := range pages {
		updatedHTML, changed, err := replaceFileReferencesInHTML(page.Body, oldFileID, newFileID, oldFileName, newFileName)
		if err != nil {
			return fmt.Errorf("rewrite page %q: %w", page.URL, err)
		}
		if !changed {
			continue
		}
		path := fmt.Sprintf("/api/v1/courses/%s/pages/page_id:%d", courseID, page.PageID)
		if err := p.updateCanvasResource(ctx, userID, path, map[string]any{"wiki_page": map[string]any{"body": updatedHTML}}); err != nil {
			return fmt.Errorf("update page %q: %w", page.URL, err)
		}
	}
	return nil
}

func (p *Canvas) replaceAssignmentFileReferences(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	assignments, err := p.getAssignments(ctx, userID, courseID)
	if err != nil {
		return fmt.Errorf("list course assignments: %w", err)
	}
	for _, assignment := range assignments {
		updatedHTML, changed, err := replaceFileReferencesInHTML(assignment.Description, oldFileID, newFileID, oldFileName, newFileName)
		if err != nil {
			return fmt.Errorf("rewrite assignment %d: %w", assignment.ID, err)
		}
		if !changed {
			continue
		}
		path := fmt.Sprintf("/api/v1/courses/%s/assignments/%d", courseID, assignment.ID)
		if err := p.updateCanvasResource(ctx, userID, path, map[string]any{"assignment": map[string]any{"description": updatedHTML}}); err != nil {
			return fmt.Errorf("update assignment %d: %w", assignment.ID, err)
		}
	}
	return nil
}

func (p *Canvas) replaceDiscussionFileReferences(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	topics, err := p.getDiscussionTopics(ctx, userID, courseID)
	if err != nil {
		return fmt.Errorf("list course discussions: %w", err)
	}
	for _, topic := range topics {
		if err := p.updateDiscussionMessage(ctx, userID, courseID, topic.ID, topic.Message, oldFileID, newFileID, oldFileName, newFileName); err != nil {
			return fmt.Errorf("update discussion %d: %w", topic.ID, err)
		}
	}
	return nil
}

func (p *Canvas) replaceAnnouncementFileReferences(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	announcements, err := p.getAnnouncements(ctx, userID, courseID)
	if err != nil {
		return fmt.Errorf("list course announcements: %w", err)
	}
	for _, announcement := range announcements {
		if err := p.updateDiscussionMessage(ctx, userID, courseID, announcement.ID, announcement.Message, oldFileID, newFileID, oldFileName, newFileName); err != nil {
			return fmt.Errorf("update announcement %d: %w", announcement.ID, err)
		}
	}
	return nil
}

func (p *Canvas) updateDiscussionMessage(ctx context.Context, userID int64, courseID string, topicID int64, message, oldFileID, newFileID, oldFileName, newFileName string) error {
	updatedHTML, changed, err := replaceFileReferencesInHTML(message, oldFileID, newFileID, oldFileName, newFileName)
	if err != nil || !changed {
		return err
	}
	path := fmt.Sprintf("/api/v1/courses/%s/discussion_topics/%d", courseID, topicID)
	return p.updateCanvasResource(ctx, userID, path, map[string]any{"message": updatedHTML})
}

func (p *Canvas) replaceQuizFileReferences(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	quizzes, err := fetchPaginatedJSON[QuizResponse](p, ctx, userID, fmt.Sprintf("/api/v1/courses/%s/quizzes?per_page=100", courseID))
	if err != nil {
		return fmt.Errorf("list course quizzes: %w", err)
	}
	for _, quiz := range quizzes {
		updatedDescription, changed, err := replaceFileReferencesInHTML(quiz.Description, oldFileID, newFileID, oldFileName, newFileName)
		if err != nil {
			return fmt.Errorf("rewrite quiz %d description: %w", quiz.ID, err)
		}
		if changed {
			path := fmt.Sprintf("/api/v1/courses/%s/quizzes/%d", courseID, quiz.ID)
			if err := p.updateCanvasResource(ctx, userID, path, map[string]any{"quiz": map[string]any{"description": updatedDescription}}); err != nil {
				return fmt.Errorf("update quiz %d description: %w", quiz.ID, err)
			}
		}

		questions, err := fetchPaginatedJSON[QuizQuestionResponse](p, ctx, userID, fmt.Sprintf("/api/v1/courses/%s/quizzes/%d/questions?per_page=100", courseID, quiz.ID))
		if err != nil {
			return fmt.Errorf("list questions for quiz %d: %w", quiz.ID, err)
		}
		for _, question := range questions {
			updatedText, changed, err := replaceFileReferencesInHTML(question.QuestionText, oldFileID, newFileID, oldFileName, newFileName)
			if err != nil {
				return fmt.Errorf("rewrite question %d in quiz %d: %w", question.ID, quiz.ID, err)
			}
			if !changed {
				continue
			}
			path := fmt.Sprintf("/api/v1/courses/%s/quizzes/%d/questions/%d", courseID, quiz.ID, question.ID)
			if err := p.updateCanvasResource(ctx, userID, path, map[string]any{"question": map[string]any{"question_text": updatedText}}); err != nil {
				return fmt.Errorf("update question %d in quiz %d: %w", question.ID, quiz.ID, err)
			}
		}
	}
	return nil
}

func (p *Canvas) replaceModuleFileItems(ctx context.Context, userID int64, courseID, oldFileID, newFileID, oldFileName, newFileName string) error {
	modules, err := fetchPaginatedJSON[CanvasModuleResponse](p, ctx, userID, fmt.Sprintf("/api/v1/courses/%s/modules?include[]=items&per_page=100", courseID))
	if err != nil {
		return fmt.Errorf("list course modules: %w", err)
	}
	for _, module := range modules {
		items := module.Items
		if items == nil {
			items, err = fetchPaginatedJSON[CanvasModuleItemResponse](p, ctx, userID, fmt.Sprintf("/api/v1/courses/%s/modules/%d/items?per_page=100", courseID, module.ID))
			if err != nil {
				return fmt.Errorf("list items in module %d: %w", module.ID, err)
			}
		}
		if err := p.replaceModuleFileItemReferences(ctx, userID, courseID, module.ID, items, oldFileID, newFileID, oldFileName, newFileName); err != nil {
			return fmt.Errorf("replace file items in module %d: %w", module.ID, err)
		}
	}
	return nil
}

func (p *Canvas) replaceModuleFileItemReferences(ctx context.Context, userID int64, courseID string, moduleID int64, items []CanvasModuleItemResponse, oldFileID, newFileID, oldFileName, newFileName string) error {
	replacementsBySettings := make(map[string]int)
	for _, item := range items {
		if item.Type == "File" && strconv.FormatInt(item.ContentID, 10) == newFileID {
			replacementsBySettings[moduleItemSettingsKey(item, oldFileName, newFileName)]++
		}
	}

	oldItemsBySettings := make(map[string]int)
	for _, item := range items {
		if item.Type != "File" || strconv.FormatInt(item.ContentID, 10) != oldFileID {
			continue
		}
		settingsKey := moduleItemSettingsKey(item, oldFileName, newFileName)
		oldItemsBySettings[settingsKey]++
		if replacementsBySettings[settingsKey] < oldItemsBySettings[settingsKey] {
			replacementTitle := replaceDefaultFileName(item.Title, oldFileName, newFileName)
			if err := p.createReplacementModuleFileItem(ctx, userID, courseID, moduleID, item, newFileID, replacementTitle); err != nil {
				return fmt.Errorf("create replacement for module item %d: %w", item.ID, err)
			}
			replacementsBySettings[settingsKey]++
		}
		if err := p.deleteModuleItem(ctx, userID, courseID, moduleID, item.ID); err != nil {
			return fmt.Errorf("delete replaced module item %d: %w", item.ID, err)
		}
	}
	return nil
}

func moduleItemSettingsKey(item CanvasModuleItemResponse, oldFileName, newFileName string) string {
	completion := ""
	if item.CompletionRequirement != nil {
		completion = fmt.Sprintf("%s:%d", item.CompletionRequirement.Type, item.CompletionRequirement.MinScore)
	}
	title := item.Title
	if oldFileName != "" && title == newFileName {
		title = oldFileName
	}
	// Creating the replacement shifts the old item position; match on the stable
	// settings so a retry recognizes the replacement even after that shift.
	return fmt.Sprintf("%s|%d|%s", title, item.Indent, completion)
}

func (p *Canvas) createReplacementModuleFileItem(ctx context.Context, userID int64, courseID string, moduleID int64, oldItem CanvasModuleItemResponse, newFileID, replacementTitle string) error {
	moduleItem := map[string]any{
		"title":      replacementTitle,
		"type":       "File",
		"content_id": newFileID,
		"position":   oldItem.Position,
		"indent":     oldItem.Indent,
	}
	if oldItem.CompletionRequirement != nil {
		completion := map[string]any{"type": oldItem.CompletionRequirement.Type}
		if oldItem.CompletionRequirement.Type == "min_score" {
			completion["min_score"] = oldItem.CompletionRequirement.MinScore
		}
		moduleItem["completion_requirement"] = completion
	}
	path := fmt.Sprintf("/api/v1/courses/%s/modules/%d/items", courseID, moduleID)
	return p.sendCanvasRequest(ctx, userID, http.MethodPost, path, map[string]any{"module_item": moduleItem})
}

func (p *Canvas) deleteModuleItem(ctx context.Context, userID int64, courseID string, moduleID, itemID int64) error {
	path := fmt.Sprintf("/api/v1/courses/%s/modules/%d/items/%d", courseID, moduleID, itemID)
	return p.sendCanvasRequest(ctx, userID, http.MethodDelete, path, nil)
}

func (p *Canvas) updateCanvasResource(ctx context.Context, userID int64, path string, body map[string]any) error {
	return p.sendCanvasRequest(ctx, userID, http.MethodPut, path, body)
}

func (p *Canvas) sendCanvasRequest(ctx context.Context, userID int64, method, path string, body any) error {
	response, err := p.doAuthenticatedRequest(ctx, userID, CanvasRequest{Path: path, Method: method, Body: body})
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		responseBody, _ := io.ReadAll(response.Body)
		return apperr.Internal(fmt.Sprintf("Canvas request %s %s failed with %s: %s", method, path, response.Status, strings.TrimSpace(string(responseBody))))
	}
	return nil
}

func replaceFileReferencesInHTML(sourceHTML, oldFileID, newFileID, oldFileName, newFileName string) (string, bool, error) {
	contextNode := &html.Node{Type: html.ElementNode, Data: "div", DataAtom: atom.Div}
	nodes, err := html.ParseFragment(strings.NewReader(sourceHTML), contextNode)
	if err != nil {
		return "", false, apperr.Internal("Failed to parse Canvas rich-text content", apperr.WithCause(err))
	}
	changed := false
	for _, node := range nodes {
		if replaceFileReferenceAttributes(node, oldFileID, newFileID, oldFileName, newFileName) {
			changed = true
		}
	}
	if !changed {
		return sourceHTML, false, nil
	}
	var output bytes.Buffer
	for _, node := range nodes {
		if err := html.Render(&output, node); err != nil {
			return "", false, apperr.Internal("Failed to serialize updated Canvas rich-text content", apperr.WithCause(err))
		}
	}
	return output.String(), true, nil
}

func replaceFileReferenceAttributes(node *html.Node, oldFileID, newFileID, oldFileName, newFileName string) bool {
	changed := false
	if node.Type == html.ElementNode {
		if strings.EqualFold(node.Data, "a") && oldFileName != "" && newFileName != "" && nodeText(node) == oldFileName && nodeReferencesCanvasFile(node, oldFileID) {
			setNodeText(node, newFileName)
			changed = true
		}
		for i := range node.Attr {
			switch strings.ToLower(node.Attr[i].Key) {
			case "href", "src", "data-api-endpoint":
				updatedValue, replaced := replaceCanvasFileIDInURL(node.Attr[i].Val, oldFileID, newFileID)
				if replaced {
					node.Attr[i].Val = updatedValue
					changed = true
				}
			}
		}
	}
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		if replaceFileReferenceAttributes(child, oldFileID, newFileID, oldFileName, newFileName) {
			changed = true
		}
	}
	return changed
}

func nodeReferencesCanvasFile(node *html.Node, fileID string) bool {
	if node.Type == html.ElementNode {
		for _, attribute := range node.Attr {
			switch strings.ToLower(attribute.Key) {
			case "href", "src", "data-api-endpoint":
				if canvasURLReferencesFileID(attribute.Val, fileID) {
					return true
				}
			}
		}
	}
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		if nodeReferencesCanvasFile(child, fileID) {
			return true
		}
	}
	return false
}

func canvasURLReferencesFileID(reference, fileID string) bool {
	parsed, err := url.Parse(reference)
	if err != nil {
		return false
	}
	match := canvasFilePathPattern.FindStringSubmatchIndex(parsed.Path)
	return len(match) > 0 && parsed.Path[match[4]:match[5]] == fileID
}

func nodeText(node *html.Node) string {
	if node.Type == html.TextNode {
		return node.Data
	}
	var text strings.Builder
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		text.WriteString(nodeText(child))
	}
	return text.String()
}

// setNodeText updates the visible text while retaining inline markup such as
// emphasis or spans already present inside a linked filename.
func setNodeText(node *html.Node, replacement string) {
	firstTextNode := firstTextNode(node)
	if firstTextNode == nil {
		return
	}
	firstTextNode.Data = replacement
	clearOtherTextNodes(node, firstTextNode)
}

func firstTextNode(node *html.Node) *html.Node {
	if node.Type == html.TextNode {
		return node
	}
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		if textNode := firstTextNode(child); textNode != nil {
			return textNode
		}
	}
	return nil
}

func clearOtherTextNodes(node, keep *html.Node) {
	if node.Type == html.TextNode {
		if node != keep {
			node.Data = ""
		}
		return
	}
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		clearOtherTextNodes(child, keep)
	}
}

func replaceDefaultFileName(currentTitle, oldFileName, newFileName string) string {
	if oldFileName != "" && newFileName != "" && currentTitle == oldFileName {
		return newFileName
	}
	return currentTitle
}

func replaceCanvasFileIDInURL(reference, oldFileID, newFileID string) (string, bool) {
	parsed, err := url.Parse(reference)
	if err != nil {
		return reference, false
	}
	match := canvasFilePathPattern.FindStringSubmatchIndex(parsed.Path)
	if len(match) == 0 || parsed.Path[match[4]:match[5]] != oldFileID {
		return reference, false
	}
	parsed.Path = parsed.Path[:match[4]] + newFileID + parsed.Path[match[5]:]
	if parsed.RawPath != "" {
		parsed.RawPath = ""
	}
	return parsed.String(), true
}
