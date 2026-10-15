package internal

import (
	"rewritetest/internal/auth/internal/application"
	"rewritetest/internal/shared/apperr"
	sharedAuth "rewritetest/internal/shared/auth"

	"github.com/gin-gonic/gin"
)

const authCookieName = "AUTH_TOKEN"

func GetAuthMiddleware(getPrincipalFromSessionUseCase *application.GetPrincipalFromSessionUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		authToken, err := c.Cookie(authCookieName)
		if err != nil || authToken == "" {
			c.Error(
				apperr.Unauthorized(),
			)
			c.Abort()
			return
		}

		getPrincipalFromSessionQuery := application.GetPrincipalFromSessionQuery{
			SessionID: authToken,
		}

		principal, err := getPrincipalFromSessionUseCase.Execute(c.Request.Context(), getPrincipalFromSessionQuery)
		if err != nil {
			c.Error(
				apperr.Unauthorized(apperr.WithCause(err)),
			)
			c.Abort()
			return
		}

		sharedAuth.SetPrincipal(c, principal)

		c.Next()
	}
}
