import { outlets, outletsCopy, type Outlet } from "@/data/outlets";
import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/product/product-schema";

/** The Find an Outlet page's address. */
export const OUTLETS_PATH = "/outlets/";

/** An outlet's display name: the dealer's name, or "Kerala Paints Factory Outlet". */
export const outletName = (outlet: Outlet) => outlet.name ?? outletsCopy.factoryName;

/** A dialable number: a 10-digit mobile with India's +91 in front. */
export const telHref = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return `tel:${digits.length === 10 ? `+91${digits}` : digits}`;
};

/** Google Maps directions to the outlet, by its name and address (no coordinates in the supplied list). */
export const directionsHref = (outlet: Outlet) => {
  const query = [outletName(outlet), outlet.address, outlet.pin].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

/** A stable id for an outlet, for list keys and anchors. */
export const outletId = (outlet: Outlet) =>
  `${outlet.district}-${outlet.place}-${outlet.name ?? "factory"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** The districts, in list order, each once. */
export const outletDistricts = [...new Set(outlets.map((outlet) => outlet.district))];

/**
 * The structured data for the page: its breadcrumb, and the factory outlets as Kerala Paints stores. Dealers are
 * independent businesses, so they are listed on the page but not described as Kerala Paints stores.
 */
export function outletsSchema() {
  const url = absoluteUrl(OUTLETS_PATH);
  const factories = outlets.filter((outlet) => outlet.type === "factory");
  return [{
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#factory-outlets`,
    name: `${site.name} factory outlets`,
    itemListElement: factories.map((outlet, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Store",
        name: `${outletsCopy.factoryName}, ${outlet.place}`,
        url: `${url}#${outletId(outlet)}`,
        brand: { "@type": "Brand", name: site.name },
        address: {
          "@type": "PostalAddress",
          streetAddress: outlet.address,
          addressLocality: outlet.place,
          addressRegion: outlet.district === "Coimbatore (Tamil Nadu)" ? "Tamil Nadu" : "Kerala",
          postalCode: outlet.pin,
          addressCountry: "IN",
        },
        telephone: outlet.phones[0] ? telHref(outlet.phones[0]).replace("tel:", "") : undefined,
      },
    })),
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: outletsCopy.home, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: outletsCopy.breadcrumb, item: url },
    ],
  }];
}