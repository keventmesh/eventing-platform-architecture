#!/usr/bin/env bash

set -euo pipefail

current_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

function wait_ready() {
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-operators-redhat elasticsearch-operator || return $?
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-distributed-tracing jaeger-product || return $?
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-operators amq-streams || return $?
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-serverless serverless-operator || return $?
#    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n red-hat-camel-k red-hat-camel-k || return $?
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
echo "== Deploying platform components =="
echo "==================================="

apply "${current_dir}/platform/manifests"

