import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSubscribers } from "@/lib/newsletter";

export const runtime = "nodejs";

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribers = await getSubscribers();
  const rows = [
    ["email", "status", "consented_at", "created_at"],
    ...subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.status,
      subscriber.consentedAt?.toISOString() ?? "",
      subscriber.createdAt.toISOString(),
    ]),
  ];
  return new NextResponse(
    rows.map((row) => row.map(csvCell).join(",")).join("\n"),
    {
      headers: {
        "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    },
  );
}
