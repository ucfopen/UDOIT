package domain

type ContentHasher interface {
	HashContent(content string) (string, error)
}
