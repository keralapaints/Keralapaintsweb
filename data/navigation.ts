/**
 * The header's navigation after the Products panel (which lists the range itself). Entries with `items` open a panel.
 * Colours, Technology, outlets and gallery are placeholders (`#`) until those pages exist.
 */
export const siteNavigation: { label: string; href?: string; items?: { label: string; href: string }[] }[] = [
  { label: "Colours", items: [{ label: "Colour Palette", href: "#" }, { label: "Shade Finder", href: "#" }, { label: "Colour Stories", href: "#" }] },
  { label: "Technology", items: [{ label: "Poison-Free Paint", href: "#" }, { label: "Research & Testing", href: "#" }] },
    { label: "Find an Outlet", href: "/outlets/" },
  { label: "Warranty", href: "https://warrantyportal.keralapaints.com/" },
  { label: "Gallery", href: "#" },
  { label: "Contact", href: "#enquiry" },
];
