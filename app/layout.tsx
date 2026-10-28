import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import Script from 'next/script'
import crypto from "crypto"

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


  return <ClientLayout>
    <Scripts/>
    <Analytics/>
    <SpeedInsights/>
    {children}
  </ClientLayout>
}
