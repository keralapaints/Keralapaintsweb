import { benefits } from "@/data/products";

export function HomeFeatures({ detailed }: { detailed: boolean }) {
  return <ul className={`home-features${detailed ? " home-features-detailed" : ""}`}>{benefits.map((feature) => <li key={feature.label} data-copy-detail>
    <span className="home-icon"><svg width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={feature.path} /></svg></span>
    <h3>{detailed ? feature.label : feature.short}</h3>
    {detailed && <p>{feature.description}</p>}
  </li>)}</ul>;
}
