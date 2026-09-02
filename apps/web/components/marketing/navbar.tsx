"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  ["How it works", "#method"],
  ["For hiring teams", "#access"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-forest/15 bg-paper/90 px-6 backdrop-blur-md md:px-10 lg:px-14"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between"><Link href="/" className="flex items-center gap-3 font-sans text-lg font-semibold tracking-[-.04em] text-ink"><span className="size-2 rounded-full bg-primary" />Trace</Link><nav className="hidden items-center gap-9 md:flex">{LINKS.map(([label, href]) => <Link key={href} href={href} className="font-mono text-[10px] uppercase tracking-[.16em] text-olive transition-colors hover:text-ink">{label}</Link>)}</nav><div className="hidden items-center gap-5 md:flex"><Link href="/login" className="font-mono text-[10px] uppercase tracking-[.16em] text-olive hover:text-ink">Sign in</Link><Link href="/register" className="border border-forest/25 bg-forest px-4 py-2.5 font-mono text-[10px] uppercase tracking-[.16em] text-paper transition-colors hover:bg-moss">Request access <span aria-hidden>↗</span></Link></div><button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="font-mono text-[10px] uppercase tracking-[.16em] text-ink md:hidden">{open ? "Close" : "Menu"}</button></div>{open && <nav className="border-t border-forest/10 py-5 md:hidden"><div className="grid gap-5">{LINKS.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="font-mono text-[11px] uppercase tracking-[.16em] text-olive">{label}</Link>)}<div className="flex items-center gap-5 pt-2"><Link href="/login" className="font-mono text-[11px] uppercase tracking-[.16em] text-olive">Sign in</Link><Link href="/register" className="bg-forest px-4 py-2.5 font-mono text-[10px] uppercase tracking-[.16em] text-paper">Request access</Link></div></div></nav>}</header>;
}
