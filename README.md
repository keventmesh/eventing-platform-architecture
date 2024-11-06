# Offering Eventing as a platform capability using Knative Eventing with Apache Kafka

Reference architecture for offering Eventing capabilities in Kubernetes or OpenShift as a platform
team using Knative Eventing with Apache Kafka.

## How to use this repository

This repository is meant to provide guidance on configuring OpenShift operators to offer Eventing
capabilities in Kubernetes or OpenShift as a platform team using Knative Eventing with Apache Kafka
but resource requests, limits and storage are on the _very_ low-end for demo purposes and to avoid
wasting resources during demos.

For production deployments, we recommend revisiting "sizing" related subjects, such as:

- Knative Eventing resource requests, limits, and replicas
- Apache Kafka cluster and Strimzi operators resource requests, limits, storage size, and replicas
- Jaeger resource requests, limits, storage size, and replicas

## Installation on OpenShift

### Prerequisites

- Administrator access to an OpenShift cluster

#### Create a GitHub application for Backstage

```shell
backstage-cli create-github-app keventmesh  # Replace `keventmesh` with your org name
```

and then place the credentials file in the parent directory of this repository in a file
called `github-app-backstage-keventmesh-credentials.yaml`.

### Installation

```shell
./install.sh
```

#### [Optional] Install demo resources

```shell
./install-demo-resources.sh
```

### Onboarding a new project

When we need to onboard a new namespace to a platform configured following this architecture we need
to follow a few steps:

- Create a `KafkaUser` to give the project access to the Apache Kafka cluster.
    - see examples:
        - [demo-managed](./demo-kafka-resources/demo-managed/demo-managed-user.yaml)
        - [demo-external](./demo-kafka-resources/demo-external/demo-external-user.yaml))
- If we've opted to
  use [Knative's "bring your own topic"](https://knative.dev/docs/eventing/brokers/broker-types/kafka-broker/#bring-your-own-topic)
  we need to pre-provision _all_ the topics in the Apache Kafka cluster that the project will need
  to use.
    - see examples:
        - [demo-external broker topic](./demo-kafka-resources/demo-external/demo-external-topic.yaml)
        - [demo-external dead letter sink topic](./demo-kafka-resources/demo-external/demo-external-topic-dead-letter-sink.yaml)).
- Distribute the credentials associated with the previously created `KafkaUser` to the user's
  namespace.
    - In our case, we configure [kluctl](https://kluctl.io/docs/template-controller/) to propagate
      the secret that Strimzi operator creates in the `Kafka` cluster namespace (`kafka` in our
      case) to the user's namespace with
      the [Knative Eventing expected secret format](https://knative.dev/docs/eventing/brokers/broker-types/kafka-broker/#security)
