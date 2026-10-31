import type { Metadata } from "next"
import { JsonLd } from "@/components/marketing/kit"
import ListProductPage from "./ListProductClient"

export const metadata: Metadata = {
  title: "List Your Product for a Raffle — Sell It Through a Public Draw | PakRaffle",
  description:
    "Turn your bike, phone, console or appliance into a fully funded lucky draw. List your product on PakRaffle: verified review, insured custody, ticket sales, live-streamed draw and 100% participant refunds if the goal is missed. 8% platform fee, no upfront cost.",
  keywords: [
    "list product raffle Pakistan",
    "sell through lucky draw",
    "raffle my item Pakistan",
    "host a raffle Pakistan",
    "sell bike raffle",
    "product draw campaign Pakistan",
    "PakRaffle list product",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/list-product",
  },
  openGraph: {
    title: "List Your Product for a Raffle | PakRaffle Pakistan",
    description:
      "Convert your product into a public lucky draw — verified, insured, live-streamed. Full refunds if the goal is missed. Only 8% platform fee.",
    url: "https://pakraffle.com/list-product",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Product for a Raffle | PakRaffle",
    description: "Bigger reach than a listing page. Your item, our audience, a live-streamed draw.",
  },
}

export default function ListProductSeoPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Product Raffle Listing",
            name: "List Your Product on a Public Lucky Draw — PakRaffle",
            url: "https://pakraffle.com/list-product",
            description:
              "PakRaffle turns sellers' products into verified lucky draw campaigns: authenticity review, insured physical custody, ticket sales, live-streamed draw, and free nationwide prize delivery.",
            provider: { "@id": "https://pakraffle.com/#organization" },
            areaServed: { "@type": "Country", name: "Pakistan" },
            offers: {
              "@type": "Offer",
              price: "8",
              priceCurrency: "PKR",
              description: "8% platform fee on the draw — charged only when the raffle launches.",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "List Product", item: "https://pakraffle.com/list-product" },
            ],
          },
        ]}
      />
      <ListProductPage />
    </>
  )
}
