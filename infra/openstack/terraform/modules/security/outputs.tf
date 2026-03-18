output "api_secgroup_id" {
  description = "ID of the API security group."
  value       = openstack_networking_secgroup_v2.api.id
}

output "db_secgroup_id" {
  description = "ID of the database security group."
  value       = openstack_networking_secgroup_v2.db.id
}

output "bastion_secgroup_id" {
  description = "ID of the bastion security group."
  value       = openstack_networking_secgroup_v2.bastion.id
}

output "monitoring_secgroup_id" {
  description = "ID of the monitoring security group."
  value       = openstack_networking_secgroup_v2.monitoring.id
}
