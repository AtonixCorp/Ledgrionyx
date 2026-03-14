#!/usr/bin/env sh

set -eu

environment_name="${1:?usage: render_terraform_auto_tfvars.sh <environment>}"
upper_environment="$(printf '%s' "$environment_name" | tr '[:lower:]' '[:upper:]')"

read_env() {
  variable_name="$1"
  eval "printf '%s' \"\${$variable_name-}\""
}

require_env() {
  variable_name="$1"
  value="$(read_env "$variable_name")"
  if [ -z "$value" ]; then
    echo "Missing required environment variable: $variable_name" >&2
    exit 1
  fi
  printf '%s' "$value"
}

availability_zones="$(require_env "${upper_environment}_TF_AVAILABILITY_ZONES_JSON")"
db_username="$(require_env "${upper_environment}_TF_DB_USERNAME")"
db_password="$(require_env "${upper_environment}_TF_DB_PASSWORD")"
artifact_bucket_name="$(require_env "${upper_environment}_TF_ARTIFACT_BUCKET_NAME")"
secret_arns="$(require_env "${upper_environment}_TF_SECRET_ARNS_JSON")"
ecr_repository_arns="$(require_env "${upper_environment}_TF_ECR_REPOSITORY_ARNS_JSON")"
state_bucket_arn="$(require_env "${upper_environment}_TF_STATE_BUCKET_ARN")"
state_lock_table_arn="$(require_env "${upper_environment}_TF_STATE_LOCK_TABLE_ARN")"
oidc_provider_arn="$(require_env "BITBUCKET_OIDC_PROVIDER_ARN")"
oidc_subject_claim="$(require_env "BITBUCKET_OIDC_SUBJECT_CLAIM")"
oidc_audience_claim="$(require_env "BITBUCKET_OIDC_AUDIENCE_CLAIM")"
oidc_audience="$(require_env "BITBUCKET_OIDC_AUDIENCE")"
oidc_subjects="$(require_env "BITBUCKET_OIDC_SUBJECTS_JSON")"

export TF_VAR_aws_region="$AWS_DEFAULT_REGION"
export TF_VAR_availability_zones="$availability_zones"
export TF_VAR_db_username="$db_username"
export TF_VAR_db_password="$db_password"
export TF_VAR_artifact_bucket_name="$artifact_bucket_name"
export TF_VAR_secret_arns="$secret_arns"
export TF_VAR_bitbucket_oidc_provider_arn="$oidc_provider_arn"
export TF_VAR_bitbucket_oidc_subject_claim="$oidc_subject_claim"
export TF_VAR_bitbucket_oidc_audience_claim="$oidc_audience_claim"
export TF_VAR_bitbucket_oidc_audience="$oidc_audience"
export TF_VAR_bitbucket_oidc_subjects="$oidc_subjects"
export TF_VAR_ecr_repository_arns="$ecr_repository_arns"
export TF_VAR_state_bucket_arn="$state_bucket_arn"
export TF_VAR_state_lock_table_arn="$state_lock_table_arn"
