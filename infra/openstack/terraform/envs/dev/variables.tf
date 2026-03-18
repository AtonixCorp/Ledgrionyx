variable "os_auth_url" {
  type        = string
  description = "OpenStack Keystone auth URL."
}

variable "os_region" {
  type        = string
  description = "OpenStack region name."
  default     = "RegionOne"
}

variable "os_application_credential_id" {
  type        = string
  description = "OpenStack application credential ID – injected by Jenkins from Vault."
  sensitive   = true
}

variable "os_application_credential_secret" {
  type        = string
  description = "OpenStack application credential secret – injected by Jenkins from Vault."
  sensitive   = true
}

variable "main_cidr" {
  type    = string
  default = "10.10.0.0/24"
}

variable "backend_cidr" {
  type    = string
  default = "10.10.1.0/24"
}

variable "external_network_id" {
  type        = string
  description = "OpenStack external network UUID for floating-IP allocation."
}

variable "floating_ip_pool" {
  type    = string
  default = "public"
}

variable "dns_nameservers" {
  type    = list(string)
  default = ["8.8.8.8", "8.8.4.4"]
}

variable "trusted_ssh_cidrs" {
  type        = list(string)
  description = "CIDR blocks permitted to SSH to the bastion. Keep this minimal."
}

variable "ssh_public_key" {
  type      = string
  sensitive = true
}

variable "base_image_name" {
  type    = string
  default = "Ubuntu-22.04-LTS"
}

variable "bastion_flavor" {
  type    = string
  default = "m1.small"
}

variable "api_flavor" {
  type    = string
  default = "m1.medium"
}

variable "db_flavor" {
  type    = string
  default = "m1.large"
}

variable "ledger_volume_size_gb" {
  type    = number
  default = 50
}

variable "db_volume_size_gb" {
  type    = number
  default = 100
}

variable "change_id" {
  type        = string
  description = "Gerrit change ID injected by Jenkins at apply time."
}

variable "commit" {
  type        = string
  description = "Short Git commit SHA injected by Jenkins at apply time."
}
