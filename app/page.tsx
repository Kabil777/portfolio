import Image from "next/image";
import Link from "next/link";

import { BlogCard } from "@/components/blog/blog-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DatabaseBlock,
  PagerBird,
  PipelineBot,
  TerminalBuddy,
} from "@/components/mascots";
import { getSiteConfig } from "@/lib/config";
import { getBlogPosts } from "@/lib/posts";

const { projects, experience, contact } = getSiteConfig();

const emailHref = contact?.email
  ? contact.email.startsWith("mailto:")
    ? contact.email
    : `mailto:${contact.email}`
  : "mailto:hello@kabil.dev";

const linkedinUrl = contact?.linkedin ?? "https://www.linkedin.com";

const toolMascots = [
  { name: "Spark", kind: "data" },
  { name: "Iceberg", kind: "data" },
  { name: "dbt", kind: "data" },
  { name: "Kafka", kind: "data" },
  { name: "Flink", kind: "data" },
  { name: "K8s", kind: "cluster" },
  { name: "Cilium", kind: "cluster" },
  { name: "Calico", kind: "cluster" },
  { name: "Argo CD", kind: "cluster" },
  { name: "cert-manager", kind: "cluster" },
  { name: "PostgreSQL", kind: "policy" },
  { name: "OPA", kind: "policy" },
  { name: "Kyverno", kind: "policy" },
  { name: "Terraform", kind: "policy" },
  { name: "Prometheus", kind: "signal" },
  { name: "Grafana", kind: "signal" },
  { name: "OTel", kind: "signal" },
  { name: "Jaeger", kind: "signal" },
] as const;

const tickerItems = toolMascots.map((tool) => tool.name);
const heroTools = toolMascots.filter((tool) =>
  [
    "Spark",
    "Iceberg",
    "Kafka",
    "K8s",
    "Argo CD",
    "Prometheus",
    "Grafana",
    "OTel",
  ].includes(tool.name),
);
type ToolMascot = (typeof toolMascots)[number];

const toolLogos: Record<ToolMascot["name"], string> = {
  Spark: "/logos/spark.svg",
  Iceberg: "/logos/iceberg-symbol.svg",
  dbt: "/logos/dbt.webp",
  Kafka: "/logos/kafka.svg",
  Flink: "/logos/flink.svg",
  K8s: "/logos/kubernetes.svg",
  Cilium: "/logos/cilium.svg",
  Calico: "/logos/calico.svg",
  "Argo CD": "/logos/argo.svg",
  "cert-manager": "/logos/cert-manager.svg",
  PostgreSQL: "/logos/postgresql.svg",
  OPA: "/logos/opa.svg",
  Kyverno: "/logos/kyverno.svg",
  Terraform: "/logos/terraform.svg",
  Prometheus: "/logos/prometheus.svg",
  Grafana: "/logos/grafana.svg",
  OTel: "/logos/otel.svg",
  Jaeger: "/logos/jaeger.svg",
};

