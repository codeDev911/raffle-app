/**
 * PakRaffle storefront widget (served to Shopify stores from theme.liquid's <head>).
 *
 *  1. Reads the live cart from /cart.js plus the product on the page, and asks PakRaffle whether the
 *     order qualifies for a free lucky-draw entry. The card renders inline above the checkout button
 *     on /cart, inside the product's details column on /products/*, and floats bottom-right elsewhere.
 *  2. On a product page the card leads with the campaign rule itself — "Buy 3+ items to win <prize>",
 *     how it is claimed, the prize and the draw date — so the offer is readable before anything is
 *     in the cart. Sending the product also lets a campaign that is filtered to specific products
 *     advertise on exactly those products' pages.
 *  3. Adopts the store's own design. It measures the theme's buy button, text colours, surfaces,
 *     borders, radii and font stacks, then paints the card with those tokens; anything unreadable
 *     falls back to PakRaffle green. Every card lives in its own shadow root, so the theme's CSS
 *     cannot reach inside and nothing the card declares can leak out into the storefront.
 *  4. Re-checks on every cart mutation, so an AJAX cart drawer crossing the threshold updates the
 *     card immediately instead of waiting for a page reload.
 *  5. Stamps a browser nonce on the cart as a note attribute so the order webhook can tie the
 *     minted ticket back to this browser, plus the unlocked campaign title for the merchant.
 *  6. After checkout, the next storefront page load finds the ticket with that nonce and shows the
 *     congratulations popup with the ticket number (retried, because the webhook can land a few
 *     seconds after the shopper returns).
 *
 * Written as a plain ES5-style IIFE: it runs inside the merchant's theme, not in Next.js.
 */
