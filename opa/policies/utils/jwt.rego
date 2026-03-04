package jwt

# Extract token from Authorization: Bearer header
claims := payload if {
  auth_header := input.attributes.request.http.headers.authorization
  startswith(auth_header, "Bearer ")
  token := substring(auth_header, 7, -1)
  [_, payload, _] := io.jwt.decode(token)
}
