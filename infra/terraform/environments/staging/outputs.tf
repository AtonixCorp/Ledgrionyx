output "cluster_name" { value = module.kubernetes_cluster.cluster_name }
output "cluster_endpoint" { value = module.kubernetes_cluster.cluster_endpoint }
output "database_endpoint" { value = module.database.endpoint }
output "artifact_bucket" { value = module.object_storage.bucket_id }
output "ci_cd_role_arn" { value = module.identity_access.ci_cd_role_arn }
output "alb_security_group_id" { value = module.load_balancer.security_group_id }