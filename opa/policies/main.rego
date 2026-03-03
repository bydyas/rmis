package envoy.main

default allow = false

# Swagger UI
allow if {
  startswith(input.attributes.request.http.path, "/api")
  input.attributes.request.http.method == "GET"
  not startswith(input.attributes.request.http.path, "/api/users/")
}

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

# /api/users/:id
allow if {
  input.attributes.request.http.method == "GET"
  regex.match(`^/api/users/[^/]+$`, input.attributes.request.http.path)
  claims.role == "admin"
}

claims := payload if {
  auth_header := input.attributes.request.http.headers.authorization
  startswith(auth_header, "Bearer ")
  token := substring(auth_header, 7, -1)
  [_, payload, _] := io.jwt.decode(token)
}
