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

// Promotion banner / popup (活動宣傳): hide outside the start–end dates,
// and show the popup at most once a day per promotion.
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
  const key = "codare-promo-" + pop.dataset.key;
  const stamp = today.toISOString().slice(0, 10);
  let seen = null;
  try { seen = localStorage.getItem(key); } catch (e) { /* storage unavailable */ }
  if (seen !== stamp) {
    setTimeout(() => pop.showModal(), 1200);
    const close = () => {
      pop.close();
      try { localStorage.setItem(key, stamp); } catch (e) { /* storage unavailable */ }
    };
    pop.querySelector("[data-promo-close]").addEventListener("click", close);
    pop.addEventListener("click", (e) => { if (e.target === pop) close(); });
    pop.addEventListener("cancel", () => {
      try { localStorage.setItem(key, stamp); } catch (e) { /* storage unavailable */ }
    });
  }
}
