import type { ProductLink, ProductSection } from "@/data/product-details";

/** A section heading in the story's chapter type: two lines, the last ending with a gold full stop (not after a "?"). */
function Heading({ lines, id }: { lines: readonly string[]; id: string }) {
  return <h2 id={id} className="pp-heading">
    {lines.map((line, index) => <span key={line} className="pp-heading-line">{index > 0 && " "}{line}{index === lines.length - 1 && !line.endsWith("?") && <em aria-hidden="true">.</em>}</span>)}
  </h2>;
}

type ProductSectionsProps = {
  sections: readonly ProductSection[];
  /** Product page addresses by id, for links to other products. */
  paths: Record<string, string>;
};

/**
 * A product's longer sections after "How to apply" (data/product-details `sections`): each a heading beside its
 * content – paragraphs, cards, a list, a table, an aside, a note and links – in the page's two columns.
 */
export function ProductSections({ sections, paths }: ProductSectionsProps) {
  // A link to a product resolves to its page; a link with an href goes where it says; a link to neither is dropped.
  const hrefFor = (link: ProductLink) => link.href ?? (link.product ? paths[link.product] : undefined);
  const linkButton = (link: ProductLink) => {
    const href = hrefFor(link);
    return href && <a className="pp-ghost pp-info-link" href={href}>{link.label}<span aria-hidden="true">⟶</span></a>;
  };
  return <>{sections.map((section) => {
    const headingId = `pp-${section.id}-heading`;
    const List = section.ordered ? "ol" : "ul";
    return <section key={section.id} id={section.id} className="pp-section pp-info" aria-labelledby={headingId}>
      <Heading id={headingId} lines={section.heading} />
      <div className="pp-info-body pp-reveal">
        {section.intro?.map((paragraph) => <p key={paragraph} className="pp-info-text">{paragraph}</p>)}
        {section.cards && <ul className="pp-info-cards" data-columns={section.cardColumns}>
          {section.cards.map((card) => <li key={card.title} className="pp-info-card">
            {card.meta && <p className="pp-info-meta">{card.meta}</p>}
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            {card.steps && <ol className="pp-info-card-steps">{card.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
            {card.note && <p className="pp-info-card-note">{card.note}</p>}
          </li>)}
        </ul>}
        {section.list && <List className={section.ordered ? "pp-info-list pp-info-list--ordered" : "pp-info-list"}>
          {section.list.map((item) => <li key={item}>{item}</li>)}
        </List>}
        {section.table && <div className="pp-info-table-wrap">
          <table className="pp-info-table">
            <thead><tr>{section.table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
            <tbody>{section.table.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={cell} scope="row">{cell}</th> : <td key={`${index}-${cell}`}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>}
        {section.aside && <aside className="pp-info-aside">
          <h3>{section.aside.title}</h3>
          {section.aside.text && <p>{section.aside.text}</p>}
          {section.aside.items && <ul>{section.aside.items.map((item) => <li key={item}>{item}</li>)}</ul>}
        </aside>}
        {section.note && <p className="pp-note">{section.note}</p>}
        {section.link && linkButton(section.link)}
        {section.links && <ul className="pp-info-links">
          {section.links.filter((link) => hrefFor(link)).map((link) => <li key={link.label}>{linkButton(link)}</li>)}
        </ul>}
      </div>
    </section>;
  })}</>;
}