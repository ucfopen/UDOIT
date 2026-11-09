package auth

import "github.com/gin-gonic/gin"

const principalKey = "auth.principal"

func SetPrincipal(c *gin.Context, principal Principal) {
	c.Set(principalKey, principal)
}

func GetPrincipal(c *gin.Context) (Principal, bool) {
	val, exists := c.Get(principalKey)
	if !exists {
		return Principal{}, false
	}

	principal, ok := val.(Principal)
	return principal, ok
}
