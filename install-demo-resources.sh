#!/usr/bin/env bash

set -euo pipefail

current_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

function wait_ready() {
    kubectl wait brokers.eventing.knative.dev --for=condition=Ready=true --timeout=20m -A --all || return $?
    kubectl wait triggers.eventing.knative.dev --for=condition=Ready=true --timeout=20m -A --all || return $?
    kubectl wait kafkasinks.eventing.knative.dev --for=condition=Ready=true --timeout=20m -A --all || return $?
    kubectl wait pingsources.sources.knative.dev --for=condition=Ready=true --timeout=20m -A --all || return $?
#    kubectl wait kameletbindings.camel.apache.org --for=condition=Ready=true --timeout=20m -A --all || return $?
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

apply "${current_dir}/demo-kafka-resources"
apply "${current_dir}/demo-applications"

