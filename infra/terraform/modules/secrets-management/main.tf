data "aws_iam_policy_document" "secrets_access" {
  statement {
    actions = [
      "secretsmanager:DescribeSecret",
      "secretsmanager:GetSecretValue",
      "secretsmanager:ListSecretVersionIds",
    ]

    resources = var.secret_arns
  }
}

resource "aws_iam_policy" "this" {
  name   = "${var.name_prefix}-secrets-access"
  policy = data.aws_iam_policy_document.secrets_access.json
}