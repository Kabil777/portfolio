import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className="site-header" id="top">
        <Link className="brand" href="/" aria-label="Kabil, home">
          KABIL
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            <li>
              <Link href="/#projects">Projects</Link>
            </li>
            <li>
              <Link href="/#about">About</Link>
            </li>
            <li>
              <Link href="/#skills">Skills</Link>
            </li>
            <li>
              <Link href="/blog" prefetch={false}>Blog</Link>
            </li>
            <li>
              <Button asChild size="sm" variant="secondary">
                <Link className="site-contact-button" href="/#contact">
                  Contact
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
