# Gerrit Setup Instructions for ATC Capital

## Projects to create

Run the following `ssh` commands against your Gerrit instance (or use the Admin UI):

```bash
# Replace GERRIT_HOST and GERRIT_PORT accordingly
GERRIT="ssh -p $GERRIT_PORT $GERRIT_HOST gerrit"

$GERRIT create-project infra/openstack-atc \
  --description "ATC Capital OpenStack Infrastructure as Code" \
  --submit-type MERGE_IF_NECESSARY \
  --require-change-id

$GERRIT create-project apps/atc-capital-core \
  --description "ATC Capital Core Application Services" \
  --submit-type MERGE_IF_NECESSARY \
  --require-change-id

$GERRIT create-project ci/jenkins-pipelines \
  --description "ATC Capital Jenkins Shared Pipeline Libraries and Jenkinsfiles" \
  --submit-type MERGE_IF_NECESSARY \
  --require-change-id
```

## Groups to create

| Group name                | Purpose                                                        |
|---------------------------|----------------------------------------------------------------|
| ATC Capital Owners        | Founder and designated owners; approve STAGE/PROD deployments |
| Infra Leads               | Senior infra engineers; approve STAGE/PROD infra changes       |
| Infra Engineers           | All infrastructure engineers                                   |
| App Leads                 | Senior application engineers; approve STAGE/PROD app changes   |
| Developers                | All application developers                                     |
| DevOps Engineers          | CI/CD and platform engineers                                   |
| Jenkins Service Account   | CI bot – posts Verified votes                                  |
| Gerrit Service Account    | Merge bot – merges after sufficient approvals                  |

Create each group via Admin → Groups in the Gerrit UI, then populate the `groups` file with real UUIDs.

## Applying project configs

After creating each project, push the `project.config` from this directory to the
`refs/meta/config` ref of each Gerrit project:

```bash
# Example for infra/openstack-atc
git clone ssh://$GERRIT_HOST:$GERRIT_PORT/infra/openstack-atc
cd infra-openstack-atc
git fetch origin refs/meta/config:refs/meta/config
git checkout refs/meta/config
cp /path/to/infra-openstack-atc.config project.config
git add project.config
git commit -m "Apply ATC Capital governance config"
git push origin HEAD:refs/meta/config
```

Repeat for `apps/atc-capital-core` and `ci/jenkins-pipelines`.

## Labels

The Verified and Code-Review labels are defined per-project in the `.config` files.
If you use a shared All-Projects config, move the label definitions there and remove
duplicates from individual project configs.

## Jenkins integration

1. In Jenkins, install the **Gerrit Trigger** plugin.
2. Configure a Gerrit server connection with the Jenkins service account credentials.
3. Grant the Jenkins service account `label-Verified -1..+1` on all relevant projects.
4. Set up triggers per `Jenkinsfile.infra-validate` (patchset-created) and
   `Jenkinsfile.infra-apply` (change-merged).
