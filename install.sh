#!/usr/bin/env bash

set -euo pipefail

current_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

function apply() {
  dir="$1"

  while ! kustomize build "${dir}" | kubectl apply -f -;
  do
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-serverless serverless-operator
    kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-operators amq-streams
    echo "waiting for resource apply to succeed"
    sleep 10
  done
}

apply "${current_dir}/platform/manifests"

helm repo add mittwald https://helm.mittwald.de
helm repo update

helm upgrade --install strimzi-secrets-replicator mittwald/kubernetes-replicator \
  --version "2.9.1" \
  --namespace "kafka" \
  -f "${current_dir}/platform/manifests/kafka-secrets-replicator/values.yaml"

apply "${current_dir}/demo-kafka-resources"
apply "${current_dir}/demo-applications"

