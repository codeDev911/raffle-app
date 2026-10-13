"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Clock } from "lucide-react"

const fallbackRaffles = [
    {
      id: 1,
      price: "₨700",
      days: 2,
      image: "https://www.gari.pk/images/new/bikes/2022-09/363_1_29491.jpg",
    },
    {
      id: 2,
      price: "₨400",
      days: 5,
      image: "https://poedagar.store/wp-content/uploads/2022/03/01-5.jpg.webp",
    },
    {
      id: 3,
      price: "₨1,000",
      days: 12,
      image:
        "https://asia-exstatic-vivofs.vivo.com/PSee2l50xoirPK7y/1733888141158/f23ef2b46e7954c74853f1b939dddb27.png",
    },
    {
      id: 4,
      price: "₨400",
      days: 8,
      image: "https://starcity.pk/wp-content/uploads/2025/01/main.jpg",
    },
    {
      id: 5,
      price: "₨300",
      days: 15,
      image: "https://m.media-amazon.com/images/I/61FPsPQzhBL._AC_SL1500_.jpg",
    },
    {
      id: 6,
      price: "₨350",
      days: 6,
      image:
        "https://i5.walmartimages.com/seo/Lenovo-15-6-1080p-Touchscreen-PC-Laptop-Intel-Core-i5-16GB-RAM-512GB-HD-Windows-11-Home-Abyss-Blue-82FG015RUS_348f30a1-153f-4d27-8d14-a087b00c5e7d.6b78d180dfc92930be43e7c1c05f0065.jpeg",
    },
    {
      id: 7,
      price: "₨600",
      days: 10,
      image: "https://www.onestopmall.pk/cdn/shop/files/Untitleddesign_5.jpg?v=1734438561",
    },
    {
      id: 8,
      price: "₨250",
      days: 20,
      image: "https://xcessorieshub.com/wp-content/uploads/2024/10/iPhone-16-Pro-Desert-Titanium-1.webp",
    },
    {
      id: 9,
      price: "₨1050",
      days: 3,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/1/1a/Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg",
    },
    {
      id: 10,
      price: "₨800",
      days: 7,
      image:
        "https://www.cnet.com/a/img/resize/8ac23b08c4b7cb7645aec9fdcf026af94e6b7159/hub/2015/04/07/b35f1174-696c-4d25-8a4f-fa16a2842338/macbook-air-gold-2015-16.jpg?auto=webp&width=768",
    },
    {
      id: 11,
      price: "₨450",
      days: 4,
      image:
        "https://www.bhphotovideo.com/images/fb/hp_g6r14ua_aba_15_p030nr_a8_5545m_8gb_1tb_windows8_1_15_6_1057136.jpg",
    },
    {
      id: 12,
      price: "₨300",
      days: 9,
      image: "https://winblogs.thesourcemediaassets.com/sites/2/2016/09/Dell-XPS-1.jpg",
    },
    {
      id: 13,
      price: "₨400",
      days: 11,
      image: "https://cellmart.pk/wp-content/uploads/2024/07/apple-watch-se-2022-blk-cellmart.png",
    },
    {
      id: 14,
      price: "₨350",
      days: 14,
      image: "https://images-cdn.ubuy.co.in/654b8e16333d0d5c3130b3e8-lige-mens-watches-waterproof-stainless.jpg",
    },
    {
      id: 15,
      price: "₨700",
      days: 6,
      image: "https://stryderbikes.com/cdn/shop/files/Zeeta_27_Forest_Green.jpg?v=1740993974&width=1946",
    },
    {
      id: 16,
      price: "₨500",
      days: 8,
      image: "//image.made-in-china.com/202f0j00KGVqzlWCnFrk/Electric-Rickshaw-3-Wheel-EV-for-Daily-Life.webp",
    },
  ]

const PinterestRaffleGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dbRaffles, setDbRaffles] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/raffles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((r: any) => ({
            id: r.id,
            price: `₨${r.price.toLocaleString()}`,
            image: r.image || r.gallery?.[0] || "/placeholder.jpg",
            title: r.title,
          }))
          setDbRaffles(formatted)
        }
      })
      .catch((err) => console.error("Error fetching raffles for grid:", err))
  }, [])

  const currentRaffles = dbRaffles.length > 0 ? dbRaffles : fallbackRaffles

  // Fisher-Yates shuffle algorithm for proper randomization
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Create multiple unique sets
  const createExtendedRaffles = () => {
    const sets = []
    const multiplier = currentRaffles.length < 8 ? 6 : 3
    for (let i = 0; i < multiplier; i++) {
      sets.push(...shuffleArray(currentRaffles))
    }
    return sets
  }

  const allRaffles = createExtendedRaffles()

  // Custom Masonry Component
  const MasonryGrid = ({ children }: { children: React.ReactNode }) => {
    return (
      <div
        className="masonry-grid"
        style={{
          display: "flex",
          marginLeft: "-16px",
          width: "auto",
        }}
      >
        <div
          className="masonry-grid_column"
          style={{
            paddingLeft: "16px",
            backgroundClip: "padding-box",
            flex: 1,
          }}
        >
          {React.Children.toArray(children).filter((_, index) => index % 5 === 0)}
        </div>
        <div
          className="masonry-grid_column"
          style={{
            paddingLeft: "16px",
            backgroundClip: "padding-box",
            flex: 1,
          }}
        >
          {React.Children.toArray(children).filter((_, index) => index % 5 === 1)}
        </div>
        <div
          className="masonry-grid_column"
          style={{
            paddingLeft: "16px",
            backgroundClip: "padding-box",
            flex: 1,
          }}
        >
          {React.Children.toArray(children).filter((_, index) => index % 5 === 2)}
        </div>
        <div
          className="masonry-grid_column"
          style={{
            paddingLeft: "16px",
            backgroundClip: "padding-box",
            flex: 1,
          }}
        >
          {React.Children.toArray(children).filter((_, index) => index % 5 === 3)}
        </div>
        <div
          className="masonry-grid_column"
          style={{
            paddingLeft: "16px",
            backgroundClip: "padding-box",
            flex: 1,
          }}
        >
          {React.Children.toArray(children).filter((_, index) => index % 5 === 4)}
        </div>
      </div>
    )
  }

  // Responsive Masonry Component
  const ResponsiveMasonryGrid = ({ children }: { children: React.ReactNode }) => {
    return (
      <>
        {/* Mobile - 2 columns */}
        <div className="block sm:hidden">
          <div
            className="masonry-grid"
            style={{
              display: "flex",
              marginLeft: "-16px",
              width: "auto",
            }}
          >
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 2 === 0)}
            </div>
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 2 === 1)}
            </div>
          </div>
        </div>

        {/* Tablet - 3 columns */}
        <div className="hidden sm:block md:hidden">
          <div
            className="masonry-grid"
            style={{
              display: "flex",
              marginLeft: "-16px",
              width: "auto",
            }}
          >
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 3 === 0)}
            </div>
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 3 === 1)}
            </div>
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 3 === 2)}
            </div>
          </div>
        </div>

        {/* Desktop - 4 columns */}
        <div className="hidden md:block lg:hidden">
          <div
            className="masonry-grid"
            style={{
              display: "flex",
              marginLeft: "-16px",
              width: "auto",
            }}
          >
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 4 === 0)}
            </div>
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 4 === 1)}
            </div>
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 4 === 2)}
            </div>
            <div
              className="masonry-grid_column"
              style={{
                paddingLeft: "16px",
                backgroundClip: "padding-box",
                flex: 1,
              }}
            >
              {React.Children.toArray(children).filter((_, index) => index % 4 === 3)}
            </div>
          </div>
        </div>

        {/* Large Desktop - 5 columns */}
        <div className="hidden lg:block">
          <MasonryGrid>{children}</MasonryGrid>
        </div>
      </>
    )
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 2

    const animate = () => {
      scrollPosition += scrollSpeed

      // Reset position when we've scrolled through about 2/3 of content
      if (scrollPosition >= container.scrollHeight * 0.66) {
        scrollPosition = 0
      }

      container.scrollTop = scrollPosition
      animationId = requestAnimationFrame(animate)
    }

    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate)
    }, 2000)

    return () => {
      cancelAnimationFrame(animationId)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto h-[600px] relative">
      {/* Fade effects at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

      <div
        ref={containerRef}
        className="h-full overflow-hidden"
        style={{
          scrollBehavior: "auto",
        }}
      >
        <div className="p-4" style={{ minHeight: "200%" }}>
          <ResponsiveMasonryGrid>
            {allRaffles.map((raffle, index) => (
              <Link
                key={`${raffle.id}-${index}`}
                href={`/raffles/${raffle.id}`}
                className="block relative cursor-pointer overflow-hidden rounded-2xl shadow-lg bg-white mb-4 hover:opacity-95 transition-all hover:scale-[1.02]"
              >
                <img
                  src={raffle.image || "/placeholder.svg"}
                  alt={raffle.title || "Raffle prize"}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />

                {/* Price badge - Bottom left */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {raffle.price}
                  </div>
                </div>
              </Link>
            ))}
          </ResponsiveMasonryGrid>
        </div>
      </div>
    </div>
  )
}

export default PinterestRaffleGrid