function ToolMascotBadge({ tool }: { tool: ToolMascot }) {
  return (
    <li className="tool-mascot" data-kind={tool.kind}>
      <Image
        className="tool-logo"
        src={toolLogos[tool.name]}
        alt=""
        width={42}
        height={42}
        aria-hidden="true"
      />
      <span className="tool-name">{tool.name}</span>
    </li>
  );
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const latestPosts = await getBlogPosts(3);

  return (
    <>
      <SiteHeader />
      <main id="content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">I KEEP DATA MOVING AND SYSTEMS CALM.</h1>
            <p className="hero-intro">
              I&apos;m Kabil, a data and platform engineer focused on reliable
              pipelines, observable infrastructure, and fewer 3 a.m. surprises.
            </p>
            <Badge variant="outline" className="hero-badge">
              ● Solving newer problems
              <br className="hero-badge-break" />& becoming a better engineer
              every day
            </Badge>
            <div className="button-row">
              <Button asChild size="lg">
                <a href="#projects">View projects</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#contact">Contact</a>
              </Button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-dashboard-wrap">
              <TerminalBuddy className="terminal-buddy" />
              <ul
                className="hero-tool-rack"
                aria-label="Core data and platform tools"
              >
                {heroTools.map((tool) => (
                  <ToolMascotBadge key={tool.name} tool={tool} />
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="ticker" aria-label="Core practice areas">
          <ul>
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <li
                key={`${item}-${index}`}
                aria-hidden={index >= tickerItems.length}
              >
                {item} <span aria-hidden="true">◆</span>
              </li>
            ))}
          </ul>
        </div>

        <section
          className="projects section-shell"
          id="projects"
          aria-labelledby="projects-title"
        >
          <div className="section-heading project-heading">
            <div>
              <h2 id="projects-title">Systems built for the messy middle.</h2>
              <p>
                Data engines, cluster controls, policy gates, and observability
                wired together without losing human operators.
              </p>
            </div>
            <PipelineBot className="pipeline-bot" />
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-grid-item" key={project.title}>
                <Card className="project-card" data-tone={project.tone}>
                  <CardHeader>
                    <CardTitle>
                      <h3>{project.title}</h3>
                    </CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                    <CardAction>
                      <Badge variant="outline">Case study</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className="outcome">{project.outcome}</p>
                    <ul
                      className="mini-tool-list"
                      aria-label={`${project.title} technologies`}
                    >
                      {project.tags.map((tag) => {
                        const tool = toolMascots.find(
                          (item) => item.name === tag,
                        );
                        return tool ? (
                          <ToolMascotBadge key={tag} tool={tool} />
                        ) : (
                          <li key={tag}>
                            <Badge variant="secondary">{tag}</Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href="#contact"
                        aria-label={`Discuss ${project.title}`}
                      >
                        Discuss project
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </article>
            ))}
          </div>
        </section>

        <Separator />

        <section
          className="home-blog section-shell"
          aria-labelledby="home-blog-title"
        >
          <div className="section-heading">
            <div>
              <h2 id="home-blog-title">Notes from production.</h2>
              <p>Ideas on data systems, Kubernetes, and reliable platforms.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/blog" prefetch={false}>View all writing</Link>
            </Button>
          </div>
          <div className="home-blog-grid">
            {latestPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <Separator />

        <section
          className="about section-shell"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-copy">
            <h2 id="about-title">Reliability is a team sport.</h2>
            <p className="about-lede">
              I work where data platforms meet production reality. My job is to
              make the safe path the easy path—then document it so nobody needs
              a guided tour.
            </p>
            <blockquote>
              “Good infrastructure should explain itself before the pager has
              to.”
            </blockquote>
          </div>

          <div className="experience-panel">
            <h3>Experience</h3>
            <ol className="experience-list">
              {experience.map((item) => (
                <li key={item.period}>
                  <p className="experience-period">{item.period}</p>
                  <div>
                    <h4>{item.role}</h4>
                    <p>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="skills section-shell"
          id="skills"
          aria-labelledby="skills-title"
        >
          <div className="skills-mascot-panel">
            <DatabaseBlock className="database-block" />
            <p>PATTERNS ALIGNED WITH BUSINESS IMPACT.</p>
          </div>
          <div className="skills-content">
            <h2 id="skills-title">A practical operations toolbox.</h2>
            <ul className="tool-wall" aria-label="Tool mascot wall">
              {toolMascots.map((tool) => (
                <ToolMascotBadge key={tool.name} tool={tool} />
              ))}
            </ul>
          </div>
        </section>

        <section
          className="contact section-shell"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-copy">
            <h2 id="contact-title">Bring me the noisy system.</h2>
            <p>
              Have a platform that needs calmer alerts, safer delivery, or a
              data pipeline people can trust? Send the context. I&apos;ll bring
              a plan.
            </p>
            <div className="button-row">
              <Button
                asChild
                size="lg"
                variant="default"
                className="border-2 border-foreground"
              >
                <a href={emailHref}>Email Kabil</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={linkedinUrl} rel="noreferrer" target="_blank">
                  View LinkedIn
                </a>
              </Button>
            </div>
          </div>
          <PagerBird className="pager-bird" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
