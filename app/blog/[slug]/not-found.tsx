import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BlogPostNotFound() {
  return (
    <main className="blog-not-found" id="content">
      <p>404 / POST MISSING</p>
      <h1>THIS POST LEFT NO RUNBOOK.</h1>
      <Button asChild>
        <Link href="/blog">Back to Blog</Link>
      </Button>
    </main>
  );
}
