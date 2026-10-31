import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import ClientLayout from "./ClientLayout"
import Script from 'next/script'
import crypto from "crypto"

const inter = Inter({ subsets: ["latin"] })
// Geometric display face for the marketing headlines; exposed as a CSS variable so only the
// pages that ask for `font-display` pick it up.
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

const Analytics = () => null
const SpeedInsights = () => null


// Ai chat bot
const Scripts = () => {
  return (
    <Script id="chatbase-loader" strategy="afterInteractive">
  {`
    (function(){
    window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-EX44PLKN82');
      if(!window.chatbase || window.chatbase("getState") !== "initialized"){
        window.chatbase = (...arguments) => {
          if(!window.chatbase.q){ window.chatbase.q = [] }
          window.chatbase.q.push(arguments)
        };
        window.chatbase = new Proxy(window.chatbase, {
          get(target, prop){
            if(prop === "q"){ return target.q }
            return (...args) => target(prop, ...args)
          }
        })
      }
      const onLoad = function(){
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "_H-nlMU3DumW5G2WeDwSg";
        script.domain = "www.chatbase.co";
        document.body.appendChild(script);
      };
      if(document.readyState === "complete"){
        onLoad()
      } else {
        window.addEventListener("load", onLoad)
      }
    })();
  `}
</Script>

  )
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

// Replace this with your actual secret key from Chatbase
const secret = process.env.NEXT_PUBLIC_CODEBASE_AGENT_SECRET_KEY || "";

// Replace this with the actual user's unique ID (must be a string)
const userId = generateUUID(); // e.g., "b7e70f19-dc91-4c7c-9e76-xyz"

// Generate the HMAC SHA-256 hash
const hash = crypto
  .createHmac('sha256', secret)
  .update(userId)
  .digest('hex');


  // The document shell must be rendered by this Server Component — a client component owning
  // <html>/<body> wipes the page at hydration. Route-aware head logic lives in ClientLayout's
  // providers, which render inside <body>.
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-EX44PLKN82"></script>
        <meta name="monetag" content="78091832d51a3d2d1cd351e318c806b9"></meta>
        <meta name="google-adsense-account" content="ca-pub-8516478537168335"></meta>
        {/* The merchant workspace is the app's only dark-mode corner: the saved theme is applied
            there (and only there) via an attribute on <html> that the palette swap in globals.css
            keys off. It must run before first paint so a dark-mode visitor never sees a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('raffle-merchant-theme');var p=location.pathname;if(t==='dark'&&(p.startsWith('/merchants')||p.startsWith('/auth/merchant'))){document.documentElement.setAttribute('data-merchant-workspace','dark')}else{document.documentElement.removeAttribute('data-merchant-workspace')}catch(e){}`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          <Scripts/>
          <Analytics/>
          <SpeedInsights/>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
