import Link from "next/link";
import { LogoLockup } from "@/components/Logo";

const productLinks = [
  { label: "How it works", href: "/#how" },
  { label: "Meta models", href: "/#meta" },
  { label: "Terminal", href: "/scan" },
  {
    label: "GitHub",
    href: "https://github.com/shyampitamber/ChartCortex",
    external: true,
  },
];

const legalLinks = [
  { label: "Terms", href: "/legal#terms" },
  { label: "Privacy", href: "/legal#privacy" },
  { label: "Risk disclosure", href: "/legal#risk" },
];

const supportLinks = [
  { label: "Contact", href: "/contact" },
  { label: "Meta Model API", href: "https://dev.meta.ai", external: true },
];

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/shyampitamber/ChartCortex",
    path: "M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shyam-pitamber5777/",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z",
  },
  {
    label: "Contact",
    href: "/contact",
    path: "",
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer relative z-10 w-full">
      <div className="brand-rule" aria-hidden />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <LogoLockup size={38} />
          </div>
          <nav aria-label="Social media" className="flex items-center gap-2">
            {socials.map((social) => {
              const icon = social.path ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d={social.path} />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              );

              if (social.href.startsWith("/")) {
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="icon-btn"
                  >
                    {icon}
                  </Link>
                );
              }

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="icon-btn"
                >
                  {icon}
                </a>
              );
            })}
          </nav>
        </div>

        <nav
          aria-label="Footer"
          className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3"
        >
          <div>
            <p className="footer-heading">Product</p>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="footer-link"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer-heading">Legal</p>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer-heading">Support</p>
            <ul className="mt-3 space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="footer-link"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-line pt-6 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 ChartCortex. All rights reserved.</p>
          <p className="max-w-xl leading-relaxed">
            Decision support and education only. Not financial advice. No
            execution and no client funds.
          </p>
        </div>
      </div>
    </footer>
  );
}
