"use client";

import { useRef } from "react";
import { deletePostAction } from "@/app/admin/actions";

export function DeletePostForm({ slug, title }: { slug: string; title: string }) {
  const form = useRef<HTMLFormElement>(null);

  return (
    <form action={deletePostAction} ref={form}>
      <input name="slug" type="hidden" value={slug} />
      <button
        className="admin-row-delete"
        onClick={() => {
          if (
            window.confirm(
              `Permanently delete “${title}” and its analytics, likes, and campaign record?`,
            )
          ) {
            form.current?.requestSubmit();
          }
        }}
        type="button"
      >
        Delete
      </button>
    </form>
  );
}
