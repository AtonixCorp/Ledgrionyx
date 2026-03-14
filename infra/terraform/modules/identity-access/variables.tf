variable "name_prefix" {
  type = string
}

variable "bitbucket_oidc_provider_arn" {
  type = string
}

variable "oidc_subject_claim" {
  type = string
}

variable "oidc_audience_claim" {
  type = string
}

variable "oidc_audience" {
  type = string
}

variable "oidc_subjects" {
  type = list(string)
}

variable "ecr_repository_arns" {
  type = list(string)
}

variable "state_bucket_arn" {
  type = string
}

variable "state_lock_table_arn" {
  type = string
}

variable "additional_policy_arns" {
  type    = list(string)
  default = []
}

variable "tags" {
  type    = map(string)
  default = {}
}