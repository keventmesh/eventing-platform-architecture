#!/usr/bin/env bash

export DEMO=${DEMO-""}

set -euo pipefail

current_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

readonly cluster_domain="$(oc get ingresses.config/cluster -o jsonpath='{.spec.domain}')"
readonly APICURIO_REGISTRY_API="http://apicurio-registry.apicurio-registry.router-default.${cluster_domain}"

function upload_schema() {

  local schema="$1"
  local type="$2"
  local id="$3"

  curl -k -X POST "${APICURIO_REGISTRY_API}/apis/registry/v2/groups/event-discovery/artifacts" \
    -H "Content-Type: application/json" \
    -H "X-Registry-ArtifactId: ${id}" \
    -H "X-Registry-ArtifactType: ${type}" \
    -d "@${schema}"

  curl -k -X PUT "${APICURIO_REGISTRY_API}/apis/registry/v2/groups/event-discovery/artifacts/${id}" \
    -H "Content-Type: application/json" \
    -H "X-Registry-ArtifactType: ${type}" \
    -d "@${schema}"
  echo ''
}

function wait_ready_resource() {
  resource="$1"

  if [[ $(kubectl get "${resource}" -A -o go-template='{{printf "%d\n" (len  .items)}}') != 0 ]]; then
    kubectl wait "${resource}" --for=condition=Ready=true --timeout=20m -A --all || return $?
  fi
}

function wait_ready() {
  wait_ready_resource "brokers.eventing.knative.dev" || return $?
  wait_ready_resource "triggers.eventing.knative.dev" || return $?
  wait_ready_resource "kafkasinks.eventing.knative.dev" || return $?
  wait_ready_resource "kafkasources.sources.knative.dev" || return $?
  wait_ready_resource "pingsources.sources.knative.dev" || return $?
  wait_ready_resource "kameletbindings.camel.apache.org" || return $?
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

echo "=============================="
echo "== Deploying demo resources =="
echo "=============================="

upload_schema "${current_dir}/demo-applications/event-discovery/schemas/order.json" "JSON" "online-order-schema"
echo EVENT_SCHEMA_ORDER="${APICURIO_REGISTRY_API}/ui/artifacts/event-discovery/online-order-schema" > "${current_dir}/demo-applications/event-discovery/.env"

upload_schema "${current_dir}/demo-applications/event-discovery/schemas/cart-changed.json" "JSON" "cart-changed"
echo EVENT_SCHEMA_CART_CHANGED="${APICURIO_REGISTRY_API}/ui/artifacts/event-discovery/cart-changed" >> "${current_dir}/demo-applications/event-discovery/.env"

apply "${current_dir}/demo-kafka-resources/${DEMO}"
apply "${current_dir}/demo-applications/${DEMO}"


if [[ "${DEMO}" == "event-discovery" ]]; then
  # This is a temporary solution to use the OCP console version 4.18 on OCP 4.17 or less.
  kubectl patch consoles.operator.openshift.io cluster --type merge -p  '{"spec":{"managementState": "Unmanaged"}}'
  kubectl patch deployment.apps -n openshift-console console \
    -p '{"spec":{"template":{"spec":{"containers":[{"name":"console","image":"quay.io/pierdipi/openshift-console:4.18"}]}}}}'
fi
