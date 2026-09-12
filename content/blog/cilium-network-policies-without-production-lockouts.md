---
title: Cilium Network Policies Without Production Lockouts
description: A staged method for introducing default-deny controls while preserving DNS, health checks, and the traffic paths operators need.
date: 2026-09-08
category: Kubernetes & Platform
tags: [Cilium, Kubernetes, Networking, Security]
cover: /blog/cilium-network-policies-without-production-lockouts/cover.jpg
draft: false
---
Network policy failures are rarely subtle. A missing rule can break DNS, health probes, metrics, or a dependency that only runs during reconciliation. The safe rollout is not “write policy, enable default deny, hope.” It is observe, allow, deny, and verify.

> Default deny should be the final step of discovery, not the first step of policy design.

## Map traffic before enforcing policy

Start with the workload boundary. Record every expected flow for one service:

- Which namespaces and service accounts may call it?
- Which ports does it expose?
- Which cluster services does it need, including DNS?
- Which external APIs or databases does it reach?
- Which probes, metrics collectors, and operators touch it?

Cilium Hubble is useful here because it exposes forwarded and dropped flows using the same endpoint identity model that policy enforcement uses. Observe normal traffic and a deployment cycle; startup often reveals dependencies steady-state traffic misses.

## Add explicit allows first

Apply allow rules while traffic is still unrestricted. That lets teams review selectors and ports without causing an outage.

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: checkout-access
  namespace: shop
spec:
  endpointSelector:
    matchLabels:
      app: checkout
  ingress:
    - fromEndpoints:
        - matchLabels:
            k8s:io.kubernetes.pod.namespace: shop
            app: storefront
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
  egress:
    - toEndpoints:
        - matchLabels:
            k8s:io.kubernetes.pod.namespace: kube-system
            k8s:k8s-app: kube-dns
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
          rules:
            dns:
              - matchPattern: "*"
```

Treat this as a starting point, not a universal policy. Labels and DNS endpoints differ between clusters.

## Introduce default deny in a small blast radius

Begin with one namespace and one non-critical workload. Keep rollback ready in Git and test from both allowed and denied callers.

1. Confirm expected requests still succeed.
2. Confirm an unauthorized test pod is denied.
3. Restart the deployment and watch readiness.
4. Trigger reconciliation from operators that manage the workload.
5. Check Hubble for new drops.
6. Remove the deny policy and confirm rollback restores traffic.

| Check | Expected result |
| --- | --- |
| Service-to-service call | Allowed only from selected identity |
| DNS lookup | Allowed |
| Readiness and liveness probes | Healthy |
| Metrics scrape | Allowed when required |
| Unknown pod | Denied |

## Keep an operator escape path

A policy incident needs a documented response: who can revert, which policy owns the boundary, and how to inspect drops. Do not solve emergencies with broad permanent exceptions. Revert the narrow policy, capture the missing flow, then add the smallest durable rule.

Read the [Cilium network policy documentation](https://docs.cilium.io/en/stable/security/policy/) for selector and policy-language details that match your installed version.
