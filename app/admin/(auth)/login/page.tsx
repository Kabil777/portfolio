import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin/admin-login";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="admin-login-page" id="content">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <p className="admin-kicker">PRIVATE CONTROL PLANE</p>
        <h1 id="admin-login-title">Admin access.</h1>
        <p>Sign a one-time challenge with an approved Ed25519 key.</p>
        <AdminLogin
          keyIds={getSiteConfig().admin.publicKeys.map(({ id }) => id)}
        />
      </section>
    </main>
  );
}
