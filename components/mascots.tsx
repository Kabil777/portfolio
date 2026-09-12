import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

type MascotProps = {
  className?: string;
};

export function TerminalBuddy({ className }: MascotProps) {
  const tools = [
    ["Spark", "/logos/spark.svg"],
    ["Iceberg", "/logos/iceberg-symbol.svg"],
    ["Kafka", "/logos/kafka.svg"],
    ["K8s", "/logos/kubernetes.svg"],
    ["Argo CD", "/logos/argo.svg"],
    ["Prometheus", "/logos/prometheus.svg"],
    ["Grafana", "/logos/grafana.svg"],
    ["OTel", "/logos/otel.svg"],
  ] as const;

  return (
    <svg
      className={className}
      viewBox="0 0 520 360"
      role="img"
      aria-labelledby="terminal-buddy-title"
    >
      <title id="terminal-buddy-title">
        Operations dashboard with charts, logs, and platform tool logos
      </title>

      <rect
        x="4"
        y="4"
        width="512"
        height="352"
        rx="12"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="5"
      />

      {/* Terminal-style header: controls only, no title. */}
      <path
        d="M16 4h488a12 12 0 0 1 12 12v24H4V16A12 12 0 0 1 16 4Z"
        fill="var(--foreground)"
      />
      <circle cx="24" cy="22" r="6" fill="var(--primary)" />
      <circle cx="44" cy="22" r="6" fill="var(--secondary)" />
      <circle cx="64" cy="22" r="6" fill="var(--success)" />

      {/* Throughput chart. */}
      <rect
        x="14"
        y="50"
        width="258"
        height="108"
        rx="7"
        fill="var(--background)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text
        x="26"
        y="68"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="9"
        fontWeight="800"
      >
        PIPELINE THROUGHPUT
      </text>
      {[84, 104, 124, 144].map((y) => (
        <line
          key={y}
          x1="26"
          y1={y}
          x2="260"
          y2={y}
          stroke="var(--foreground)"
          strokeWidth="0.5"
          opacity="0.13"
        />
      ))}
      <polygon
        points="28,138 60,126 92,132 124,106 156,96 188,102 220,82 258,72 258,148 28,148"
        fill="var(--success)"
        opacity="0.1"
      />
      <polyline
        points="28,138 60,126 92,132 124,106 156,96 188,102 220,82 258,72"
        fill="none"
        stroke="var(--success)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[124, 220, 258].map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy={[106, 82, 72][index]}
          r="3"
          fill="var(--success)"
          stroke="var(--foreground)"
          strokeWidth="1.5"
        />
      ))}

      {/* Operational metrics. */}
      <rect
        x="282"
        y="50"
        width="108"
        height="50"
        rx="7"
        fill="var(--accent)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text
        x="294"
        y="66"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="800"
      >
        P99 LATENCY
      </text>
      <text
        x="306"
        y="92"
        fill="var(--foreground)"
        fontFamily="var(--font-display), sans-serif"
        fontSize="24"
        fontWeight="900"
      >
        42ms
      </text>

      <rect
        x="400"
        y="50"
        width="106"
        height="50"
        rx="7"
        fill="var(--success)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text
        x="412"
        y="66"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="800"
      >
        API ERRORS/5m
      </text>
      <text
        x="446"
        y="92"
        fill="var(--foreground)"
        fontFamily="var(--font-display), sans-serif"
        fontSize="24"
        fontWeight="900"
      >
        0
      </text>

      <rect
        x="282"
        y="108"
        width="108"
        height="50"
        rx="7"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text
        x="294"
        y="124"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="800"
      >
        PIPELINE FAILS
      </text>
      <text
        x="330"
        y="150"
        fill="var(--foreground)"
        fontFamily="var(--font-display), sans-serif"
        fontSize="24"
        fontWeight="900"
      >
        0
      </text>

      <rect
        x="400"
        y="108"
        width="106"
        height="50"
        rx="7"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text
        x="412"
        y="124"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="800"
      >
        UPTIME
      </text>
      <text
        x="408"
        y="151"
        fill="var(--foreground)"
        fontFamily="var(--font-display), sans-serif"
        fontSize="21"
        fontWeight="900"
      >
        99.99%
      </text>

      {/* Terminal log panel. */}
      <rect
        x="14"
        y="168"
        width="492"
        height="72"
        rx="7"
        fill="#111827"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text
        x="26"
        y="185"
        fill="var(--cream)"
        opacity="0.45"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
      >
        $ tail -f /var/log/ops-stream.log
      </text>
      <text
        x="26"
        y="200"
        fill="var(--success)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="8"
        fontWeight="700"
      >
        [OK] spark-etl-prod ✓ 12.4M rows → iceberg.events 342s
      </text>
      <text
        x="26"
        y="214"
        fill="var(--success)"
        opacity="0.8"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="8"
        fontWeight="700"
      >
        [OK] dbt-run-daily ✓ 28 models passed 0 warnings
      </text>
      <text
        x="26"
        y="228"
        fill="var(--cream)"
        opacity="0.45"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="8"
        fontWeight="700"
      >
        [OK] kafka-consumer ▸ lag 0 • k8s rollout 3/3 ready
      </text>

      {/* Real tool logos, contained inside dashboard. */}
      <rect
        x="14"
        y="250"
        width="492"
        height="94"
        rx="7"
        fill="var(--background)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text
        x="26"
        y="266"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="800"
      >
        PLATFORM SERVICES
      </text>
      {tools.map(([name, src], index) => {
        const x = 28 + index * 60;
        return (
          <g key={name}>
            <rect
              x={x - 5}
              y="274"
              width="46"
              height="46"
              rx="5"
              fill="#fff"
              stroke="var(--foreground)"
              strokeWidth="2"
            />
            <image
              href={src}
              x={x + 2}
              y="281"
              width="32"
              height="32"
              preserveAspectRatio="xMidYMid meet"
            />
            <text
              x={x + 18}
              y="336"
              fill="var(--foreground)"
              fontFamily="var(--font-jetbrains), monospace"
              fontSize="6.5"
              fontWeight="900"
              textAnchor="middle"
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PipelineBot({ className }: MascotProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 380 220"
      role="img"
      aria-labelledby="pipeline-blueprint-title"
    >
      <title id="pipeline-blueprint-title">
        Pipeline from Kafka through Spark and Flink into Iceberg and dbt,
        running on Kubernetes with Prometheus monitoring
      </title>

      <rect
        x="9"
        y="10"
        width="366"
        height="204"
        rx="8"
        fill="var(--foreground)"
        opacity="0.16"
      />
      <rect
        x="3"
        y="3"
        width="366"
        height="204"
        rx="8"
        fill="var(--background)"
        stroke="var(--foreground)"
        strokeWidth="4"
      />
      <path
        d="M11 3h350a8 8 0 0 1 8 8v23H3V11a8 8 0 0 1 8-8Z"
        fill="var(--foreground)"
      />
      <circle cx="19" cy="18" r="4" fill="var(--primary)" />
      <circle cx="33" cy="18" r="4" fill="var(--secondary)" />
      <circle cx="47" cy="18" r="4" fill="var(--success)" />

      {/* Events. */}
      <rect
        x="14"
        y="48"
        width="62"
        height="62"
        rx="5"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <ellipse
        cx="45"
        cy="63"
        rx="14"
        ry="5"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <path
        d="M31 63v20c0 7 28 7 28 0V63M31 73c0 7 28 7 28 0"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <text
        x="45"
        y="102"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="900"
        textAnchor="middle"
      >
        EVENTS
      </text>

      {/* Kafka. */}
      <rect
        x="94"
        y="48"
        width="62"
        height="62"
        rx="5"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <image href="/logos/kafka.svg" x="112" y="55" width="26" height="26" />
      <text
        x="125"
        y="102"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="900"
        textAnchor="middle"
      >
        KAFKA
      </text>

      {/* Spark + Flink compute. */}
      <rect
        x="174"
        y="48"
        width="90"
        height="62"
        rx="5"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <image href="/logos/spark.svg" x="188" y="55" width="26" height="26" />
      <image href="/logos/flink.svg" x="226" y="55" width="26" height="26" />
      <text
        x="219"
        y="102"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="900"
        textAnchor="middle"
      >
        SPARK + FLINK
      </text>

      {/* Iceberg + dbt tables. */}
      <rect
        x="282"
        y="48"
        width="72"
        height="62"
        rx="5"
        fill="var(--success)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <rect x="289" y="55" width="26" height="26" rx="3" fill="#fff" />
      <image
        href="/logos/iceberg-symbol.svg"
        x="292"
        y="58"
        width="20"
        height="20"
        preserveAspectRatio="xMidYMid meet"
      />
      <rect x="321" y="55" width="26" height="26" rx="3" fill="#fff" />
      <image
        href="/logos/dbt.webp"
        x="324"
        y="58"
        width="20"
        height="20"
        preserveAspectRatio="xMidYMid meet"
      />
      <text
        x="318"
        y="102"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="900"
        textAnchor="middle"
      >
        TABLES ✓
      </text>

      {/* Main flow arrows. */}
      <path
        d="M78 79h12m-5-5 5 5-5 5M158 79h12m-5-5 5 5-5 5M266 79h12m-5-5 5 5-5 5"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Kubernetes runtime. */}
      <rect
        x="174"
        y="132"
        width="90"
        height="54"
        rx="5"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <image
        href="/logos/kubernetes.svg"
        x="182"
        y="143"
        width="30"
        height="30"
      />
      <text
        x="235"
        y="151"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="6"
        fontWeight="900"
        textAnchor="middle"
      >
        K8S RUNTIME
      </text>
      <text
        x="235"
        y="163"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="5"
        fontWeight="700"
        textAnchor="middle"
      >
        RUNS JOBS
      </text>
      <text
        x="235"
        y="175"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="6"
        fontWeight="800"
        textAnchor="middle"
      >
        3/3 READY
      </text>

      {/* Prometheus monitoring. */}
      <rect
        x="282"
        y="132"
        width="72"
        height="54"
        rx="5"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <image
        href="/logos/prometheus.svg"
        x="289"
        y="143"
        width="30"
        height="30"
      />
      <text
        x="334"
        y="155"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7"
        fontWeight="900"
        textAnchor="middle"
      >
        PROM
      </text>
      <text
        x="334"
        y="169"
        fill="var(--foreground)"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="6"
        fontWeight="700"
        textAnchor="middle"
      >
        SLO OK
      </text>

      {/* Straight runtime and telemetry links. */}
      <path
        d="M219 113v15m-5-5 5 5 5-5M266 159h12m-5-5 5 5-5 5"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DatabaseBlock({ className }: MascotProps) {
  const labelProps = {
    fill: "var(--foreground)",
    fontFamily: "var(--font-jetbrains), monospace",
    fontSize: 8,
    fontWeight: 900,
  } as const;

  return (
    <svg
      className={className}
      viewBox="0 0 360 270"
      role="img"
      aria-labelledby="data-patterns-title"
    >
      <title id="data-patterns-title">
        Kappa, Lambda, Medallion, Star Schema, and Slowly Changing Dimension
        patterns
      </title>

      <rect
        x="8"
        y="9"
        width="344"
        height="252"
        rx="8"
        fill="var(--background)"
        stroke="var(--foreground)"
        strokeWidth="4"
      />
      <path
        d="M16 9h328a8 8 0 0 1 8 8v20H8V17a8 8 0 0 1 8-8Z"
        fill="var(--foreground)"
      />
      <circle cx="23" cy="23" r="4" fill="var(--primary)" />
      <circle cx="37" cy="23" r="4" fill="var(--secondary)" />
      <circle cx="51" cy="23" r="4" fill="var(--success)" />

      {/* Kappa: one stream path with replay. */}
      <rect
        x="16"
        y="46"
        width="156"
        height="82"
        rx="5"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text x="27" y="63" {...labelProps}>
        KAPPA
      </text>
      <rect
        x="24"
        y="76"
        width="30"
        height="22"
        rx="3"
        fill="var(--primary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <rect
        x="67"
        y="76"
        width="39"
        height="22"
        rx="3"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <rect
        x="120"
        y="76"
        width="38"
        height="22"
        rx="3"
        fill="var(--success)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <text x="39" y="90" {...labelProps} fontSize="5" textAnchor="middle">
        EVENT
      </text>
      <text x="86.5" y="90" {...labelProps} fontSize="5" textAnchor="middle">
        STREAM
      </text>
      <text x="139" y="90" {...labelProps} fontSize="5" textAnchor="middle">
        VIEW
      </text>
      <path
        d="M56 87h8m-4-4 4 4-4 4M108 87h9m-4-4 4 4-4 4"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M139 102c-15 19-77 19-100 2m0 0 7-1m-7 1 3 6"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text x="94" y="120" {...labelProps} fontSize="6" textAnchor="middle">
        ONE FLOW + REPLAY
      </text>

      {/* Lambda: batch and speed converge. */}
      <rect
        x="188"
        y="46"
        width="156"
        height="82"
        rx="5"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text x="199" y="63" {...labelProps}>
        LAMBDA
      </text>
      <circle
        cx="207"
        cy="88"
        r="7"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <path
        d="M214 88h12l12-14h38m-50 14 12 15h38"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="244"
        y="66"
        width="36"
        height="17"
        rx="3"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <rect
        x="244"
        y="95"
        width="36"
        height="17"
        rx="3"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <text x="262" y="77" {...labelProps} fontSize="5.5" textAnchor="middle">
        BATCH
      </text>
      <text x="262" y="106" {...labelProps} fontSize="5.5" textAnchor="middle">
        SPEED
      </text>
      <path
        d="M282 74h18l12 14-12 15h-18"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2.5"
      />
      <rect
        x="300"
        y="79"
        width="32"
        height="19"
        rx="3"
        fill="var(--success)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <text x="316" y="91" {...labelProps} fontSize="5.5" textAnchor="middle">
        SERVE
      </text>
      <text x="266" y="120" {...labelProps} fontSize="6" textAnchor="middle">
        TWO PATHS
      </text>

      {/* Medallion. */}
      <rect
        x="16"
        y="140"
        width="98"
        height="104"
        rx="5"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text x="27" y="157" {...labelProps}>
        MEDALLION
      </text>
      <circle
        cx="39"
        cy="190"
        r="13"
        fill="var(--primary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <circle
        cx="66"
        cy="190"
        r="13"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <circle
        cx="93"
        cy="190"
        r="13"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <text x="39" y="193" {...labelProps} fontSize="7" textAnchor="middle">
        B
      </text>
      <text x="66" y="193" {...labelProps} fontSize="7" textAnchor="middle">
        S
      </text>
      <text x="93" y="193" {...labelProps} fontSize="7" textAnchor="middle">
        G
      </text>
      <path d="M52 190h1m26 0h1" stroke="var(--foreground)" strokeWidth="3" />
      <text x="65" y="222" {...labelProps} fontSize="5.5" textAnchor="middle">
        RAW → CLEAN → SERVE
      </text>

      {/* Star schema. */}
      <rect
        x="131"
        y="140"
        width="98"
        height="104"
        rx="5"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text x="142" y="157" {...labelProps}>
        STAR
      </text>
      <rect
        x="169"
        y="181"
        width="22"
        height="22"
        rx="3"
        fill="var(--secondary)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <circle
        cx="180"
        cy="168"
        r="7"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <circle
        cx="207"
        cy="192"
        r="7"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <circle
        cx="180"
        cy="216"
        r="7"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <circle
        cx="153"
        cy="192"
        r="7"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <path
        d="M180 175v6m11 11h9m-20 11v6m-11-17h-9"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <text x="180" y="195" {...labelProps} fontSize="5" textAnchor="middle">
        FACT
      </text>
      <text x="180" y="236" {...labelProps} fontSize="5.5" textAnchor="middle">
        FACT + DIMENSIONS
      </text>

      {/* Slowly changing dimensions. */}
      <rect
        x="246"
        y="140"
        width="98"
        height="104"
        rx="5"
        fill="var(--cream)"
        stroke="var(--foreground)"
        strokeWidth="3"
      />
      <text x="257" y="157" {...labelProps}>
        SCD
      </text>
      <rect
        x="259"
        y="174"
        width="28"
        height="39"
        rx="3"
        fill="#fff"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <rect
        x="303"
        y="174"
        width="28"
        height="39"
        rx="3"
        fill="var(--success)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <text x="273" y="190" {...labelProps} fontSize="6" textAnchor="middle">
        V1
      </text>
      <text x="273" y="202" {...labelProps} fontSize="4.5" textAnchor="middle">
        CLOSED
      </text>
      <text x="317" y="190" {...labelProps} fontSize="6" textAnchor="middle">
        V2
      </text>
      <text x="317" y="202" {...labelProps} fontSize="4.5" textAnchor="middle">
        CURRENT
      </text>
      <path
        d="M290 193h9m-5-5 5 5-5 5"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="295" y="231" {...labelProps} fontSize="5" textAnchor="middle">
        CLOSE OLD → INSERT NEW
      </text>
    </svg>
  );
}

export function PagerBird({ className }: MascotProps) {
  const dataPlane = [
    ["KAFKA", "Events", "/logos/kafka.svg"],
    ["FLINK", "Stream", "/logos/flink.svg"],
    ["LAKEHOUSE", "Iceberg", "/logos/iceberg-symbol.svg"],
  ] as const;
  const servingPlane = [
    ["KSERVE", "Inference API", "/logos/kserve.svg"],
    ["vLLM", "Model runtime", "/logos/vllm.svg"],
  ] as const;
  const kubernetesTools = [
    ["CILIUM", "Network", "/logos/cilium.svg"],
    ["KYVERNO", "Policy", "/logos/kyverno.svg"],
    ["KEDA", "Autoscale", "/logos/keda.svg"],
    ["VOLCANO", "Schedule", "/logos/volcano.svg"],
  ] as const;

  const renderFlow = (tools: readonly (readonly [string, string, string])[]) =>
    tools.map(([name, detail, src], index) => (
      <div className="platform-flow-item" key={name}>
        {index > 0 && <span className="platform-link" aria-hidden="true" />}
        <Card className="platform-tool-card">
          <CardContent>
            <Image src={src} alt="" width={40} height={40} />
            <span>
              <strong>{name}</strong>
              <small>{detail}</small>
            </span>
          </CardContent>
        </Card>
      </div>
    ));

  return (
    <div
      className={["telemetry-map", className].filter(Boolean).join(" ")}
      aria-label="Real-time AI data platform running on Kubernetes"
    >
      <div
        className="platform-plane platform-data-plane"
        tabIndex={0}
        role="group"
        aria-label="Data plane: Kafka to Flink to Iceberg lakehouse"
      >
        <div className="platform-plane-label">
          <strong>01 / DATA</strong>
          <small>STREAM TO LAKEHOUSE</small>
        </div>
        <div className="platform-flow">{renderFlow(dataPlane)}</div>
      </div>
      <div className="platform-handoff" aria-hidden="true">
        <span>MODEL DATA</span>
        <i />
      </div>
      <div
        className="platform-plane platform-serving-plane"
        tabIndex={0}
        role="group"
        aria-label="Serving plane: KServe to vLLM model runtime"
      >
        <div className="platform-plane-label">
          <strong>02 / SERVE</strong>
          <small>MODEL DELIVERY</small>
        </div>
        <div className="platform-flow">{renderFlow(servingPlane)}</div>
      </div>
      <Card className="platform-runtime">
        <CardContent>
          <div className="platform-runtime-title">
            <Image src="/logos/kubernetes.svg" alt="" width={34} height={34} />
            <span>
              <strong>KUBERNETES RUNTIME</strong>
              <small>DATA + INFERENCE WORKLOADS</small>
            </span>
          </div>
          <div className="platform-runtime-tools">
            <div className="platform-runtime-track">
              {kubernetesTools.map(([name, detail, src]) => (
                <div className="platform-runtime-tool" key={name}>
                  <Image src={src} alt="" width={28} height={28} />
                  <span>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
