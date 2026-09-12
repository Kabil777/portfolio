import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Skip to admin content
      </a>
      <header className="admin-header">
        <Link className="admin-brand" href="/admin" prefetch={false}>
          KABIL
        </Link>
        <nav aria-label="Admin navigation">
          <Link href="/admin" prefetch={false}>Dashboard</Link>
          <Link href="/admin/posts" prefetch={false}>Posts</Link>
          <Link href="/admin/subscribers" prefetch={false}>Subscribers</Link>
          <Link href="/admin/campaigns" prefetch={false}>Newsletter</Link>
        </nav>
        <form action="/api/admin-auth/logout" method="post">
          <button type="submit">Log out</button>
        </form>
      </header>
      <main className="admin-main" id="admin-content">
        {children}
      </main>
    </div>
  );
}
