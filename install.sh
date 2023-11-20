#!/usr/bin/env bash

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
apply "${current_dir}/demo-kafka-resources"
