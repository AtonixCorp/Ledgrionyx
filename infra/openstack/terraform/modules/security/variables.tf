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
  description = "CIDR of the main subnet – used for internal rule scoping."
}

variable "backend_cidr" {
  type        = string
  description = "CIDR of the backend subnet – used to scope DB and app-port rules."
}

variable "trusted_ssh_cidrs" {
  type        = list(string)
  description = "CIDR blocks allowed to SSH into the bastion. Keep this list minimal."
}

variable "change_id" {
  type        = string
  description = "Gerrit change ID injected by Jenkins."
}

variable "commit" {
  type        = string
  description = "Short Git commit SHA injected by Jenkins."
}
