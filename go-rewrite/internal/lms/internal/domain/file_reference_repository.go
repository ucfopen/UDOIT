package domain

import "context"

type FileReferenceRepository interface {
	ReplaceForContentItems(ctx context.Context, contentItemIDs []int64, fileReferences []*FileReference) error
}
