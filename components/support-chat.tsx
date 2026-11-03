"use client"

// tawk.to live-chat loader, scoped by route.
//
// The widget is a fixed floating layer, so on the admin console it sat on top of the merchant
// KPI tiles and ledger rows. Two things are needed to clear it, because the widget is injected
// once and then persists across client-side navigations:
//   1. it is never injected for a staff route, so a direct visit to /admin requests nothing;
//   2. when someone walks into /admin from a public page it is hidden, and shown again on exit.
// hideWidget / showWidget are documented tawk.to methods (developer.tawk.to/jsapi).
import Script from "next/script"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { isStaffRoute } from "@/lib/route-scope"

type TawkApi = {
  hideWidget?: () => void
  showWidget?: () => void
  onLoad?: () => void
}

function readTawkApi(): TawkApi | undefined {
  if (typeof window === "undefined") return undefined
  return (window as unknown as { Tawk_API?: TawkApi }).Tawk_API
}

export default function SupportChat() {
  const pathname = usePathname()
  const staff = isStaffRoute(pathname)

  useEffect(() => {
    const api = readTawkApi()
    if (!api) return
    // The widget may still be booting; both calls are no-ops until it exists, and the onLoad
    // guard inside the snippet covers the case where it finishes loading while on /admin.
    try {
      if (staff) api.hideWidget?.()
      else api.showWidget?.()
    } catch {
      // never let a third-party API hiccup break the page
    }
  }, [staff])

  if (staff) return null

  return (
    <Script id="tawk-to-loader" strategy="afterInteractive">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        Tawk_API.onLoad=function(){
          if(location.pathname==='/admin'||location.pathname.indexOf('/admin/')===0){ Tawk_API.hideWidget(); }
        };
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/6ae85667fceb143c3f37e8c6/1k6dp31gm';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  )
}
