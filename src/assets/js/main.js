// 口袋營養獅 — small, dependency-free interactions.
// (the "js" class is set inline in <head> so content never flashes)

// Mobile menu
const toggle = document.querySelector(".menu-toggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

// Scroll reveal: cards and headings float up as they enter the viewport
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    io.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

// Event filters (活動花絮)
const filterButtons = document.querySelectorAll("[data-filter]");
const filterList = document.querySelector("[data-filter-list]");
if (filterButtons.length && filterList) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.filter;
      filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      filterList.querySelectorAll("[data-kind]").forEach((card) => {
        card.hidden = kind !== "all" && card.dataset.kind !== kind;
      });
    });
  });
}

// Promotion banner / popup (活動宣傳): hide outside the start–end dates;
// the popup shows at most once a day per visitor and per promotion.
const today = new Date();
const inWindow = (el) => {
  const start = el.dataset.start ? new Date(el.dataset.start + "T00:00:00") : null;
  const end = el.dataset.end ? new Date(el.dataset.end + "T23:59:59") : null;
  return (!start || today >= start) && (!end || today <= end);
};
document.querySelectorAll("[data-promo]").forEach((el) => {
  if (!inWindow(el)) el.remove();
});
const pop = document.querySelector("[data-promo-pop]");
if (pop && typeof pop.showModal === "function") {
  // At most once a day per visitor; a new promotion (different key) shows again for everyone.
  const key = "codare-promo-" + pop.dataset.key;
  const stamp = today.toISOString().slice(0, 10);
  let seen = null;
  try { seen = localStorage.getItem(key); } catch (e) { /* storage unavailable */ }
  if (seen !== stamp) {
    const remember = () => {
      try { localStorage.setItem(key, stamp); } catch (e) { /* storage unavailable */ }
    };
    setTimeout(() => pop.showModal(), 800);
    pop.querySelector("[data-promo-close]").addEventListener("click", () => { pop.close(); remember(); });
    pop.addEventListener("click", (e) => { if (e.target === pop) { pop.close(); remember(); } });
    pop.addEventListener("cancel", remember);
  }
}

// Top announcement bar: drop items outside their dates, then flip through the rest
// vertically. Pauses on hover/focus; with reduced motion it stays on the first item.
const ticker = document.querySelector("[data-ticker]");
if (ticker) {
  let items = [...ticker.querySelectorAll(".ticker-item")];
  items.forEach((el) => { if (!inWindow(el)) el.remove(); });
  items = [...ticker.querySelectorAll(".ticker-item")];
  if (!items.length) {
    ticker.remove();
  } else {
    items.forEach((el, i) => el.classList.toggle("is-active", i === 0));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (items.length > 1 && !still) {
      let current = 0;
      const delay = Math.max(2, Number(ticker.dataset.speed) || 4) * 1000;
      // Checked at each flip, so a missed mouseleave can never leave it stuck.
      const paused = () => ticker.matches(":hover") || ticker.contains(document.activeElement);
      setInterval(() => {
        if (paused() || document.hidden) return;
        const prev = items[current];
        current = (current + 1) % items.length;
        const next = items[current];
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        next.classList.remove("is-leaving");
        next.classList.add("is-active");
        setTimeout(() => prev.classList.remove("is-leaving"), 650);
      }, delay);
    }
  }
}
