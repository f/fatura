"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";

const navItems = [
  { href: "/", label: "Ana sayfa" },
  { href: "/dokumantasyon", label: "Dokümantasyon" },
  { href: "/demo", label: "Canlı demo" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__dot" />
          <span>fatura.js</span>
        </Link>

        <nav className="site-nav" aria-label="Ana menü">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`site-nav__link ${active ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <a
            className="btn-ghost"
            href="https://github.com/f/fatura"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <MobileMenu items={navItems} currentPath={pathname} />
        </div>
      </div>
    </header>
  );
}
