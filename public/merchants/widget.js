/**
 * PakRaffle storefront widget (served to Shopify stores via a ScriptTag).
 *
 *  1. Reads the live cart from /cart.js and asks PakRaffle whether it qualifies for a free
 *     lucky-draw entry. The card renders inline above the checkout button on /cart and below the
 *     product details on /products/*, floating bottom-right everywhere else; a near-miss gets
 *     progress, and a product page with an empty cart pitches the offer from zero.
 *  2. Re-checks on every cart mutation, so an AJAX cart drawer crossing the threshold updates
 *     the card immediately instead of waiting for a page reload.
 *  3. Stamps a browser nonce on the cart as a note attribute so the order webhook can tie the
 *     minted ticket back to this browser, plus the unlocked campaign title for the merchant.
 *  4. After checkout, the next storefront page load finds the ticket with that nonce and shows
 *     the congratulations popup with the ticket number (retried, because the webhook can land
 *     a few seconds after the shopper returns).
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

  var state = { token: "", cart: null, status: null, host: null, root: null, inline: null, refreshing: false, quiet: false }

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

  // ── styles ─────────────────────────────────────────────────────────────────

  var BASE_CSS =
    "*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
    // Border only, no shadow: the card has to sit inside themes that style their own panels.
    ".card{position:relative;width:322px;max-width:calc(100vw - 32px);background:#FFFFFF;color:#0F172A;border:1px solid #E2E8F0;" +
    "border-radius:16px;padding:14px 16px 15px;pointer-events:auto;animation:pakr-in .25s ease-out}" +
    ".card.eligible{background:linear-gradient(135deg,#ECFDF5 0%,#F0FDFA 100%);border-color:#6EE7B7}" +
    // Inline cards fill their column but stop at 72rem, so a wide theme never stretches them edge to edge.
    ".card.inline{width:100%;max-width:72rem;margin:0 auto 14px}" +
    ".head{display:flex;align-items:flex-start;gap:10px}" +
    ".seal{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:12px;" +
    "background:#D1FAE5;border:1px solid #6EE7B7;font-size:17px;line-height:1}" +
    "@keyframes pakr-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    ".tag{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#047857;font-weight:700}" +
    ".title{margin:3px 0 0;font-size:14px;font-weight:700;line-height:1.3;color:#0F172A}" +
    ".body{margin:8px 0 0;font-size:12px;line-height:1.55;color:#475569}" +
    ".body strong{color:#065F46}" +
    ".bar{height:6px;border-radius:999px;background:#E2E8F0;overflow:hidden;margin-top:11px}" +
    ".bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#34D399,#059669)}" +
    ".row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:11px}" +
    ".pill{font-size:10.5px;font-weight:600;color:#047857;background:#D1FAE5;border:1px solid #A7F3D0;" +
    "border-radius:999px;padding:3px 9px;white-space:nowrap}" +
    ".pill.ghost{color:#475569;background:#F1F5F9;border-color:#E2E8F0}" +
    ".close{position:absolute;top:8px;right:10px;border:0;background:transparent;color:#94A3B8;font-size:16px;cursor:pointer;" +
    "line-height:1;padding:2px}" +
    ".close:hover{color:#0F172A}" +
    ".foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;padding-top:10px;" +
    "border-top:1px solid #E2E8F0}" +
    ".brand{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:#64748B}" +
    ".brand img{display:block;width:18px;height:18px;border-radius:5px}" +
    ".terms{font-size:10.5px;color:#475569;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}" +
    ".terms:hover{color:#059669}"

  var MODAL_CSS =
    ".overlay{position:fixed;inset:0;background:rgba(2,6,23,.66);display:flex;align-items:center;justify-content:center;padding:20px;" +
    "pointer-events:auto;z-index:1}" +
    ".modal{position:relative;width:420px;max-width:100%;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:26px 24px;" +
    "color:#0F172A;text-align:center;animation:pakr-in .3s ease-out}" +
    ".emoji{font-size:36px;line-height:1}" +
    ".modal h2{margin:12px 0 6px;font-size:20px;font-weight:800;color:#0F172A}" +
    ".modal p{margin:0;font-size:13px;line-height:1.6;color:#475569}" +
    ".ticket{margin:16px 0 6px;padding:14px;border-radius:14px;border:1px dashed #6EE7B7;background:#ECFDF5}" +
    ".ticket small{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#047857;font-weight:700}" +
    ".ticket strong{display:block;margin-top:5px;font-size:22px;letter-spacing:.06em;color:#064E3B;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}" +
    ".prize{font-size:12px;color:#065F46;margin-top:8px;font-weight:600}" +
    ".cta{margin-top:18px;width:100%;border:0;border-radius:12px;background:#059669;color:#FFFFFF;font-weight:700;" +
    "font-size:13px;padding:12px 16px;cursor:pointer}" +
    ".cta:hover{background:#10B981}" +
    ".fine{margin-top:10px;font-size:10.5px;color:#94A3B8}"

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    })
  }

  function money(value) {
    return "Rs. " + Number(value || 0).toLocaleString("en-PK")
  }

  // ── mounting ───────────────────────────────────────────────────────────────

  function shadowRoot() {
    if (state.root) return state.root
    var host = document.createElement("div")
    host.id = "pakraffle-widget-root"
    host.style.cssText = "position:fixed;z-index:2147483000;inset:auto 16px 16px auto;pointer-events:none"
    document.body.appendChild(host)
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host
    var style = document.createElement("style")
    style.textContent = BASE_CSS + MODAL_CSS
    root.appendChild(style)
    state.host = host
    state.root = root
    return root
  }

  /** Where the card belongs on this page: the cart, a product's details column, or nowhere. */
  function pageKind() {
    // Market and language paths (/en/products/…, /en-pk/products/…) keep the same placement.
    var path = window.location.pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/)/i, "")
    if (/^\/cart\/?$/.test(path)) return "cart"
    if (path.indexOf("/products/") === 0) return "product"
    return null
  }

  /**
   * Themes ship hidden copies of the same markup (quick-add forms, quick-view drawers, mobile
   * duplicate columns). Querying a hidden copy would mount the card where nobody can see it.
   */
  function visible(el) {
    return Boolean(el && el.getClientRects && el.getClientRects().length > 0)
  }

  /** First match in document order that the theme actually renders. */
  function firstVisible(selectors, scope) {
    for (var i = 0; i < selectors.length; i++) {
      var found = (scope || document).querySelectorAll(selectors[i])
      for (var j = 0; j < found.length; j++) {
        if (visible(found[j])) return found[j]
      }
    }
    return null
  }

  /** Dawn-style themes wrap the product in one section; quick-add forms live outside it. */
  function productScope() {
    return firstVisible([".shopify-section-main-product", "main", "[role='main']"])
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
    var containers = [
      ".product__info-container",
      "[data-product-information]",
      ".product-single__meta",
      ".product__info-wrapper",
      ".product-info",
      ".product__details",
    ]
    var scope = productScope()
    var container = firstVisible(containers, scope) || firstVisible(containers)
    if (container) return { node: container, inside: true }
    var form = firstVisible(['form[action^="/cart/add"]', "form.product-form"], scope) ||
      firstVisible(['form[action^="/cart/add"]', "form.product-form"])
    return form ? { node: form, inside: false } : null
  }

  function removeBanner() {
    if (state.inline && state.inline.parentNode) state.inline.parentNode.removeChild(state.inline)
    state.inline = null
    if (!state.root) return
    var existing = state.root.getElementById
      ? state.root.getElementById("pakr-banner")
      : state.root.querySelector("#pakr-banner")
    if (existing) existing.parentNode.removeChild(existing)
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

  function mountCard(html, signature, options) {
    if (dismissed(signature)) return
    var kind = options.placement
    var target = kind === "cart" ? { node: cartAnchor(), inside: false } : kind === "product" ? productDetails() : null
    var anchor = target ? target.node : null
    var wrapper = document.createElement("div")
    wrapper.id = "pakr-banner"
    wrapper.innerHTML =
      "<div class='card" + (options.celebrate ? " eligible" : "") + (anchor ? " inline" : "") + "'>" + html + "</div>"

    if (anchor) {
      var style = document.createElement("style")
      style.textContent = BASE_CSS
      wrapper.insertBefore(style, wrapper.firstChild)
      if (target.inside) {
        // Inside the details column: below the price and the buy button, without touching the grid.
        anchor.appendChild(wrapper)
      } else {
        // Above the cart's checkout button — the card goes before the button, not after it.
        anchor.parentNode.insertBefore(wrapper, kind === "cart" ? anchor : anchor.nextSibling)
      }
      state.inline = wrapper
    } else {
      shadowRoot().appendChild(wrapper)
    }

    var close = wrapper.querySelector(".close")
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
      '<div class="foot">' +
      '<span class="brand"><img src="' + API + '/brand/logo-64.png" alt="" width="18" height="18" />PakRaffle</span>' +
      '<a class="terms" href="' + API + '/terms" target="_blank" rel="noopener noreferrer">Terms &amp; conditions</a>' +
      "</div>"
    )
  }

  function eligibleHtml(status) {
    var campaign = status.campaign || {}
    var prize = campaign.prize && campaign.prize.title ? campaign.prize.title : null
    var prizeLine = prize
      ? "This order earns you a <strong>free ticket</strong> in the draw for <strong>" + escapeHtml(prize) + "</strong>."
      : "This order earns you a <strong>free lucky-draw ticket</strong>."
    var drawLine = campaign.drawDate
      ? '<span class="pill ghost">Draw ' + escapeHtml(new Date(campaign.drawDate).toDateString()) + "</span>"
      : ""
    return (
      '<button class="close" type="button" aria-label="Dismiss">&times;</button>' +
      '<div class="head"><span class="seal">🎉</span><div>' +
      '<span class="tag">Free entry unlocked</span>' +
      '<p class="title">Congratulations — you qualify!</p>' +
      "</div></div>" +
      '<p class="body">' + prizeLine + " Complete checkout to claim it — no code needed.</p>" +
      '<div class="bar"><i style="width:100%"></i></div>' +
      '<div class="row"><span class="pill">' + (status.tickets || 1) + " free ticket</span>" +
      '<span class="pill ghost">' + escapeHtml(campaign.ruleSummary || "Lucky draw") + "</span>" + drawLine + "</div>" +
      footHtml()
    )
  }

  function progressHtml(status) {
    var campaign = status.campaign || {}
    var prize = campaign.prize && campaign.prize.title ? campaign.prize.title : null
    var reason = status.reason || "Add a little more to qualify."
    var body = prize
      ? "Cross the threshold and this order earns a free ticket in the draw for <strong>" + escapeHtml(prize) + "</strong>."
      : "Cross the threshold and this order earns a free lucky-draw ticket."
    var gapPill =
      Number(status.missingAmount) > 0
        ? '<span class="pill ghost">' + money(status.missingAmount) + " to go</span>"
        : '<span class="pill ghost">' + Math.max(0, Number(status.missingItems) || 0) + " item" +
          (Number(status.missingItems) === 1 ? "" : "s") + " to go</span>"
    return (
      '<button class="close" type="button" aria-label="Dismiss">&times;</button>' +
      '<span class="tag">Almost there</span>' +
      '<p class="title">' + escapeHtml(reason) + "</p>" +
      '<p class="body">' + body + "</p>" +
      '<div class="bar"><i style="width:' + Math.max(4, Math.min(99, Number(status.progress) || 0)) + '%"></i></div>' +
      '<div class="row"><span class="pill">' + escapeHtml(campaign.ruleSummary || "Lucky draw") + "</span>" + gapPill + "</div>" +
      footHtml()
    )
  }

  /**
   * The offer, shown on a product page before anything is in the cart. Same card, same footer —
   * only the copy changes from "you are close" to "this is what is on offer".
   */
  function pitchHtml(status) {
    var campaign = status.campaign || {}
    var prize = campaign.prize && campaign.prize.title ? campaign.prize.title : null
    var needsAmount = Number(status.missingAmount) > 0
    var needsItems = Number(status.missingItems) > 0
    var title = needsAmount
      ? "Spend " + money(status.missingAmount) + ", earn a free ticket"
      : needsItems
        ? "Buy " + status.missingItems + " item" + (Number(status.missingItems) === 1 ? "" : "s") + ", earn a free ticket"
        : "Every order earns a free ticket"
    var body = prize
      ? "Add to cart and this order enters the draw for <strong>" + escapeHtml(prize) + "</strong>."
      : "Add to cart and this order earns a free lucky-draw ticket."
    var drawLine = campaign.drawDate
      ? '<span class="pill ghost">Draw ' + escapeHtml(new Date(campaign.drawDate).toDateString()) + "</span>"
      : ""
    return (
      '<button class="close" type="button" aria-label="Dismiss">&times;</button>' +
      '<span class="tag">Free entry available</span>' +
      '<p class="title">' + escapeHtml(title) + "</p>" +
      '<p class="body">' + body + "</p>" +
      '<div class="bar"><i style="width:4%"></i></div>' +
      '<div class="row"><span class="pill">' + escapeHtml(campaign.ruleSummary || "Lucky draw") + "</span>" +
      '<span class="pill ghost">No code needed</span>' + drawLine + "</div>" +
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
      log("no running campaign for this store", status.state)
      return
    }

    var signature = bannerSignature(status, kind)

    if (empty) {
      if (status.state !== "pitch") {
        log("empty cart, no offer to pitch", status.state)
        return
      }
      mountCard(pitchHtml(status), signature, { placement: kind, celebrate: false })
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
    overlay.className = "overlay"
    overlay.setAttribute("role", "dialog")
    overlay.setAttribute("aria-modal", "true")
    var drawLine = claim.drawDate
      ? '<p class="fine">Draw date: ' + escapeHtml(new Date(claim.drawDate).toDateString()) + "</p>"
      : ""
    overlay.innerHTML =
      '<div class="modal">' +
      '<button class="close" type="button" aria-label="Close">&times;</button>' +
      '<div class="emoji">🎉</div>' +
      "<h2>Congratulations — you're in the draw!</h2>" +
      "<p>" +
      (claim.orderName ? "Order " + escapeHtml(claim.orderName) + " qualified for " : "Your order qualified for ") +
      escapeHtml(claim.campaignTitle || "the lucky draw") +
      ". Your free entry is confirmed.</p>" +
      '<div class="ticket"><small>Your ticket number</small><strong>' +
      escapeHtml(claim.ticketNumber) +
      "</strong>" +
      (claim.prize && claim.prize.title ? '<div class="prize">Prize: ' + escapeHtml(claim.prize.title) + "</div>" : "") +
      "</div>" +
      drawLine +
      '<button class="cta" type="button">Keep shopping</button>' +
      '<p class="fine">Powered by PakRaffle</p>' +
      "</div>"

    root.appendChild(overlay)
    var close = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    }
    var cta = overlay.querySelector(".cta")
    var x = overlay.querySelector(".close")
    if (cta) cta.addEventListener("click", close)
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

  function boot() {
    state.token = deviceToken()
    refresh().then(function () {
      return checkClaims(1)
    })
    watchCart()
    // A product page can paint its details column after this runs, so give the mount one retry.
    if (pageKind() === "product") {
      setTimeout(function () {
        if (!state.inline) renderState()
      }, 1200)
    }
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
