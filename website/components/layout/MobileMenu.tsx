"use client";

import Link from "next/link";
import { useState } from "react";

interface MobileMenuProps {
    items: ReadonlyArray<{ href: string; label: string }>;
    currentPath: string;
}

export function MobileMenu({ items, currentPath }: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="mobile-menu">
            <button
                type="button"
                className="mobile-menu__trigger"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-label="Mobil menüyü aç"
            >
                <span />
                <span />
            </button>

            {open ? (
                <div className="mobile-menu__panel">
                    {items.map((item) => {
                        const active = currentPath === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`mobile-menu__link ${active ? "is-active" : ""}`}
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