;(function () {
  "use strict"

  var script = document.currentScript
  if (!script) {
    var scripts = document.getElementsByTagName("script")
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (/\/merchants\/widget\.js/.test(scripts[i].src)) {
        script = scripts[i]
        break
      }
    }
  }
  if (!script || !script.src) return

  var source
  try {
    source = new URL(script.src)
  } catch (e) {
    return
  }
  var storeId = source.searchParams.get("store")
  if (!storeId) return
  var API = source.origin
  // Shopify's hosted checkout is not theme-rendered, so the script cannot run there. Everything
  // up to /checkout is ours: the cart page is where the "you qualify" card does its work.
  if (window.location.pathname.indexOf("/checkout") === 0) return

  var TOKEN_KEY = "pakraffle_token_" + storeId
  var SEEN_KEY = "pakraffle_seen_" + storeId
  var DISMISS_KEY = "pakraffle_dismiss_" + storeId
  var DISMISS_MINUTES = 30
  var DEBUG = /[?&]pakraffle_debug=1/.test(window.location.search)

  var state = {
    token: "",
    cart: null,
    status: null,
    product: null,
    host: null,
    root: null,
    inline: null,
    tokens: null,
    refreshing: false,
    quiet: false,
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  function log() {
    if (!DEBUG || !window.console) return
    var args = ["[PakRaffle]"].concat(Array.prototype.slice.call(arguments))
    console.info.apply(console, args)
  }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key)
      window.localStorage.setItem(key, value)
    } catch (e) {}
    return value === undefined ? null : value
  }

  function deviceToken() {
    var existing = store(TOKEN_KEY)
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing
    var fresh = ""
    try {
      if (window.crypto && window.crypto.randomUUID) fresh = window.crypto.randomUUID().replace(/-/g, "")
    } catch (e) {}
    if (!fresh) {
      var chars = "abcdef0123456789"
      for (var i = 0; i < 32; i++) fresh += chars.charAt(Math.floor(Math.random() * 16))
    }
    store(TOKEN_KEY, fresh)
    return fresh
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms)
    })
  }

  function getCart() {
    return fetch(window.location.origin + "/cart.js?" + Date.now(), {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        return res.ok ? res.json() : null
      })
      .catch(function () {
        return null
      })
  }

  function cartItems(cart) {
    return (cart && cart.items ? cart.items : []).slice(0, 60).map(function (item) {
      return {
        title: item.title || item.product_title || "Item",
        sku: item.sku || null,
        productId: item.product_id ? String(item.product_id) : null,
        variantId: item.variant_id ? String(item.variant_id) : null,
        quantity: Number(item.quantity) || 0,
        unitPrice: (Number(item.price) || 0) / 100,
      }
    })
  }

  function cartAmount(cart) {
    var cents = cart && (cart.items_subtotal_price != null ? cart.items_subtotal_price : cart.total_price)
    return Math.max(0, (Number(cents) || 0) / 100)
  }

  /**
   * Cart attributes travel to the order as note_attributes: the token ties the order back to
   * this browser, and the unlocked campaign shows up in the merchant's Shopify order page.
   */
  function stampCart(cart, status) {
    if (!cart || !cart.item_count) return Promise.resolve()
    var attributes = cart.attributes || {}
    var unlocked = status && status.eligible && status.campaign ? String(status.campaign.title || "") : ""
    if (attributes._pakraffle_token === state.token && (attributes._pakraffle_entry || "") === unlocked) {
      return Promise.resolve()
    }
    state.quiet = true
    return fetch(window.location.origin + "/cart/update.js", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        attributes: {
          _pakraffle_token: state.token,
          _pakraffle_store: storeId,
          _pakraffle_entry: unlocked,
        },
      }),
    })
      .catch(function () {})
      .then(function () {
        // Our own attribute write must not trigger another eligibility round trip.
        state.quiet = false
      })
  }

  function postStatus(cart) {
    return fetch(API + "/api/merchants/storefront/status", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({
        storeId: storeId,
        amount: cartAmount(cart),
        items: cartItems(cart),
        // Tells the server which item the shopper is looking at, so product-filtered campaigns can
        // be advertised on the right product page instead of never appearing at all.
        product: readProduct(),
      }),
    })
      .then(function (res) {
        return res.ok ? res.json() : null
      })
      .catch(function () {
        return null
      })
  }

  function getClaims() {
    return fetch(
      API + "/api/merchants/storefront/claim?store=" + encodeURIComponent(storeId) + "&token=" + encodeURIComponent(state.token),
      { cache: "no-store" },
    )
      .then(function (res) {
        return res.ok ? res.json() : null
      })
      .catch(function () {
        return null
      })
  }

  // ── page detection ─────────────────────────────────────────────────────────

  var BUY_SELECTORS = [
    'form[action^="/cart/add"] button[type="submit"]',
    'form[action^="/cart/add"] button[name="add"]',
    'form[action^="/cart/add"] [name="add"]',
    ".product-form__submit",
    "#AddToCart",
    ".add-to-cart-button",
    "button.add-to-cart",
    "[data-add-to-cart]",
  ]

  /** Details columns across the themes merchants actually use (Dawn, Refresh, Legacy, Impulse…). */
  var PRODUCT_CONTAINERS = [
    ".product__info-container",
    ".product-details__info-wrapper",
    ".product-info__container",
    ".product-information",
    "[data-product-information]",
    ".product-single__meta",
    ".product-single__info",
    ".product__info-wrapper",
    ".product-info-main",
    ".product-info",
    ".product__details",
    "#ProductInfo",
    "#product-info",
  ]

  function visible(el) {
    return Boolean(el && el.getClientRects && el.getClientRects().length > 0)
  }

  /** First match in document order that the theme actually renders — never a hidden quick-add copy. */
  function firstVisible(selectors, scope) {
    for (var i = 0; i < selectors.length; i++) {
      var found = (scope || document).querySelectorAll(selectors[i])
      for (var j = 0; j < found.length; j++) {
        if (visible(found[j])) return found[j]
      }
    }
    return null
  }

  /** Where the card belongs on this page: the cart, a product's details column, or nowhere. */
  function pageKind() {
    // Market and language paths (/en/products/…, /en-pk/products/…) keep the same placement.
    var path = window.location.pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/)/i, "")
    if (/^\/cart(\/|$)/.test(path)) return "cart"
    // Collection grids link collection-scoped (/collections/lawn/products/kameez), so the product
    // handle can sit anywhere in the path — testing only the prefix would hide the card there.
    return path.indexOf("/products/") >= 0 ? "product" : null
  }

  /** Dawn-style themes wrap the product in one section; quick-add forms live outside it. */
  function productScope() {
    return firstVisible([".shopify-section-main-product", "main", "[role='main']"])
  }

  /**
   * Pulls a number out of whatever the theme prints as a price. "Rs. 2,499.00" must read as 2499 —
   * stripping every non-digit-dot would leave the abbreviation's point as a decimal separator and
   * turn the whole thing into NaN, so only the numeric run itself is taken and its last one wins
   * (Shopify puts the selling price after any compare-at price).
   */
  function readPrice(value) {
    var runs = String(value == null ? "" : value).match(/\d[\d.,]*\d|\d/g)
    if (!runs) return 0
    var token = runs[runs.length - 1]
    var decimal = /[.,](\d{1,2})$/.exec(token)
    var digits = decimal ? token.slice(0, decimal.index) : token
    var whole = Number(digits.replace(/[^\d]/g, "")) || 0
    return decimal ? whole + Number("0." + decimal[1]) : whole
  }

  /**
   * What the shopper is reading, from the most authoritative source the theme offers down to the
   * visible markup. Campaign filters match on title/sku/product/variant id/handle, so any one of
   * these is enough to answer "does this product count?".
   */
  function readProduct() {
    if (state.product !== null) return state.product

    var out = { title: "", productId: null, variantId: null, sku: null, handle: null, price: 0 }
    var win = window

    function takeTitle(value) {
      if (!out.title && value) out.title = String(value).trim().slice(0, 200)
    }
    function takeId(key, value) {
      if (!out[key] && value !== null && value !== undefined && value !== "") out[key] = String(value)
    }
    function takePrice(value) {
      var amount = readPrice(value)
      if (!out.price && amount > 0) out.price = amount
    }
    function takeVariant(variant) {
      if (!variant) return
      takeId("variantId", variant.id)
      takeTitle(variant.title && variant.title !== "Default Title" ? variant.title : "")
      takeId("sku", variant.sku)
      takePrice(variant.price)
    }

    // 1. Themes that print the product object for their own JS (Debut, Impulse, Prestige, Panthera…).
    var globals = [win.product, win.env && win.env.product, win.theme && win.theme.product, win._product]
    for (var g = 0; g < globals.length; g++) {
      var src = globals[g]
      if (src && (src.id || src.title)) {
        takeTitle(src.title)
        takeId("productId", src.id)
        takeId("handle", src.handle)
        takePrice(src.priceMin || src.price)
        takeVariant(src.selected_variant || (src.variants && src.variants[0]))
        break
      }
    }

    // 2. Section JSON blobs, the ProductJson-<id> script many templates ship.
    if (!out.productId || !out.title) {
      var blobs = document.querySelectorAll('[id^="ProductJson"], [data-product-json], script[data-product-id]')
      for (var b = 0; b < blobs.length; b++) {
        try {
          var parsed = JSON.parse(blobs[b].textContent || "{}")
          takeTitle(parsed.title)
          takeId("productId", parsed.id)
          takeId("handle", parsed.handle)
          takePrice(parsed.priceMin || parsed.price)
          takeVariant(parsed.selected_variant || (parsed.variants && parsed.variants[0]))
        } catch (e) {}
        if (out.title && (out.variantId || out.productId)) break
      }
    }

    // 3. Ids the theme already carries in the DOM.
    if (!out.productId) {
      var scoped = productScope() || document
      var stamped = scoped.querySelectorAll("[data-product-id]")
      for (var s = 0; s < stamped.length; s++) {
        takeId("productId", stamped[s].getAttribute("data-product-id"))
        if (out.productId) break
      }
    }
    var forms = (productScope() || document).querySelectorAll('form[action^="/cart/add"]')
    for (var f = 0; f < forms.length; f++) {
      var form = forms[f]
      if (!visible(form)) continue
      takeId("productId", form.getAttribute("data-product-id"))
      var variantInput = form.querySelector('[name="id"]')
      takeId("variantId", variantInput && variantInput.value)
      break
    }

    // 4. Open Graph and the visible title/price, for themes that expose nothing else.
    if (!out.title) {
      takeTitle(metaContent("og:title"))
      var heading = firstVisible(
        ["h1.product-title", ".product-single__title", "[data-product-title]", "h1"],
        productScope() || document,
      )
      if (heading) takeTitle(heading.textContent)
    }
    if (!out.price) {
      takePrice(metaContent("og:price:amount"))
      var priceNode = firstVisible([".price-item--regular", ".price__regular .price-item", "[data-price]", ".price"], productScope() || document)
      if (priceNode) takePrice(priceNode.textContent)
    }

    // 5. The handle. Themes stamp it on a node, and failing that the URL itself is the one place
    // Shopify always spells it: /products/<handle>, optionally after a collection (/collections/x/products/<handle>).
    if (!out.handle) {
      var stamped = firstVisible(["[data-product-handle]"], productScope() || document)
      takeId("handle", stamped && stamped.getAttribute("data-product-handle"))
      var fromUrl = /\/products\/([^/?#]+)/i.exec(window.location.pathname)
      takeId("handle", fromUrl && fromUrl[1].replace(/\.(json|xml|csv|js)$/i, ""))
    }

    state.product = out.title || out.productId || out.variantId || out.sku || out.handle ? out : null
    log("product context", state.product)
    return state.product
  }

  function metaContent(property) {
    var tag = document.querySelector('meta[property="' + property + '"], meta[itemprop="' + property + '"]')
    return tag ? tag.getAttribute("content") : ""
  }

  // ── theme tokens ───────────────────────────────────────────────────────────

  var BRAND = {
    accent: { r: 5, g: 150, b: 105 },
    ink: { r: 15, g: 23, b: 42 },
    surface: { r: 255, g: 255, b: 255 },
    line: { r: 226, g: 232, b: 240 },
    radius: 16,
    font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  }

  var ACCENT_VARS = [
    "--color_accent", "--color_button", "--primary-button-background", "--buttons-primary-background",
    "--button-primary-background", "--color-base-accent-1", "--colorBaseAccent1", "--colorPrimary",
    "--color-accent", "--accent", "--pikachu-theme-color", "--color_schemes_button", "--color_button_primary",
    "--shopify-button-color", "--color-base-accent-2", "--colorBaseAccent2",
  ]
  var INK_VARS = [
    "--color_text", "--color-base-text", "--colorBaseText", "--colorText", "--color-foreground",
    "--foreground", "--color_foreground", "--text-color", "--text", "--palette-text",
  ]
  var SURFACE_VARS = [
    "--color_body_bg", "--color_background", "--color-base-background-1", "--colorBaseBackground1",
    "--colorBackground", "--background", "--color_bg", "--body-bg", "--palette-background",
  ]
  var LINE_VARS = [
    "--color_border", "--colorBorder", "--color-base-border", "--border", "--divider", "--color-line",
    "--color_inputs",
  ]

  // Canvas normalises any CSS colour the browser understands (hex, hsl(), oklch(), named) into
  // #rrggbb / rgba(), so a modern theme's tokens are still readable.
  var colourCache = {}
  var colourCtx = null
  try {
    var canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    colourCtx = canvas.getContext("2d")
  } catch (e) {}

  function parseColor(value) {
    if (!value) return null
    var text = String(value).trim()
    var match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,]+([\d.]+))?\s*\)$/i.exec(text)
    if (match) {
      return { r: +match[1], g: +match[2], b: +match[3], a: match[4] === undefined ? 1 : +match[4] }
    }
    if (text.charAt(0) === "#") {
      var hex = text.slice(1)
      if (hex.length === 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2)
      if (hex.length !== 6 || /[^0-9a-f]/i.test(hex)) return null
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      }
    }
    return null
  }

  function toColor(value) {
    if (!value) return null
    var key = String(value)
    if (colourCache[key] !== undefined) return colourCache[key]
    var colour = null
    if (colourCtx) {
      try {
        colourCtx.fillStyle = "#000000"
        colourCtx.fillStyle = key
        colour = parseColor(colourCtx.fillStyle)
      } catch (e) {}
    }
    if (!colour) colour = parseColor(key)
    // Fully transparent is "no colour here", which is how themes hide a background they do not set.
    if (colour && (colour.a === 0 || isNaN(colour.r))) colour = null
    colourCache[key] = colour
    return colour
  }

  function over(fg, bg) {
    if (fg.a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 }
    var k = fg.a
    return { r: k * fg.r + (1 - k) * bg.r, g: k * fg.g + (1 - k) * bg.g, b: k * fg.b + (1 - k) * bg.b, a: 1 }
  }

  function mix(a, b, amount) {
    return {
      r: Math.round(a.r + (b.r - a.r) * amount),
      g: Math.round(a.g + (b.g - a.g) * amount),
      b: Math.round(a.b + (b.b - a.b) * amount),
      a: 1,
    }
  }

  function luminance(color) {
    var channel = function (value) {
      value /= 255
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
  }

  function contrast(a, b) {
    var one = luminance(a)
    var two = luminance(b)
    return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05)
  }

  function css(color) {
    return "rgb(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b) + ")"
  }

  /** Whatever the theme paints its button with, the label on it must stay readable. */
  function readableOn(background) {
    var dark = { r: 15, g: 23, b: 42 }
    var light = { r: 255, g: 255, b: 255 }
    return contrast(light, background) >= contrast(dark, background) ? light : dark
  }

  function firstColorOf(names, style) {
    for (var i = 0; i < names.length; i++) {
      var value = style.getPropertyValue(names[i])
      var colour = toColor(value)
      if (colour) return colour
    }
    return null
  }

  /** Nearest painted background: themes set surfaces on the section, the card or the body. */
  function paintedBackground(node) {
    var walker = node
    while (walker && walker.nodeType === 1) {
      var colour = toColor(getComputedStyle(walker).backgroundColor)
      if (colour) return colour
      walker = walker.parentElement
    }
    return null
  }

  function pixels(value) {
    var number = parseFloat(value)
    return isNaN(number) ? null : number
  }

  /**
   * Reads the storefront's own design decisions. Everything is optional: a theme that exposes
   * nothing readable leaves us on the PakRaffle palette, which is still a correct card.
   */
  function themeTokens() {
    if (state.tokens) return state.tokens
    if (!document.body) return fallbackTokens()

    var rootStyle = getComputedStyle(document.documentElement)
    var bodyStyle = getComputedStyle(document.body)
    var scope = productScope() || document

    var button = firstVisible(BUY_SELECTORS, scope) || firstVisible(BUY_SELECTORS)
    var buttonStyle = button ? getComputedStyle(button) : null

    var surface = paintedBackground(firstVisible(PRODUCT_CONTAINERS, scope) || scope) || paintedBackground(document.body)
    surface = surface || firstColorOf(SURFACE_VARS, rootStyle) || BRAND.surface
    var ink = toColor(bodyStyle.color) || firstColorOf(INK_VARS, rootStyle) || BRAND.ink
    var accent = buttonStyle ? toColor(buttonStyle.backgroundColor) : null
    accent = accent || firstColorOf(ACCENT_VARS, rootStyle) || BRAND.accent
    accent = over(accent, surface)
    var line = firstColorOf(LINE_VARS, rootStyle) || mix(ink, surface, 0.86)

    // A theme's own button label is only trusted if it actually reads against the button.
    var accentText = buttonStyle ? toColor(buttonStyle.color) : null
    if (accentText && contrast(accentText, accent) < 3) accentText = null
    accentText = accentText || readableOn(accent)

    var buttonRadius = buttonStyle ? pixels(buttonStyle.borderTopLeftRadius) : null
    var radius = buttonRadius === null ? BRAND.radius : Math.max(10, Math.min(22, Math.round(buttonRadius * 1.25) + 4))

    var heading = firstVisible(["h1", "h2"], scope)
    var headFont = heading ? getComputedStyle(heading).fontFamily : bodyStyle.fontFamily

    state.tokens = {
      accent: css(accent),
      accentInk: css(accentText),
      accentSoft: css(mix(accent, surface, 0.28)),
      accentDeep: css(mix(accent, { r: 0, g: 0, b: 0 }, 0.16)),
      ink: css(over(ink, surface)),
      muted: css(mix(over(ink, surface), surface, 0.42)),
      surface: css(over(surface, { r: 255, g: 255, b: 255 })),
      panel: css(mix(over(surface, { r: 255, g: 255, b: 255 }), { r: 255, g: 255, b: 255 }, 0.35)),
      line: css(over(line, surface)),
      tint: css(mix(accent, surface, 0.86)),
      tintLine: css(mix(accent, surface, 0.6)),
      radius: radius + "px",
      font: bodyStyle.fontFamily || BRAND.font,
      headFont: headFont || bodyStyle.fontFamily || BRAND.font,
    }
    log("theme tokens", state.tokens)
    return state.tokens
  }

  function fallbackTokens() {
    return {
      accent: css(BRAND.accent),
      accentInk: "#ffffff",
      accentSoft: "#34d399",
      accentDeep: "#047857",
      ink: "#0f172a",
      muted: "#475569",
      surface: "#ffffff",
      panel: "#f8fafc",
      line: "#e2e8f0",
      tint: "#ecfdf5",
      tintLine: "#a7f3d0",
      radius: "16px",
      font: BRAND.font,
      headFont: BRAND.font,
    }
  }

  /** Token name → CSS custom property, so the stylesheet below has one obvious vocabulary. */
  var TOKEN_VARS = {
    accent: "--pakr-accent",
    accentInk: "--pakr-accent-ink",
    accentSoft: "--pakr-accent-soft",
    accentDeep: "--pakr-accent-deep",
    ink: "--pakr-ink",
    muted: "--pakr-muted",
    surface: "--pakr-surface",
    panel: "--pakr-panel",
    line: "--pakr-line",
    tint: "--pakr-tint",
    tintLine: "--pakr-tint-line",
    radius: "--pakr-radius",
    font: "--pakr-font",
    headFont: "--pakr-head-font",
  }

  // Custom properties inherit, so setting them on the host reaches the card inside its shadow root.
  function applyTokens(node) {
    if (!node || !node.style || !node.style.setProperty) return
    var tokens = themeTokens()
    for (var key in TOKEN_VARS) {
      if (Object.prototype.hasOwnProperty.call(tokens, key)) {
        node.style.setProperty(TOKEN_VARS[key], String(tokens[key]))
      }
    }
  }

  // ── styles ─────────────────────────────────────────────────────────────────

  /**
   * Every selector is namespaced and every value comes from a token, so the card wears the store's
   * design instead of ours. The reset is confined to `.pakr-card` — a bare `*{}` here would restyle
   * the merchant's whole storefront whenever the card is mounted in the light DOM.
   */
  var BASE_CSS =
    ".pakr-card,.pakr-card *{box-sizing:border-box;margin:0;padding:0;font-family:var(--pakr-font,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif)}" +
    ".pakr-card{position:relative;width:342px;max-width:calc(100vw - 32px);background:var(--pakr-surface,#fff);" +
    "color:var(--pakr-ink,#0f172a);border:1px solid var(--pakr-line,#e2e8f0);border-radius:var(--pakr-radius,16px);" +
    "padding:14px 16px 15px;font-size:12px;line-height:1.5;text-align:left;letter-spacing:normal;" +
    "pointer-events:auto;animation:pakr-in .25s ease-out}" +
    ".pakr-card.pakr-stretch{width:100%;max-width:72rem;margin:0 auto}" +
    ".pakr-card.pakr-float{box-shadow:0 20px 46px -24px rgba(2,6,23,.38)}" +
    ".pakr-card.pakr-eligible{background:var(--pakr-tint,#ecfdf5);border-color:var(--pakr-tint-line,#6ee7b7)}" +
    "@keyframes pakr-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    ".pakr-head{display:flex;align-items:flex-start;gap:10px}" +
    ".pakr-seal{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:34px;height:34px;" +
    "border-radius:12px;background:var(--pakr-tint,#d1fae5);border:1px solid var(--pakr-tint-line,#6ee7b7);" +
    "font-size:17px;line-height:1}" +
    ".pakr-tag{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;" +
    "color:var(--pakr-accent-deep,#047857)}" +
    ".pakr-title{margin-top:3px;font-family:var(--pakr-head-font,var(--pakr-font));font-size:14px;font-weight:700;" +
    "line-height:1.3;color:var(--pakr-ink,#0f172a)}" +
    ".pakr-body{margin-top:8px;font-size:12px;line-height:1.55;color:var(--pakr-muted,#475569)}" +
    ".pakr-body b{color:var(--pakr-accent-deep,#047857);font-weight:700}" +
    ".pakr-bar{height:6px;margin-top:11px;border-radius:999px;overflow:hidden;background:var(--pakr-line,#e2e8f0)}" +
    ".pakr-bar i{display:block;height:100%;border-radius:999px;" +
    "background:linear-gradient(90deg,var(--pakr-accent-soft,#34d399),var(--pakr-accent,#059669))}" +
    ".pakr-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:11px}" +
    ".pakr-pill{font-size:10.5px;font-weight:600;white-space:nowrap;border-radius:999px;padding:3px 9px;" +
    "color:var(--pakr-accent-deep,#047857);background:var(--pakr-tint,#d1fae5);border:1px solid var(--pakr-tint-line,#a7f3d0)}" +
    ".pakr-pill.pakr-ghost{color:var(--pakr-muted,#475569);background:var(--pakr-panel,#f1f5f9);border-color:var(--pakr-line,#e2e8f0)}" +
    ".pakr-steps{display:grid;gap:7px;margin-top:11px}" +
    ".pakr-step{display:flex;gap:8px;font-size:11.5px;line-height:1.5;color:var(--pakr-muted,#475569)}" +
    ".pakr-step b{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:15px;height:15px;" +
    "margin-top:1px;border-radius:50%;background:var(--pakr-accent,#059669);color:var(--pakr-accent-ink,#fff);" +
    "font-size:9.5px;font-weight:700}" +
    ".pakr-step span{min-width:0}" +
    ".pakr-close{position:absolute;top:8px;right:10px;border:0;background:transparent;padding:2px;line-height:1;" +
    "font-size:16px;cursor:pointer;color:var(--pakr-muted,#94a3b8)}" +
    ".pakr-close:hover{color:var(--pakr-ink,#0f172a)}" +
    ".pakr-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;" +
    "padding-top:10px;border-top:1px solid var(--pakr-line,#e2e8f0)}" +
    ".pakr-brand{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;" +
    "color:var(--pakr-muted,#64748b)}" +
    ".pakr-brand img{display:block;width:18px;height:18px;border-radius:5px}" +
    ".pakr-terms{font-size:10.5px;white-space:nowrap;text-decoration:underline;text-underline-offset:2px;" +
    "color:var(--pakr-accent-deep,#475569)}" +
    ".pakr-terms:hover{color:var(--pakr-accent,#059669)}"

  var MODAL_CSS =
    ".pakr-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;" +
    "background:rgba(2,6,23,.66);pointer-events:auto;z-index:1}" +
    ".pakr-modal,.pakr-modal *{box-sizing:border-box;margin:0;padding:0;font-family:var(--pakr-font,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif)}" +
    ".pakr-modal{position:relative;width:420px;max-width:100%;background:var(--pakr-surface,#fff);" +
    "color:var(--pakr-ink,#0f172a);border:1px solid var(--pakr-line,#e2e8f0);border-radius:var(--pakr-radius,20px);" +
    "padding:26px 24px;text-align:center;animation:pakr-in .3s ease-out}" +
    ".pakr-emoji{font-size:36px;line-height:1}" +
    ".pakr-modal h2{margin-top:12px;font-family:var(--pakr-head-font,var(--pakr-font));font-size:20px;font-weight:800}" +
    ".pakr-modal p{margin-top:6px;font-size:13px;line-height:1.6;color:var(--pakr-muted,#475569)}" +
    ".pakr-ticket{margin:16px 0 6px;padding:14px;border-radius:14px;border:1px dashed var(--pakr-tint-line,#6ee7b7);" +
    "background:var(--pakr-tint,#ecfdf5)}" +
    ".pakr-ticket small{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;" +
    "color:var(--pakr-accent-deep,#047857)}" +
    ".pakr-ticket strong{display:block;margin-top:5px;font-size:22px;letter-spacing:.06em;color:var(--pakr-accent-deep,#064e3b);" +
    "font-family:ui-monospace,SFMono-Regular,Menlo,monospace}" +
    ".pakr-prize{margin-top:8px;font-size:12px;font-weight:600;color:var(--pakr-accent-deep,#065f46)}" +
    ".pakr-go{margin-top:18px;width:100%;border:0;border-radius:calc(var(--pakr-radius,20px) - 8px);padding:12px 16px;" +
    "font-size:13px;font-weight:700;cursor:pointer;background:var(--pakr-accent,#059669);color:var(--pakr-accent-ink,#fff)}" +
    ".pakr-go:hover{background:var(--pakr-accent-deep,#047857)}" +
    ".pakr-fine{margin-top:10px;font-size:10.5px;color:var(--pakr-muted,#94a3b8)}" +
    "@media (prefers-reduced-motion:reduce){.pakr-card,.pakr-modal{animation:none}}"

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    })
  }

  /** The store's own currency, because the card sits among its prices. */
  function money(value) {
    var code = ""
    try {
      code = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || ""
    } catch (e) {}
    var symbols = { PKR: "Rs.", USD: "$", AED: "AED", GBP: "£", EUR: "€", INR: "₹", CAD: "C$", SAR: "SAR", QAR: "QR" }
    var symbol = symbols[code] || "Rs."
    return symbol + " " + Number(value || 0).toLocaleString(code && code !== "PKR" ? "en-US" : "en-PK")
  }

  function drawLabel(value) {
    var date = new Date(value)
    if (isNaN(date.getTime())) return ""
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  // ── mounting ───────────────────────────────────────────────────────────────

  function shadowRoot() {
    if (state.root) return state.root
    var host = document.createElement("div")
    host.id = "pakraffle-widget-root"
    host.style.cssText = "position:fixed;z-index:2147483000;inset:auto 16px 16px auto;pointer-events:none"
    document.body.appendChild(host)
    applyTokens(host)
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host
    var style = document.createElement("style")
    style.textContent = BASE_CSS + MODAL_CSS
    root.appendChild(style)
    state.host = host
    state.root = root
    return root
  }

  /** The theme's checkout button, when the shopper is on the cart page. */
  function cartAnchor() {
    var selectors = [
      'form[action="/cart"] [name="checkout"]',
      'form[action="/cart"] button[type="submit"]',
      'form[action="/cart"] input[type="submit"]',
      "button.cart__checkout",
      ".cart__footer",
      ".cart-drawer__footer",
    ]
    for (var i = 0; i < selectors.length; i++) {
      var found = firstVisible([selectors[i]])
      // Sit directly above the checkout button rather than at the top of the whole cart form.
      if (found && found.parentNode) return found.parentNode
    }
    return null
  }

  /**
   * The product's details column, so the card lands under the price and the buy button.
   * Returns where to put it: inside a details container (keeps the theme's grid intact) or
   * after the bare add-to-cart form when the theme has no container we recognise.
   */
  function productDetails() {
    var scope = productScope()
    var container = firstVisible(PRODUCT_CONTAINERS, scope) || firstVisible(PRODUCT_CONTAINERS)
    if (container) return { node: container, inside: true }
    var form =
      firstVisible(['form[action^="/cart/add"]', "form.product-form", 'form[action*="/cart/add"]'], scope) ||
      firstVisible(['form[action^="/cart/add"]', "form.product-form", 'form[action*="/cart/add"]'])
    if (form) return { node: form, inside: false }
    // Last resort: the visible heading block, so the card still lands inside the product column.
    var heading = firstVisible(["h1.product-title", ".product-single__title", "[data-product-title]"], scope)
    return heading && heading.parentNode ? { node: heading.parentNode, inside: true } : null
  }

  function removeBanner() {
    if (state.inline && state.inline.parentNode) state.inline.parentNode.removeChild(state.inline)
    state.inline = null
  }

  function dismissed(signature) {
    var raw = store(DISMISS_KEY)
    if (!raw) return false
    var at = parseInt(raw.split("|")[0], 10)
    var sig = raw.split("|")[1] || ""
    if (!at || Date.now() - at > DISMISS_MINUTES * 60 * 1000) return false
    // A changed cart is new information: stop hiding.
    return sig === signature
  }

  function dismiss(signature) {
    store(DISMISS_KEY, String(Date.now()) + "|" + signature)
    removeBanner()
  }

  function bannerSignature(status, kind) {
    // The placement is part of the signature: closing the cart card should not silence the
    // product-page nudge, which is a different promise on a different page.
    return (
      (kind || "page") +
      ":" +
      status.state +
      ":" +
      (status.cart ? status.cart.itemCount : 0) +
      ":" +
      (status.cart ? status.cart.amount : 0)
    )
  }

  /**
   * Cards mounted inside the theme get their own shadow root: the theme's stylesheet cannot reach
   * in, and our reset cannot leak out. Browsers without shadow support fall back to the namespaced
   * classes, which are prefixed precisely so a theme is unlikely to collide with them.
   */
  function mountCard(html, signature, options) {
    if (dismissed(signature)) return
    var kind = options.placement
    var target = kind === "cart" ? { node: cartAnchor(), inside: false } : kind === "product" ? productDetails() : null
    var anchor = target ? target.node : null

    var wrapper = document.createElement("div")
    wrapper.id = "pakr-banner"
    var card =
      "<div class='pakr-card" +
      (options.celebrate ? " pakr-eligible" : "") +
      (anchor ? " pakr-stretch" : " pakr-float") +
      "'>" +
      html +
      "</div>"
    // `scope` is where the close button is looked up: the shadow root when isolated, else the wrapper.
    var scope = wrapper

    if (anchor) {
      wrapper.style.cssText = "display:block;max-width:100%;margin:0 auto 14px"
      if (wrapper.attachShadow) {
        scope = wrapper.attachShadow({ mode: "open" })
        var style = document.createElement("style")
        style.textContent = BASE_CSS
        scope.appendChild(style)
        var mount = document.createElement("div")
        mount.innerHTML = card
        scope.appendChild(mount)
        scope = mount
      } else {
        wrapper.innerHTML = card
      }
      applyTokens(wrapper)
      if (target.inside) anchor.appendChild(wrapper)
      else anchor.parentNode.insertBefore(wrapper, kind === "cart" ? anchor : anchor.nextSibling)
    } else {
      // Floating cards sit inside the persistent fixed host, which already carries the stylesheet.
      wrapper.innerHTML = card
      applyTokens(wrapper)
      shadowRoot().appendChild(wrapper)
    }

    state.inline = wrapper
    var close = scope.querySelector(".pakr-close")
    if (close) {
      close.addEventListener("click", function () {
        dismiss(signature)
      })
    }
    log("banner mounted", anchor ? "inline" : "floating", options.celebrate ? "eligible" : "progress")
  }

  // ── banners ────────────────────────────────────────────────────────────────

  /** Our mark and the terms link that closes every card — served from our origin, not the theme. */
  function footHtml() {
    return (
      '<div class="pakr-foot">' +
      '<span class="pakr-brand"><img src="' + API + '/brand/logo-64.png" alt="" width="18" height="18" />PakRaffle</span>' +
      '<a class="pakr-terms" href="' + API + '/terms" target="_blank" rel="noopener noreferrer">Terms &amp; conditions</a>' +
      "</div>"
    )
  }

  /** describeRule() carries "from <product filter>" for merchants; shoppers only need the rule. */
  function shortRule(campaign) {
    return String(campaign.ruleSummary || "Lucky draw").replace(/\s+from\s.+$/i, "")
  }

  function campaignPrize(campaign) {
    return campaign.prize && campaign.prize.title ? String(campaign.prize.title) : null
  }

  function pillsHtml(campaign, extra) {
    var pills = [extra || ""]
    pills.push('<span class="pakr-pill">' + escapeHtml(shortRule(campaign)) + "</span>")
    if (campaign.hasProductFilters) pills.push('<span class="pakr-pill">This item qualifies</span>')
    if (campaign.drawDate) pills.push('<span class="pakr-pill pakr-ghost">Draw ' + escapeHtml(drawLabel(campaign.drawDate)) + "</span>")
    return '<div class="pakr-row">' + pills.join("") + "</div>"
  }

  /**
   * The product-page card: the campaign rule itself, stated as what the shopper has to do, then how
   * the ticket arrives. Shown before anything is in the cart, on the product the rule covers.
   */
  function ruleHtml(status) {
    var campaign = status.campaign || {}
    var qty = Number(campaign.minQuantity) || 0
    var amt = Number(campaign.minAmount) || 0
    var goal = campaignPrize(campaign) || "a free lucky-draw ticket"
    var type = campaign.ruleType

    var headline
    if (type === "MIN_QUANTITY" && qty) headline = "Buy " + qty + "+ item" + (qty === 1 ? "" : "s") + " to win " + goal
    else if (type === "MIN_AMOUNT" && amt) headline = "Spend " + money(amt) + "+ to win " + goal
    else if (type === "MIN_QUANTITY_AND_AMOUNT")
      headline = "Buy " + qty + "+ items and spend " + money(amt) + "+ to win " + goal
    else headline = "Every order wins " + goal

    var needsQty = type === "MIN_QUANTITY" || type === "MIN_QUANTITY_AND_AMOUNT"
    var needsAmt = type === "MIN_AMOUNT" || type === "MIN_QUANTITY_AND_AMOUNT"
    var stepOne
    if (needsQty && needsAmt) stepOne = "Add <b>" + qty + " qualifying items</b> worth <b>" + money(amt) + "</b> or more."
    else if (needsQty) stepOne = "Add <b>" + qty + " qualifying item" + (qty === 1 ? "" : "s") + "</b> to your cart."
    else if (needsAmt) stepOne = "Add items worth <b>" + money(amt) + "</b> or more."
    else stepOne = "Put this item in your cart."

    var drawLine = campaign.drawDate ? " The draw goes live on <b>" + escapeHtml(drawLabel(campaign.drawDate)) + "</b>." : ""

    return (
      '<button class="pakr-close" type="button" aria-label="Dismiss">&times;</button>' +
      '<div class="pakr-head"><span class="pakr-seal">🎟️</span><div>' +
      '<span class="pakr-tag">Free lucky draw</span>' +
      '<p class="pakr-title">' + escapeHtml(headline) + "</p>" +
      "</div></div>" +
      '<p class="pakr-body">Complete checkout and PakRaffle issues your ticket automatically — no code, no extra cost.' +
      drawLine + "</p>" +
      '<div class="pakr-steps">' +
      '<div class="pakr-step"><b>1</b><span>' +
      stepOne +
      (campaign.hasProductFilters ? " This item counts." : "") +
      "</span></div>" +
      '<div class="pakr-step"><b>2</b><span>Check out as usual — there is nothing extra to fill in.</span></div>' +
      '<div class="pakr-step"><b>3</b><span>Your ticket number appears here as soon as the order lands' +
      (campaignPrize(campaign) ? ", in the draw for <b>" + escapeHtml(campaignPrize(campaign)) + "</b>" : "") +
      ".</span></div>" +
      "</div>" +
      pillsHtml(campaign, '<span class="pakr-pill pakr-ghost">No code needed</span>') +
      footHtml()
    )
  }

  function eligibleHtml(status) {
    var campaign = status.campaign || {}
    var prize = campaignPrize(campaign)
    var prizeLine = prize
      ? "This order earns you a <b>free ticket</b> in the draw for <b>" + escapeHtml(prize) + "</b>."
      : "This order earns you a <b>free lucky-draw ticket</b>."
    return (
      '<button class="pakr-close" type="button" aria-label="Dismiss">&times;</button>' +
      '<div class="pakr-head"><span class="pakr-seal">🎉</span><div>' +
      '<span class="pakr-tag">Free entry unlocked</span>' +
      '<p class="pakr-title">Congratulations — you qualify!</p>' +
      "</div></div>" +
      '<p class="pakr-body">' + prizeLine + " Complete checkout to claim it — no code needed.</p>" +
      '<div class="pakr-bar"><i style="width:100%"></i></div>' +
      pillsHtml(campaign, '<span class="pakr-pill">' + (status.tickets || 1) + " free ticket</span>") +
      footHtml()
    )
  }

  function progressHtml(status) {
    var campaign = status.campaign || {}
    var prize = campaignPrize(campaign)
    var reason = status.reason || "Add a little more to qualify."
    var body = prize
      ? "Cross the threshold and this order earns a free ticket in the draw for <b>" + escapeHtml(prize) + "</b>."
      : "Cross the threshold and this order earns a free lucky-draw ticket."
    var gap =
      Number(status.missingAmount) > 0
        ? '<span class="pakr-pill pakr-ghost">' + money(status.missingAmount) + " to go</span>"
        : '<span class="pakr-pill pakr-ghost">' +
          Math.max(0, Number(status.missingItems) || 0) +
          " item" +
          (Number(status.missingItems) === 1 ? "" : "s") +
          " to go</span>"
    return (
      '<button class="pakr-close" type="button" aria-label="Dismiss">&times;</button>' +
      '<span class="pakr-tag">Almost there</span>' +
      '<p class="pakr-title">' + escapeHtml(reason) + "</p>" +
      '<p class="pakr-body">' + body + "</p>" +
      '<div class="pakr-bar"><i style="width:' + Math.max(4, Math.min(99, Number(status.progress) || 0)) + '%"></i></div>' +
      pillsHtml(campaign, gap) +
      footHtml()
    )
  }

  function renderState() {
    var status = state.status
    removeBanner()

    var kind = pageKind()
    var empty = !state.cart || !state.cart.item_count
    // Elsewhere an empty cart has nothing to say; a product page still has an offer to make.
    if (empty && kind !== "product") {
      log("no cart items — nothing to show")
      return
    }
    if (!status || status.success === false) {
      log("status unavailable", status && status.error)
      return
    }
    if (!status.campaign) {
      log("no running campaign for this store or product", status.state)
      return
    }

    var signature = bannerSignature(status, kind)

    if (empty) {
      if (status.state !== "pitch") {
        log("empty cart, no offer to pitch", status.state)
        return
      }
      // The product page earns its space with the rule itself, not a progress bar at zero.
      mountCard(ruleHtml(status), signature, { placement: kind, celebrate: false })
      return
    }

    if (status.state === "eligible") {
      // Good news travels: the congratulations card follows the shopper around the store.
      mountCard(eligibleHtml(status), signature, { placement: kind, celebrate: true })
      return
    }
    if (status.state === "progress" && kind) {
      // The nudge only earns its space where the shopper is about to buy: the cart and the product page.
      mountCard(progressHtml(status), signature, { placement: kind, celebrate: false })
      return
    }
    log("nothing to show", status.state, status.reason)
  }

  function renderCongrats(claim) {
    var root = shadowRoot()
    var overlay = document.createElement("div")
    overlay.className = "pakr-overlay"
    overlay.setAttribute("role", "dialog")
    overlay.setAttribute("aria-modal", "true")
    var drawLine = claim.drawDate ? '<p class="pakr-fine">Draw date: ' + escapeHtml(drawLabel(claim.drawDate)) + "</p>" : ""
    overlay.innerHTML =
      '<div class="pakr-modal">' +
      '<button class="pakr-close" type="button" aria-label="Close">&times;</button>' +
      '<div class="pakr-emoji">🎉</div>' +
      "<h2>Congratulations — you're in the draw!</h2>" +
      "<p>" +
      (claim.orderName ? "Order " + escapeHtml(claim.orderName) + " qualified for " : "Your order qualified for ") +
      escapeHtml(claim.campaignTitle || "the lucky draw") +
      ". Your free entry is confirmed.</p>" +
      '<div class="pakr-ticket"><small>Your ticket number</small><strong>' +
      escapeHtml(claim.ticketNumber) +
      "</strong>" +
      (claim.prize && claim.prize.title ? '<div class="pakr-prize">Prize: ' + escapeHtml(claim.prize.title) + "</div>" : "") +
      "</div>" +
      drawLine +
      '<button class="pakr-go" type="button">Keep shopping</button>' +
      '<p class="pakr-fine">Powered by PakRaffle</p>' +
      "</div>"

    root.appendChild(overlay)
    var close = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    }
    var go = overlay.querySelector(".pakr-go")
    var x = overlay.querySelector(".pakr-close")
    if (go) go.addEventListener("click", close)
    if (x) x.addEventListener("click", close)
    document.addEventListener("keydown", function onKey(event) {
      if (event.key === "Escape") {
        close()
        document.removeEventListener("keydown", onKey)
      }
    })
    log("congratulations popup for", claim.ticketNumber)
  }

  // ── lifecycle ──────────────────────────────────────────────────────────────

  function refresh() {
    if (state.refreshing) return Promise.resolve()
    state.refreshing = true
    return getCart()
      .then(function (cart) {
        state.cart = cart
        var empty = !cart || !cart.item_count
        // Only the product page has something to say about an empty cart, so every other page
        // skips the round trip entirely.
        if (empty && pageKind() !== "product") {
          state.status = null
          renderState()
          return null
        }
        return postStatus(cart).then(function (data) {
          if (data && data.success) state.status = data
          renderState()
          return stampCart(cart, state.status)
        })
      })
      .catch(function (err) {
        log("refresh failed", err)
      })
      .then(function () {
        state.refreshing = false
      })
  }

  /**
   * The order webhook can arrive a few seconds after the shopper is back on the storefront, so
   * look for the new ticket straight away and then a few more times before giving up.
   */
  function checkClaims(attempts) {
    if (!state.token) return Promise.resolve()
    var left = Math.max(1, attempts || 1)
    return getClaims().then(function (data) {
      var claim = data && data.claims && data.claims.length ? data.claims[0] : null
      if (!claim) {
        if (left <= 1) return null
        return wait(2500).then(function () {
          return checkClaims(left - 1)
        })
      }
      var key = SEEN_KEY + ":" + claim.ticketNumber
      if (store(key) === "1") return null
      store(key, "1")
      renderCongrats(claim)
      return null
    })
  }

  /** Re-evaluate whenever the theme changes the cart through AJAX. */
  function watchCart() {
    var timer = null
    function schedule() {
      if (timer) clearTimeout(timer)
      timer = setTimeout(refresh, 350)
    }

    var events = ["cart:updated", "cart:refresh", "cart:change", "shopify:cart:updated", "cart:quantity"]
    for (var i = 0; i < events.length; i++) document.addEventListener(events[i], schedule)

    try {
      var nativeFetch = window.fetch
      if (nativeFetch) {
        window.fetch = function (input, init) {
          var url = typeof input === "string" ? input : (input && input.url) || ""
          return nativeFetch.apply(this, arguments).then(function (response) {
            if (!state.quiet && /\/cart\/(add|update|change|clear)\.js/.test(url)) schedule()
            return response
          })
        }
      }
    } catch (e) {
      log("fetch hook unavailable", e)
    }

    try {
      var nativeOpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function (method, url) {
        if (!state.quiet && /\/cart\/(add|update|change|clear)\.js/.test(String(url))) {
          this.addEventListener("loadend", schedule)
        }
        return nativeOpen.apply(this, arguments)
      }
    } catch (e) {
      log("xhr hook unavailable", e)
    }
  }

  /**
   * Sections with dynamic blocks, deferred JS and liquid-delayed buy buttons can paint the details
   * column well after DOMContentLoaded. Retry the mount on a decay until it lands somewhere visible.
   */
  function retryMount(tries) {
    if (tries <= 0) return
    setTimeout(function () {
      if (state.inline) return
      renderState()
      if (!state.inline) retryMount(tries - 1)
    }, 700)
  }

  function boot() {
    state.token = deviceToken()
    refresh().then(function () {
      return checkClaims(1)
    })
    watchCart()
    if (pageKind() === "product") retryMount(9)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot)
  } else {
    boot()
  }

  // Returning from Shopify's checkout: the token is still here, so look for the new ticket.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible" || !state.token) return
    checkClaims(5)
    refresh()
  })
})()
