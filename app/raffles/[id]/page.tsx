import { Metadata } from "next";
import ClientSide from "./ClientSide"

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raffleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/raffles/${params.id}`, {
  method: 'GET',
  cache: 'no-store', // Important for SSR metadata freshness
});

  let raffle : any
  if(raffleResponse.ok){
    raffle =  await raffleResponse.json()
  }

  const title = `${raffle.title} | PakRaffle`;
  const description = raffle.description;
  const image = raffle.image || raffle.gallery?.[0] || '/default.jpg';
  const url = `https://pakraffle.com/raffles/${params.id}`;

  return {
    title,
    description,
    keywords: ['raffles', 'giveaways', 'win prizes', 'PakRaffle'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: raffle.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RaffleDetailPage({ params }: { params: { id: string } }) {
     const raffleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/raffles/${params.id}`, {
      method: 'GET',
      cache: 'no-store', // Important for SSR metadata freshness
    });
    const raffleData = await raffleResponse.json()

    return (
      <ClientSide raffle={raffleData}/>
    )
 
}