"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { sendCampaign, sendTestCampaign } from "@/lib/campaigns";
import { unsubscribe } from "@/lib/newsletter";
import {
  archivePost,
  deletePost,
  publishPost,
  savePostDraft,
  unpublishPost,
} from "@/lib/posts";

export type UploadState = { error: string };

async function authorizeMutation() {
  await requireAdmin();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!origin || !host) throw new Error("Invalid request origin");

  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error("Invalid request origin");
  }
  if (originHost !== host) throw new Error("Invalid request origin");
}

function slugFrom(formData: FormData): string {
  const slug = formData.get("slug");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid post slug");
  }
  return slug;
}

function refreshPost(slug: string) {
  revalidateTag("posts", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${slug}/preview`);
}

export async function uploadPostAction(
  _previous: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await authorizeMutation();
  const file = formData.get("post");
  if (!(file instanceof File) || !file.name.endsWith(".md")) {
    return { error: "Choose a .md file." };
  }
  if (!file.size || file.size > 2 * 1024 * 1024) {
    return { error: "Markdown file must be between 1 byte and 2 MB." };
  }

  let post;
  try {
    post = await savePostDraft(file.name, await file.text());
  } catch (cause) {
    return {
      error: cause instanceof Error ? cause.message : "Invalid Markdown file.",
    };
  }

  refreshPost(post.slug);
  redirect(`/admin/posts/${post.slug}/preview`);
}

export async function publishPostAction(formData: FormData) {
  await authorizeMutation();
  const slug = slugFrom(formData);
  if (!(await publishPost(slug)))
    throw new Error("Post has no content to publish");
  refreshPost(slug);
  redirect(`/admin/posts/${slug}/preview`);
}

export async function unpublishPostAction(formData: FormData) {
  await authorizeMutation();
  const slug = slugFrom(formData);
  await unpublishPost(slug);
  refreshPost(slug);
  redirect(`/admin/posts/${slug}/preview`);
}

export async function archivePostAction(formData: FormData) {
  await authorizeMutation();
  const slug = slugFrom(formData);
  await archivePost(slug);
  refreshPost(slug);
  redirect("/admin/posts");
}

export async function deletePostAction(formData: FormData) {
  await authorizeMutation();
  const slug = slugFrom(formData);
  const result = await deletePost(slug);

  if (result === "scheduled") {
    redirect(
      "/admin/posts?error=Cancel+the+scheduled+newsletter+before+deleting+this+post.",
    );
  }
  if (result === "missing") {
    redirect("/admin/posts?error=Post+was+not+found.");
  }

  refreshPost(slug);
  redirect("/admin/posts?success=Post+deleted.");
}

export async function unsubscribeSubscriberAction(formData: FormData) {
  await authorizeMutation();
  const email = formData.get("email");
  if (typeof email !== "string") throw new Error("Invalid subscriber");
  await unsubscribe(email);
  revalidatePath("/admin");
  revalidatePath("/admin/subscribers");
}

export async function sendTestCampaignAction(formData: FormData) {
  await authorizeMutation();
  const slug = slugFrom(formData);
  try {
    await sendTestCampaign(slug);
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "Test email failed";
    redirect(`/admin/campaigns/${slug}?error=${encodeURIComponent(message)}`);
  }
  redirect(`/admin/campaigns/${slug}?tested=1`);
}

export async function sendCampaignAction(formData: FormData) {
  await authorizeMutation();
  const slug = slugFrom(formData);
  const value = formData.get("scheduledAt");
  let scheduledAt: string | undefined;
  if (typeof value === "string" && value) {
    const date = new Date(value);
    const latest = Date.now() + 365 * 24 * 60 * 60 * 1000;
    if (
      !Number.isFinite(date.valueOf()) ||
      date.valueOf() <= Date.now() ||
      date.valueOf() > latest
    ) {
      throw new Error("Schedule must be within the next year");
    }
    scheduledAt = date.toISOString();
  }
  await sendCampaign(slug, scheduledAt);
  revalidatePath("/admin");
  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}
