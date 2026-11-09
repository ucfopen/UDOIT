package db

import (
	"database/sql"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func NewDB(dbURL string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dbURL)
	if err != nil {
		return nil, err
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}
