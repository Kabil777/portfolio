"use client";

import { useActionState } from "react";
import { uploadPostAction } from "@/app/admin/actions";

const initialState = { error: "" };

export function PostUploadForm() {
  const [state, action, pending] = useActionState(
    uploadPostAction,
    initialState,
  );

  return (
    <form action={action} className="admin-upload-form">
      <label htmlFor="post">Markdown post</label>
      <input
        id="post"
        name="post"
        type="file"
        accept=".md,text/markdown"
        required
      />
      <p className="admin-form-note">
        YAML frontmatter is validated. Uploading an existing slug creates a safe
        replacement draft.
      </p>
      {state.error && (
        <p className="admin-form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="admin-button" disabled={pending} type="submit">
        {pending ? "VALIDATING…" : "UPLOAD & PREVIEW"}
      </button>
    </form>
  );
}
