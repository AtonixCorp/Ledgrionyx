variable "os_auth_url" { type = string }
variable "os_region" { type = string; default = "RegionOne" }
variable "os_application_credential_id" { type = string; sensitive = true }
variable "os_application_credential_secret" { type = string; sensitive = true }
variable "main_cidr" { type = string; default = "10.20.0.0/24" }
variable "backend_cidr" { type = string; default = "10.20.1.0/24" }
variable "external_network_id" { type = string }
variable "floating_ip_pool" { type = string; default = "public" }
variable "dns_nameservers" { type = list(string); default = ["8.8.8.8", "8.8.4.4"] }
variable "trusted_ssh_cidrs" { type = list(string) }
variable "ssh_public_key" { type = string; sensitive = true }
variable "base_image_name" { type = string; default = "Ubuntu-22.04-LTS" }
variable "bastion_flavor" { type = string; default = "m1.small" }
variable "api_flavor" { type = string; default = "m1.medium" }
variable "db_flavor" { type = string; default = "m1.large" }
variable "ledger_volume_size_gb" { type = number; default = 50 }
variable "db_volume_size_gb" { type = number; default = 100 }
variable "change_id" { type = string }
variable "commit" { type = string }
