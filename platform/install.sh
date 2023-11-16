#!/usr/bin/env bash

current_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

while ! kustomize build "${current_dir}/manifests" | envsubst | kubectl apply -f -;
do
  kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-serverless serverless-operator
  kubectl wait subscriptions.operators.coreos.com --for=condition=CatalogSourcesUnhealthy=false --timeout=20m -n openshift-operators amq-streams
  echo "waiting for resource apply to succeed"
  sleep 10
done
