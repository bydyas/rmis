package envoy.main

default allow = false

allow if { data.admin.allow }
allow if { data.swagger.allow }
allow if { data.auth.allow }
allow if { data.users.allow }
