package swagger

swagger_paths := {
  "/api",
  "/api/swagger-ui.css",
  "/api/swagger-ui-init.js",
  "/api/swagger-ui-bundle.js",
  "/api/swagger-ui-standalone-preset.js",
  "/api/favicon-32x32.png",
  "/api/favicon-16x16.png",
}

allow if {
  input.attributes.request.http.method == "GET"
  input.attributes.request.http.path in swagger_paths
}
