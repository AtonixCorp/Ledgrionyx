output "main_network_id" {
  description = "ID of the main tenant network."
  value       = openstack_networking_network_v2.main.id
}

output "main_subnet_id" {
  description = "ID of the main subnet."
  value       = openstack_networking_subnet_v2.main.id
}

output "backend_network_id" {
  description = "ID of the backend network."
  value       = openstack_networking_network_v2.backend.id
}

output "backend_subnet_id" {
  description = "ID of the backend subnet."
  value       = openstack_networking_subnet_v2.backend.id
}

output "router_id" {
  description = "ID of the main router."
  value       = openstack_networking_router_v2.main.id
}
