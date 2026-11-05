import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Preloader } from "@/components/site/Preloader";
import { StoryExperience } from "@/components/story/StoryExperience";
import { ProductWorld } from "@/components/products/ProductWorld";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return <><Preloader /><Header /><StoryExperience /><ProductWorld /></>;
}
