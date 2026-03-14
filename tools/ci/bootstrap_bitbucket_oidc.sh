#!/usr/bin/env sh

set -eu

role_arn="${1:?usage: bootstrap_bitbucket_oidc.sh <aws-role-arn>}"
token_file="${2:-$PWD/.bitbucket-oidc-token}"

: "${BITBUCKET_STEP_OIDC_TOKEN:?BITBUCKET_STEP_OIDC_TOKEN is required}"
: "${AWS_DEFAULT_REGION:?AWS_DEFAULT_REGION is required}"

printf '%s' "$BITBUCKET_STEP_OIDC_TOKEN" > "$token_file"

export AWS_ROLE_ARN="$role_arn"
export AWS_WEB_IDENTITY_TOKEN_FILE="$token_file"
export AWS_REGION="$AWS_DEFAULT_REGION"
export AWS_SDK_LOAD_CONFIG=1
