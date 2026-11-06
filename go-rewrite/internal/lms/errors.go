package lms

import "rewritetest/internal/shared/apperr"

func notFound(message string) error {
	return apperr.New(apperr.CodeNotFound, message)
}
