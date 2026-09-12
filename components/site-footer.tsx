import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <p>© {new Date().getFullYear()} Kabil. Built for useful uptime.</p>
      <div className="footer-links">
        <Link href="/privacy">Privacy</Link>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
