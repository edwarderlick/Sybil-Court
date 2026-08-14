import Link from "next/link";

const links = [
  { href: "/how-judgments-work", label: "Legal Registry" },
  { href: "/how-judgments-work", label: "Technical Specs" },
  { href: "/how-judgments-work", label: "Security Audit" },
  { href: "/how-judgments-work", label: "Bug Bounty" },
];

export function Footer({ inset = false }: { inset?: boolean }) {
  return (
    <footer
      className={`full-width py-12 border-t border-outline-variant bg-surface-container-lowest flex flex-col items-center gap-8 w-full px-margin_mobile md:px-margin_desktop z-10 relative ${
        inset ? "md:ml-64" : ""
      }`}
    >
      <div className="text-on-surface font-bold text-lg tracking-widest uppercase">
        Sybil Court
      </div>
      <div className="flex flex-wrap justify-center gap-6 font-label-technical text-label-technical text-on-surface-variant">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="hover:text-on-surface hover:underline transition-colors uppercase"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="font-label-technical text-label-technical text-on-surface-variant/50 text-center uppercase">
        ©2024 Sybil Court Industrial Intelligence. All rights reserved.
      </div>
    </footer>
  );
}
