---
title: Scaling Kubernetes Workloads with KEDA and Volcano
description: Separate demand detection from scheduling so event-driven workers scale without overwhelming queues, nodes, or batch guarantees.
date: 2026-09-05
category: Kubernetes & Platform
tags: [KEDA, Volcano, Kubernetes, Autoscaling]
cover: /blog/scaling-kubernetes-workloads-keda-volcano/cover.png
draft: false
---
KEDA and Volcano solve different control loops.

- **KEDA** decides how much work should exist from event signals such as Kafka lag.
- **Volcano** decides when and where batch-oriented work can run under queue, priority, and gang-scheduling constraints.

Using both works when those responsibilities stay separate. Scaling creates demand; scheduling admits demand onto finite cluster capacity.

## Scale from work, not CPU alone

CPU utilization is often late for queue consumers. Kafka lag already describes unfinished work, so it can drive worker creation directly.

A `ScaledJob` can create Kubernetes Jobs and ask Volcano to schedule their pods:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledJob
metadata:
  name: event-reprocessor
  namespace: data-jobs
spec:
  pollingInterval: 30
  maxReplicaCount: 40
  jobTargetRef:
    template:
      spec:
        schedulerName: volcano
        restartPolicy: Never
        containers:
          - name: worker
            image: registry.example.com/event-reprocessor:1.4.0
            resources:
              requests:
                cpu: "1"
                memory: 2Gi
  triggers:
    - type: kafka
      metadata:
        bootstrapServers: kafka.data.svc:9092
        consumerGroup: event-reprocessor
        topic: events
        lagThreshold: "500"
```

Treat values as calibration points. Throughput per worker, partition count, startup time, and retry cost determine useful limits.

## Put capacity boundaries around scaling

`maxReplicaCount` prevents one backlog from creating unbounded demand, but scheduling policy still needs cluster-level controls.

Volcano queues and priorities can protect critical workloads when several teams submit jobs together. Gang scheduling is useful when a distributed workload is valuable only after all required pods can start.

| Control | Owns | Failure it prevents |
| --- | --- | --- |
| KEDA trigger | Demand signal | Idle workers or ignored backlog |
| Maximum replicas | Workload ceiling | Runaway object creation |
| Resource requests | Pod footprint | Unsafe bin packing |
| Volcano queue | Shared capacity | One team consuming the cluster |
| Priority | Admission order | Critical work waiting behind bulk jobs |
| Gang scheduling | Coordinated start | Partial distributed workloads |

## Avoid competing control loops

Do not let multiple autoscalers write the same replica field. Do not assume more Jobs always reduce lag; a topic with eight partitions cannot keep forty consumers busy in one group.

Check these constraints before raising limits:

- [ ] Partition count supports planned parallelism.
- [ ] Downstream databases and APIs can absorb peak concurrency.
- [ ] Pod requests reflect measured worker usage.
- [ ] Queue quotas reserve capacity for critical workloads.
- [ ] Failed Jobs have bounded retry and cleanup policies.

## Test the whole response curve

Inject a known backlog and measure time to detection, pod admission, image pull, worker readiness, lag reduction, and scale-down. A dashboard showing replica count alone hides scheduling wait and cold-start cost.

Use [KEDA ScaledJob documentation](https://keda.sh/docs/latest/concepts/scaling-jobs/) and [Volcano documentation](https://volcano.sh/en/docs/) to confirm fields and scheduling features for your deployed versions.
