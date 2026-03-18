variable "env" {
  type        = string
  description = "Environment name: dev | test | stage | prod"

  validation {
    condition     = contains(["dev", "test", "stage", "prod"], var.env)
    error_message = "env must be one of: dev, test, stage, prod."
  }
}

variable "main_cidr" {
  type        = string
  description = "CIDR block for the main subnet."
}

variable "backend_cidr" {
  type        = string
  description = "CIDR block for the backend subnet."
}

variable "external_network_id" {
  type        = string
  description = "OpenStack external (provider) network ID used as router gateway."
}

variable "dns_nameservers" {
  type        = list(string)
  description = "DNS nameservers injected into both subnets."
  default     = ["8.8.8.8", "8.8.4.4"]
}

variable "change_id" {
  type        = string
  description = "Gerrit change ID associated with this apply – injected by Jenkins."
}

variable "commit" {
  type        = string
  description = "Short Git commit SHA – injected by Jenkins."
}
