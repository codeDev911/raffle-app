/**
 * PakRaffle storefront widget (served to Shopify stores via a ScriptTag).
 *
 *  1. Reads the live cart from /cart.js and asks PakRaffle whether it qualifies for a free
 *     lucky-draw entry, then shows a small banner in the cart / product pages.
 *  2. Stamps a browser nonce on the cart as a note attribute so the order webhook can tie the
 *     minted ticket back to this browser.
 *  3. After checkout, the next storefront page load finds the ticket with that nonce and shows
 *     the congratulations popup with the ticket number.
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
  if (window.location.pathname.indexOf("/checkout") === 0) return

  var TOKEN_KEY = "pakraffle_token_" + storeId
  var SEEN_KEY = "pakraffle_seen_" + storeId
  var DISMISS_KEY = "pakraffle_dismiss_" + storeId

  var state = { token: "", cart: null, status: null, root: null, mounted: false }

  // ── helpers ────────────────────────────────────────────────────────────────

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

  function getCart() {
    return fetch(window.location.origin + "/cart.js", {
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

  /** Writes the nonce as a cart note attribute: it travels to the order as note_attributes. */
  function stampCart(cart) {
    if (!cart || !cart.item_count) return Promise.resolve()
    var attributes = cart.attributes || {}
    if (attributes._pakraffle_token === state.token) return Promise.resolve()
    return fetch(window.location.origin + "/cart/update.js", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        attributes: { _pakraffle_token: state.token, _pakraffle_store: storeId },
      }),
    }).catch(function () {})
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
    )
      .then(function (res) {
        return res.ok ? res.json() : null
      })
      .catch(function () {
        return null
      })
  }

  // ── rendering ──────────────────────────────────────────────────────────────

  function ensureRoot() {
    if (state.mounted) return state.root
    var host = document.createElement("div")
    host.id = "pakraffle-widget-root"
    host.style.position = "fixed"
    host.style.zIndex = "2147483000"
    host.style.inset = "auto 16px 16px auto"
    document.body.appendChild(host)
    state.root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host
    state.mounted = true
    return state.root
  }

  var BASE_CSS =
    "*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
    ".card{position:relative;width:308px;max-width:calc(100vw - 32px);background:#0B0F19;color:#E2E8F0;border:1px solid #1F2937;" +
    "border-radius:16px;padding:14px 16px;box-shadow:0 18px 50px rgba(0,0,0,.35);animation:pakr-in .25s ease-out}" +
    "@keyframes pakr-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    ".tag{display:inline-flex;align-items:center;gap:6px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#34D399}" +
    ".title{margin:6px 0 2px;font-size:14px;font-weight:600;line-height:1.35;color:#F8FAFC}" +
    ".body{margin:0;font-size:12px;line-height:1.55;color:#94A3B8}" +
    ".row{display:flex;align-items:center;gap:8px;margin-top:10px}" +
    ".pill{font-size:11px;font-weight:600;color:#A7F3D0;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.35);" +
    "border-radius:999px;padding:3px 9px}" +
    ".close{position:absolute;top:8px;right:10px;border:0;background:transparent;color:#64748B;font-size:16px;cursor:pointer;line-height:1}" +
    ".close:hover{color:#E2E8F0}"

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    })
  }

  function dismissBanner() {
    store(DISMISS_KEY, String(Date.now()))
    var root = state.root
    if (root) {
      var banner = root.getElementById ? root.getElementById("pakr-banner") : root.querySelector("#pakr-banner")
      if (banner) banner.remove()
    }
  }

  function dismissedRecently() {
    var value = Number(store(DISMISS_KEY) || 0)
    return value > 0 && Date.now() - value < 12 * 60 * 60 * 1000
  }

  function renderBanner(data) {
    if (!data || !data.campaign || dismissedRecently()) return
    var cartHasItems = data.cart && data.cart.itemCount > 0
    if (!cartHasItems) return
    // Never nag on pages that are not about the cart: only the eligible state earns the space.
    if (!data.eligible && window.location.pathname.indexOf("/cart") !== 0) return

    var root = ensureRoot()
    var existing = root.getElementById ? root.getElementById("pakr-banner") : root.querySelector("#pakr-banner")
    if (existing) existing.remove()

    var campaign = data.campaign
    var prize = campaign.prize && campaign.prize.title ? campaign.prize.title : null
    var title = data.eligible ? "You've unlocked a free lucky-draw entry" : "You're close to a free lucky-draw entry"
    var detail = ""
    if (data.eligible) {
      detail = prize ? 'This purchase enters you to win "' + prize + '".' : "This purchase earns you a draw ticket — free."
    } else if (data.missingItems > 0) {
      detail = "Add " + data.missingItems + " more item" + (data.missingItems === 1 ? "" : "s") + " to qualify."
    } else if (data.missingAmount > 0) {
      detail = "Spend Rs. " + Number(data.missingAmount).toLocaleString("en-PK") + " more to qualify."
    } else {
      detail = campaign.ruleSummary || "Add a little more to qualify."
    }

    var style = document.createElement("style")
    style.textContent = BASE_CSS

    var wrapper = document.createElement("div")
    wrapper.id = "pakr-banner"
    wrapper.innerHTML =
      '<div class="card" role="status">' +
      '<button class="close" type="button" aria-label="Dismiss">&times;</button>' +
      '<span class="tag">PakRaffle</span>' +
      '<p class="title">' + escapeHtml(title) + "</p>" +
      '<p class="body">' + escapeHtml(detail) + "</p>" +
      '<div class="row"><span class="pill">' + escapeHtml(campaign.ruleSummary || "Lucky draw") + "</span></div>" +
      "</div>"

    root.appendChild(style)
    root.appendChild(wrapper)
    var close = wrapper.querySelector(".close")
    if (close) close.addEventListener("click", dismissBanner)
  }

  function renderCongrats(claim) {
    var root = ensureRoot()
    var style = document.createElement("style")
    style.textContent =
      BASE_CSS +
      ".overlay{position:fixed;inset:0;background:rgba(2,6,23,.72);display:flex;align-items:center;justify-content:center;padding:20px}" +
      ".modal{width:420px;max-width:100%;background:#0B0F19;border:1px solid #1F2937;border-radius:20px;padding:26px 24px;color:#E2E8F0;" +
      "text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.5);animation:pakr-in .3s ease-out}" +
      ".emoji{font-size:34px;line-height:1}" +
      ".modal h2{margin:12px 0 6px;font-size:20px;font-weight:700;color:#F8FAFC}" +
      ".modal p{margin:0;font-size:13px;line-height:1.6;color:#94A3B8}" +
      ".ticket{margin:16px 0 4px;padding:14px;border-radius:14px;border:1px dashed rgba(16,185,129,.45);" +
      "background:rgba(16,185,129,.08)}" +
      ".ticket small{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#34D399}" +
      ".ticket strong{display:block;margin-top:4px;font-size:22px;letter-spacing:.06em;color:#ECFDF5}" +
      ".prize{font-size:12px;color:#A7F3D0;margin-top:8px}" +
      ".cta{margin-top:18px;width:100%;border:0;border-radius:12px;background:#10B981;color:#04120C;font-weight:700;" +
      "font-size:13px;padding:11px 16px;cursor:pointer}" +
      ".cta:hover{background:#34D399}" +
      ".fine{margin-top:10px;font-size:10px;color:#64748B}"

    var overlay = document.createElement("div")
    overlay.className = "overlay"
    overlay.setAttribute("role", "dialog")
    overlay.setAttribute("aria-modal", "true")
    var drawLine = claim.drawDate
      ? '<p class="fine">Draw date: ' + escapeHtml(new Date(claim.drawDate).toDateString()) + "</p>"
      : ""
    overlay.innerHTML =
      '<div class="modal">' +
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

    root.appendChild(style)
    root.appendChild(overlay)
    var cta = overlay.querySelector(".cta")
    if (cta) {
      cta.addEventListener("click", function () {
        overlay.remove()
      })
    }
  }

  // ── boot ───────────────────────────────────────────────────────────────────

  function checkClaims() {
    if (!state.token) return Promise.resolve()
    return getClaims().then(function (data) {
      if (!data || !data.claims || !data.claims.length) return
      var claim = data.claims[0]
      var key = SEEN_KEY + ":" + claim.ticketNumber
      if (store(key) === "1") return
      store(key, "1")
      renderCongrats(claim)
    })
  }

  function boot() {
    state.token = deviceToken()
    getCart()
      .then(function (cart) {
        state.cart = cart
        return stampCart(cart)
      })
      .then(function () {
        if (!state.cart || !state.cart.item_count) {
          renderBanner(null)
          return null
        }
        return postStatus(state.cart).then(function (data) {
          state.status = data
          if (data && data.success) renderBanner(data)
        })
      })
      .catch(function () {})
      .then(function () {
        return checkClaims()
      })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot)
  } else {
    boot()
  }

  // Returning from Shopify's checkout: the token is still here, so look for the new ticket.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && state.token) checkClaims()
  })
})()
