"use server";

import { redirect } from "next/navigation";
import { confirmSubscription } from "@/lib/newsletter";

export async function confirmNewsletter(formData: FormData) {
  const token = formData.get("token");
  let status = "invalid";

  if (typeof token === "string") {
    try {
      status = (await confirmSubscription(token)) ? "confirmed" : "invalid";
    } catch {
      status = "error";
    }
  }

  redirect(`/newsletter/confirm?status=${status}`);
}
