import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TradePage from "@/components/TradePage";
import { TRADES, TRADE_ORDER, tradeHref, type TradeSlug } from "@/data/site";

export function generateStaticParams() {
  return TRADE_ORDER.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tr = TRADES[params.slug as TradeSlug];
  if (!tr) return {};
  return {
    title: tr.long.fr,
    description: tr.seo.fr,
    alternates: { canonical: tradeHref(tr.slug) },
  };
}

export const dynamicParams = false;

export default function MetierPage({ params }: { params: { slug: string } }) {
  if (!TRADE_ORDER.includes(params.slug as TradeSlug)) notFound();
  return <TradePage slug={params.slug as TradeSlug} />;
}
