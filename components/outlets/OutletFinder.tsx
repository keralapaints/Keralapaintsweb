"use client";

import { useId, useMemo, useState } from "react";
import { outlets, outletsCopy, type Outlet, type OutletType } from "@/data/outlets";
import { directionsHref, outletDistricts, outletId, outletName, telHref } from "@/lib/outlets/outlets";

type TypeFilter = "all" | OutletType;

/** A district's heading id. */
const districtSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Everything an outlet can be found by, lower-cased once. */
const searchText = (outlet: Outlet) =>
  [outlet.district, outlet.place, outlet.name ?? outletsCopy.factoryName, outlet.address, outlet.pin].filter(Boolean).join(" ").toLowerCase();

/**
 * The outlet list with its search, district and type filters. Every outlet is in the first render, so the whole list
 * is in the page's HTML; the filters only narrow it in the browser.
 */
export function OutletFinder() {
  const copy = outletsCopy;
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [type, setType] = useState<TypeFilter>("all");

  const groups = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = outlets.filter((outlet) =>
      (!district || outlet.district === district)
      && (type === "all" || outlet.type === type)
      && words.every((word) => searchText(outlet).includes(word)));
    return outletDistricts.map((name) => ({ name, items: matches.filter((outlet) => outlet.district === name) })).filter((group) => group.items.length > 0);
  }, [query, district, type]);
  const count = groups.reduce((total, group) => total + group.items.length, 0);
  const filtered = query !== "" || district !== "" || type !== "all";
  const clear = () => { setQuery(""); setDistrict(""); setType("all"); };

  return <div className="ol-finder">
    <div className="ol-controls" role="search">
      <div className="ol-field ol-field--search">
        <label htmlFor={searchId}>{copy.searchLabel}</label>
        <input id={searchId} type="search" value={query} placeholder={copy.searchPlaceholder} autoComplete="off" onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="ol-field">
        <label htmlFor={`${searchId}-district`}>{copy.districtLabel}</label>
        <select id={`${searchId}-district`} value={district} onChange={(event) => setDistrict(event.target.value)}>
          <option value="">{copy.allDistricts}</option>
          {outletDistricts.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>
      <fieldset className="ol-types">
        <legend>{copy.typeLabel}</legend>
        {(["all", "factory", "dealer"] as const).map((value) => <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)}>{copy.types[value]}</button>)}
      </fieldset>
    </div>

    <p className="ol-count" role="status" aria-live="polite">
      {copy.showing(count)}
      {filtered && <button type="button" className="ol-clear" onClick={clear}>{copy.clear}</button>}
    </p>

    {count === 0 && <p className="ol-empty">{copy.empty}</p>}

    {groups.map((group) => <section key={group.name} className="ol-district" aria-labelledby={`ol-district-${districtSlug(group.name)}`}>
      <h2 id={`ol-district-${districtSlug(group.name)}`} className="ol-district-name">{group.name}<span>{group.items.length}</span></h2>
      <ul className="ol-grid">
        {group.items.map((outlet) => <li key={outletId(outlet)} id={outletId(outlet)} className="ol-card" data-type={outlet.type}>
          <div className="ol-card-tags">
            <span className="ol-tag">{outlet.type === "factory" ? copy.factoryTag : copy.dealerTag}</span>
            {outlet.isNew && <span className="ol-tag ol-tag--new">{copy.newTag}</span>}
          </div>
          <h3>{outlet.type === "factory" ? outlet.place : outletName(outlet)}</h3>
          <p className="ol-place">{outlet.type === "factory" ? outletName(outlet) : outlet.place}</p>
          <address>{outlet.address}{outlet.pin && <>, <span className="ol-pin">{outlet.pin}</span></>}</address>
          <div className="ol-actions">
            {outlet.phones.map((phone) => <a key={phone} className="ol-button" href={telHref(phone)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
              <span className="sr-only">{copy.call} </span>{phone}
            </a>)}
            <a className="ol-button ol-button--ghost" href={directionsHref(outlet)} target="_blank" rel="noopener noreferrer">
              {copy.directions}<span aria-hidden="true">↗</span>
            </a>
          </div>
        </li>)}
      </ul>
    </section>)}
  </div>;
}