#!/usr/bin/env bash

set -euo pipefail

current_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

function write_backstage_env_file {
  local cluster_domain
  cluster_domain="$(oc get ingresses.config/cluster -o jsonpath='{.spec.domain}')"
  # The prefix is basically `https://<backstage-route-name>-<backstage-route-namespace>.`
  local env_file="${current_dir}/platform/manifests/backstage/secrets/.env"

  echo "BACKSTAGE_BASE_URL=https://backstage-route-backstage.${cluster_domain}" > "${env_file}"

  github_app_file="${current_dir}/../github-app-backstage-keventmesh-credentials.yaml"
  appId=$(yq r "${github_app_file}" 'appId')
  clientId=$(yq r "${github_app_file}" 'clientId')
  clientSecret=$(yq r "${github_app_file}" 'clientSecret')
  webhookSecret=$(yq r "${github_app_file}" 'webhookSecret')
  {
   echo "AUTH_ORG_APP_ID=${appId}";
   echo "AUTH_ORG_CLIENT_ID=${clientId}";
   echo "AUTH_ORG_CLIENT_SECRET=${clientSecret}";
   echo "AUTH_ORG_WEBHOOK_SECRET=${webhookSecret}";
  } >> "${env_file}"

  yq r "${github_app_file}" 'privateKey' > "$(dirname "${env_file}")/AUTH_ORG_PRIVATE_KEY";
}


function wait_ready() {
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-operators-redhat elasticsearch-operator || return $?
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-distributed-tracing jaeger-product || return $?
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-operators amq-streams || return $?
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-serverless serverless-operator || return $?
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n red-hat-camel-k red-hat-camel-k || return $?
    kubectl wait knativeeventing knative-eventing --for=condition=Ready=true --timeout=20m -n knative-eventing || return $?
    kubectl wait kafkas --for=condition=Ready=true --timeout=20m -A --all || return $?
}

function apply() {
  dir="$1"

  while ! kustomize build "${dir}" | kubectl apply -f -;
  do
    wait_ready || sleep 10
    echo "waiting for resource apply to succeed"
    sleep 10
  done

  wait_ready
}

echo "==================================="
echo "== Writing backstage environments ="
echo "==================================="

write_backstage_env_file

echo "==================================="
echo "== Deploying platform components =="
echo "==================================="

apply "${current_dir}/platform/manifests"

