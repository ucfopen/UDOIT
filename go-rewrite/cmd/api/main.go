package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"rewritetest/internal/accessibility"
	"rewritetest/internal/auth"
	"rewritetest/internal/i18n"
	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata"
	"rewritetest/internal/lti"
	"rewritetest/internal/shared/http/middleware"
	"rewritetest/internal/tenants"
	"rewritetest/internal/users"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/redis/go-redis/v9"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "hello!")
}

func main() {
	router := gin.Default()

	router.Use(middleware.ErrorHandler())

	// Initialize infrastructure
	db, err := sql.Open("mysql", os.Getenv("GO_DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	fmt.Println("MySQL database successfully connected")

	client := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("GO_REDIS_ADDR"),
		Password: "",
		DB:       0,
	})

	err = client.Ping(context.Background()).Err()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Redis client successfully connected")

	// Initialize modules
	lmsEncryptionKey := strings.TrimSpace(os.Getenv("GO_LMS_ENCRYPTION_KEY_B64"))
	if lmsEncryptionKey == "" {
		log.Fatal("missing GO_LMS_ENCRYPTION_KEY_B64")
	}

	lmsModule, err := lms.New(db, client, fmt.Sprintf("%s/lms", os.Getenv("GO_BASE_URL")), lmsEncryptionKey)
	if err != nil {
		log.Fatal(err)
	}
	authModule := auth.New(client, db)
	lmsDataModule := lmsdata.New(db)
	i18nModule := i18n.New()
	usersModule := users.New(db, i18nModule, authModule)
	accessibilityModule := accessibility.New(db, lmsDataModule, lmsDataModule, lmsModule, lmsDataModule, authModule)
	tenantsModule := tenants.New(db, lmsModule)
	ltiModule := lti.New(client, db, usersModule, authModule, lmsDataModule, lmsModule, tenantsModule, lmsModule, os.Getenv("GO_BASE_URL"))

	// Register routes
	usersModule.RegisterRoutes(router.Group("/users"))
	ltiModule.RegisterRoutes(router.Group("/lti"))
	lmsModule.RegisterRoutes(router.Group("/lms"))
	accessibilityModule.RegisterRoutes(router.Group("/accessibility"))

	mockToolDir := filepath.Clean("./mock-lti-tool")
	serveMockTool := func(c *gin.Context) {
		requestPath := strings.TrimPrefix(c.Param("path"), "/")
		if requestPath == "" {
			c.File(filepath.Join(mockToolDir, "index.html"))
			return
		}

		candidate := filepath.Clean(filepath.Join(mockToolDir, requestPath))
		if !strings.HasPrefix(candidate, mockToolDir+string(filepath.Separator)) {
			c.File(filepath.Join(mockToolDir, "index.html"))
			return
		}

		if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
			c.File(candidate)
			return
		}

		c.File(filepath.Join(mockToolDir, "index.html"))
	}

	router.GET("/mock-lti-tool", func(c *gin.Context) {
		slog.Info("Serving mock LTI tool index page")
		c.File(filepath.Join(mockToolDir, "index.html"))
	})
	router.GET("/mock-lti-tool/*path", serveMockTool)
	router.POST("/mock-lti-tool/*path", serveMockTool)

	port := ":8080"
	fmt.Println("Server running on http://localhost" + port)

	err = router.Run(port)
	if err != nil {
		log.Fatal(err)
	}
}
