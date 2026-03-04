package auth

# /api/auth/register
allow if {
  input.attributes.request.http.path == "/api/auth/register"
  input.attributes.request.http.method == "POST"
}

# /api/auth/login
allow if {
  input.attributes.request.http.path == "/api/auth/login"
  input.attributes.request.http.method == "POST"
}

# /api/auth/logout
allow if {
  input.attributes.request.http.path == "/api/auth/logout"
  input.attributes.request.http.method == "POST"
}
