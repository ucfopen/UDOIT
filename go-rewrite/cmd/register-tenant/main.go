package main

import (
	"context"
	"database/sql"
	"errors"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"rewritetest/internal/lms"
	"rewritetest/internal/lti"
	"rewritetest/internal/tenants"

	_ "github.com/go-sql-driver/mysql"
	"github.com/redis/go-redis/v9"
	"gopkg.in/yaml.v3"
)

type config struct {
	Tenant tenantConfig   `yaml:"tenant"`
	LTI    ltiConfig      `yaml:"lti"`
	LMS    map[string]any `yaml:"lms"`
}

type tenantConfig struct {
	LMSKey string `yaml:"lms_key"`
}

type ltiConfig struct {
	Issuer               string `yaml:"issuer"`
	ClientID             string `yaml:"client_id"`
	LoginAuthEndpoint    string `yaml:"login_auth_endpoint"`
	JWKEndpoint          string `yaml:"jwk_endpoint"`
	ServiceAuthEndpoint  string `yaml:"service_auth_endpoint"`
	ServiceLoginEndpoint string `yaml:"service_login_endpoint"`
}

func main() {
	configPath := flag.String("config", "./config/register-tenant.yaml", "Path to tenant/LTI registration YAML")
	flag.Parse()

	cfg, err := loadConfig(*configPath)
	if err != nil {
		fatalf("failed to load config: %v", err)
	}

	databaseURL := strings.TrimSpace(os.Getenv("GO_DATABASE_URL"))
	if databaseURL == "" {
		fatalf("missing GO_DATABASE_URL")
	}

	db, err := sql.Open("mysql", databaseURL)
	if err != nil {
		fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	client := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("GO_REDIS_ADDR"),
		Password: "",
		DB:       0,
	})
	defer client.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		fatalf("failed to connect to database: %v", err)
	}

	lmsEncryptionKey := strings.TrimSpace(os.Getenv("GO_LMS_ENCRYPTION_KEY_B64"))
	if lmsEncryptionKey == "" {
		fatalf("missing GO_LMS_ENCRYPTION_KEY_B64")
	}

	lmsModule, err := lms.New(db, client, os.Getenv("GO_BASE_URL"), lmsEncryptionKey)
	if err != nil {
		fatalf("failed to initialize LMS module: %v", err)
	}

	lmsKey, _ := cfg.LMS["lms_key"].(string)

	err = lmsModule.ValidateProviderConfig(ctx, lmsKey, cfg.LMS)
	if err != nil {
		fatalf("invalid LMS provider config: %v", err)
	}

	tenantsModule := tenants.New(db, lmsModule)
	tenantID, err := tenantsModule.RegisterTenant(ctx, cfg.Tenant.LMSKey)
	if err != nil {
		fatalf("failed to register tenant: %v", err)
	}

	err = lmsModule.SaveProviderConfig(ctx, tenantID, lmsKey, cfg.LMS)
	if err != nil {
		fatalf("failed to save LMS provider config: %v", err)
	}

	ltiModule := lti.NewRegistrationModule(db)
	err = ltiModule.RegisterRegistration(ctx, lti.RegisterRegistrationInput{
		Issuer:               cfg.LTI.Issuer,
		ClientID:             cfg.LTI.ClientID,
		TenantID:             tenantID,
		LoginAuthEndpoint:    cfg.LTI.LoginAuthEndpoint,
		JWKEndpoint:          cfg.LTI.JWKEndpoint,
		ServiceAuthEndpoint:  cfg.LTI.ServiceAuthEndpoint,
		ServiceLoginEndpoint: cfg.LTI.ServiceLoginEndpoint,
	})
	if err != nil {
		fatalf("failed to register LTI registration: %v", err)
	}

	fmt.Printf(
		"registered tenant+lti successfully\n  tenant_id=%d\n  lms_key=%s\n  issuer=%s\n  client_id=%s\n",
		tenantID,
		lmsKey,
		cfg.LTI.Issuer,
		cfg.LTI.ClientID,
	)
}

func loadConfig(path string) (config, error) {
	var cfg config

	raw, err := os.ReadFile(path)
	if err != nil {
		return cfg, err
	}

	if err := yaml.Unmarshal(raw, &cfg); err != nil {
		return cfg, err
	}

	if err := validateConfig(cfg); err != nil {
		return cfg, err
	}

	return cfg, nil
}

func validateConfig(cfg config) error {
	if strings.TrimSpace(cfg.Tenant.LMSKey) == "" {
		return errors.New("tenant.lms_key is required")
	}

	if strings.TrimSpace(cfg.LTI.Issuer) == "" {
		return errors.New("lti.issuer is required")
	}

	if strings.TrimSpace(cfg.LTI.ClientID) == "" {
		return errors.New("lti.client_id is required")
	}

	if strings.TrimSpace(cfg.LTI.LoginAuthEndpoint) == "" {
		return errors.New("lti.login_auth_endpoint is required")
	}

	if strings.TrimSpace(cfg.LTI.JWKEndpoint) == "" {
		return errors.New("lti.jwk_endpoint is required")
	}

	if strings.TrimSpace(cfg.LTI.ServiceAuthEndpoint) == "" {
		return errors.New("lti.service_auth_endpoint is required")
	}

	if strings.TrimSpace(cfg.LTI.ServiceLoginEndpoint) == "" {
		return errors.New("lti.service_login_endpoint is required")
	}

	if len(cfg.LMS) == 0 {
		return errors.New("lms section is required")
	}

	if lmsKey, _ := cfg.LMS["lms_key"].(string); strings.TrimSpace(lmsKey) == "" {
		return errors.New("lms.lms_key is required")
	}

	return nil
}

func fatalf(format string, args ...any) {
	fmt.Fprintf(os.Stderr, format+"\n", args...)
	os.Exit(1)
}
