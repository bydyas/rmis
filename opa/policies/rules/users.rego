package users

import data.roles
import data.jwt

# /api/users/:id
allow if {
  input.attributes.request.http.method == "GET"
  regex.match(`^/api/users/[^/]+$`, input.attributes.request.http.path)
  jwt.claims.role == roles.MANAGER
}
