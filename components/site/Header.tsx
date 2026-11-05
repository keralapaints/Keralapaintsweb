"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PRODUCTS_PATH, products } from "@/lib/product/product-data";
import { productsPageCopy } from "@/data/products-page";
import { siteNavigation } from "@/data/navigation";
import { site } from "@/data/site";
import { MENU_EVENT } from "@/lib/events";
import { BRAND_LOGO } from "@/lib/preload";
import { setReducedMotion, useMotionPreference } from "@/hooks/useMotionPreference";

type NavItem = { label: string; href?: string; items?: { label: string; href: string; product?: boolean }[] };

/** `home` prefixes the in-page anchors: "" on the home page, "/" on every other page. */
type HeaderProps = { home?: string; skip?: { href: string; label: string } };

/** Primary navigation: the Products panel lists the range (each entry opens its page), then data/navigation. */
function buildNavigation(home: string): NavItem[] {
  // Anchors such as "#enquiry" live on the home page; "#" placeholders and full addresses stay as they are.
  const resolve = (href: string) => href.startsWith("#") && href !== "#" ? `${home}${href}` : href;
  return [
       { label: site.productsLabel, items: [...products.map((product) => ({ label: product.title, href: product.path, product: true })), { label: productsPageCopy.navLabel, href: PRODUCTS_PATH }] },
    ...siteNavigation.map((item) => ({ ...item, href: item.href && resolve(item.href), items: item.items?.map((entry) => ({ ...entry, href: resolve(entry.href) })) })),
  ];
}

/** Destinations that do not exist yet stay in the navigation but must not jump the page to the top. */
const placeholderProps = (href: string) => href === "#" ? { "aria-disabled": true as const, onClick: (event: { preventDefault: () => void }) => event.preventDefault() } : {};

function Chevron() {
  return <svg className="nav-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

/** The desktop navigation and matching mobile menu, on the home page and the product pages. */
export function Header({ home = "", skip = { href: "#wall-philosophy", label: site.skipOpening } }: HeaderProps) {
  const navigation = buildNavigation(home);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<string | null>(null);
  const motionPreference = useMotionPreference();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    const scrollLock = () => window.dispatchEvent(new CustomEvent(MENU_EVENT, { detail: { open: modal.open } }));
    if (open) {
      modal.showModal();
      document.documentElement.classList.add("menu-open");
      scrollLock();
    } else if (modal.open) {
      modal.close();
      document.documentElement.classList.remove("menu-open");
      scrollLock();
      trigger.current?.focus({ preventScroll: true });
    }
    return () => { document.documentElement.classList.remove("menu-open"); };
  }, [open]);

  // Panels close on outside click and Escape.
  useEffect(() => {
    if (!panel) return;
    const away = (event: PointerEvent) => { if (!nav.current?.contains(event.target as Node)) setPanel(null); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", escape); };
  }, [panel]);

  const hold = (label: string) => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setPanel(label); };
  const release = () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setPanel(null), 160); };
  const panelKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a"));
    const index = links.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    links[(index + (event.key === "ArrowDown" ? 1 : links.length - 1)) % links.length]?.focus();
  };

  return (
    <>
      <a className="skip-link" href={skip.href}>{skip.label}</a>
      <header className="site-header" data-panel={panel !== null}>
        <a href={`${home}#beyond-beautiful-walls`} className="brand" aria-label="Kerala Paints — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO} srcSet={`${BRAND_LOGO} 820w`} sizes="(max-width: 1023px) 94px, 136px" width={820} height={500} alt={site.logoAlt} fetchPriority="high" />
        </a>
        <nav ref={nav} className="primary-nav" aria-label={site.primaryNavigationLabel}>
          <ul>
            {navigation.map((item) => item.items ? (
              <li key={item.label} className="has-panel" data-open={panel === item.label} onPointerEnter={(event) => { if (event.pointerType === "mouse") hold(item.label); }} onPointerLeave={(event) => { if (event.pointerType === "mouse") release(); }}>
                <button type="button" aria-expanded={panel === item.label} aria-haspopup="true" onClick={() => setPanel(panel === item.label ? null : item.label)}>
                  <span>{item.label}</span><Chevron />
                </button>
                <div className="nav-panel" role="group" aria-label={item.label} onKeyDown={panelKeys}>
                  {item.items.map((entry, index) => entry.product
                    ? <a key={entry.label} href={entry.href} onClick={() => setPanel(null)}><span className="nav-panel-index">{String(index + 1).padStart(2, "0")}</span>{entry.label}</a>
                    : <a key={entry.label} href={entry.href} {...placeholderProps(entry.href)} onClick={(event) => { if (entry.href === "#") event.preventDefault(); setPanel(null); }}>{entry.label}</a>)}
                </div>
              </li>
            ) : (
              <li key={item.label}><a href={item.href} {...placeholderProps(item.href ?? "#")}>{item.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          <a className="consult-cta" href={`${home}#enquiry`} aria-label={site.consultation}><CalendarIcon /><span>{site.consultation}</span></a>
          <button ref={trigger} type="button" className="menu-trigger" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open} aria-controls="story-menu" onClick={() => setOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </header>
      <dialog id="story-menu" ref={dialog} className="menu-dialog" data-lenis-prevent aria-labelledby="menu-title" onCancel={(event) => { event.preventDefault(); setOpen(false); }} onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((element) => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
        <div className="menu-top"><span id="menu-title" className="eyebrow">{site.menuTitle}</span><button className="close-menu" aria-label="Close menu" onClick={() => setOpen(false)} autoFocus><span /><span /></button></div>
        <nav className="menu-navigation" aria-label={site.primaryNavigationLabel}>
          {navigation.map((item, index) => (
            <div className="menu-item" key={item.label}>
              {item.items ? (
                <>
                  <button className="menu-link" type="button" aria-expanded={mobilePanel === item.label} aria-controls={`menu-panel-${index}`} onClick={() => setMobilePanel(mobilePanel === item.label ? null : item.label)}>
                    <span>{item.label}</span><Chevron />
                  </button>
                  <div id={`menu-panel-${index}`} className="menu-submenu" hidden={mobilePanel !== item.label}>
                    {item.items.map((entry) => (
                      <a key={entry.label} href={entry.href} aria-disabled={entry.href === "#" || undefined} onClick={(event) => {
                        if (entry.href === "#") { event.preventDefault(); return; }
                        setOpen(false);
                      }}>{entry.label}</a>
                    ))}
                  </div>
                </>
              ) : (
                <a className="menu-link" href={item.href} aria-disabled={item.href === "#" || undefined} onClick={(event) => {
                  if (item.href === "#") event.preventDefault();
                  else setOpen(false);
                }}><span>{item.label}</span><span className="menu-arrow" aria-hidden="true">↗</span></a>
              )}
            </div>
          ))}
        </nav>
        <div className="menu-secondary">
          <a className="menu-cta" href={`${home}#enquiry`} onClick={() => setOpen(false)}><CalendarIcon />{` ${site.consultation}`}</a>
        </div>
        <div className="menu-bottom"><p className="menu-signoff">{site.signoff}</p><button className="motion-choice" type="button" aria-pressed={motionPreference !== "full"} disabled={motionPreference === "system"} onClick={() => setReducedMotion(motionPreference === "full")}>{motionPreference === "system" ? "Reduced motion · device preference" : motionPreference === "reduced" ? "Reduced motion: on" : "Reduced motion: off"}</button></div>
      </dialog>
    </>
  );
}
