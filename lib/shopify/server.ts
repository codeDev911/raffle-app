// Shopify wiring for the storefront widget.
// The merchant installs it by hand: we hand over the webhook URL and the script-tag snippet,
// so there is no OAuth app to keep in sync with each shop.

/** One widget script serves every store; the store id is baked into its src. */
export const widgetScriptUrl = (base: string, storeId: string) =>
  `${base}/merchants/widget.js?store=${encodeURIComponent(storeId)}&v=2`

/** The exact tag a merchant pastes into theme.liquid, before </head>. */
export const widgetSnippet = (base: string, storeId: string) =>
  `<script async src="${widgetScriptUrl(base, storeId)}"></script>`
