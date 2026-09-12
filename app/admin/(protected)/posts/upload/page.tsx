import { PostUploadForm } from "@/components/admin/post-upload-form";

export default function UploadPostPage() {
  return (
    <section className="admin-narrow" aria-labelledby="upload-title">
      <p className="admin-kicker">NEW DRAFT</p>
      <h1 id="upload-title">Upload Markdown.</h1>
      <p>Write elsewhere. Bring one validated `.md` file here.</p>
      <PostUploadForm />
    </section>
  );
}
