# Offering Eventing as a platform capability using Knative Eventing with Apache Kafka

Reference architecture for offering Eventing capabilities in Kubernetes or OpenShift as a platform
team using Knative Eventing with Apache Kafka.

## Installation on OpenShift

### Prerequisites

- Administrator access to an OpenShift cluster

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
