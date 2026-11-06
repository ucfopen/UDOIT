package mysql

import (
	"database/sql"

	lmssqlc "rewritetest/internal/lms/internal/storage/mysql/sqlc"
	"rewritetest/internal/shared/crypto"
)

type Store struct {
	db      *sql.DB
	queries *lmssqlc.Queries
	cipher  crypto.Cipher
}

func New(db *sql.DB, cipher crypto.Cipher) *Store {
	return &Store{db: db, queries: lmssqlc.New(db), cipher: cipher}
}
