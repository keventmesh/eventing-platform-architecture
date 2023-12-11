## Kafka secrets transformer

Kafka secrets transformer is a Strimzi supporting service based on https://github.com/kluctl/kluctl
which makes `KafkaUser` secrets compatible with Knative Kafka Broker secrets format and distributes
them to user's namespaces.

### Updating manifests

```shell
kustomize build https://github.com/kluctl/template-controller/config/install?ref=v0.7.1 > platform/manifests/kafka-secrets-transformer/kafka-secrets-transformer.yaml
```