package admin

import data.roles
import data.jwt

allow if {
  jwt.claims.role == roles.ADMIN
}