// 互動園地: BMI / BMR / TDEE calculators sharing one form.
// Results update as you type; nothing is sent anywhere or stored.
const panel = document.querySelector("[data-tools]");
if (panel) {
  const form = panel.querySelector("form");
  const tabs = [...document.querySelectorAll("[data-tool]")];
  const out = (name) => panel.querySelector(`[data-out="${name}"]`);
  const results = [...panel.querySelectorAll("[data-result]")];
  const levels = JSON.parse(panel.querySelector("[data-levels]").dataset.levels);
  let tool = "bmi";

  const num = (name) => {
    const v = parseFloat(form.elements[name].value);
    return Number.isFinite(v) ? v : null;
  };
  const inRange = (v, min, max) => v !== null && v >= min && v <= max;
  const showResult = (name) => results.forEach((el) => { el.hidden = el.dataset.result !== name; });

  // Mifflin-St Jeor
  const bmrOf = (sex, age, height, weight) =>
    10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161);

  const update = () => {
    const height = num("height");
    const weight = num("weight");
    const age = num("age");
    const needsAge = tool !== "bmi";
    const filled = height !== null && weight !== null && (!needsAge || age !== null);
    if (!filled) return showResult("empty");
    const valid = inRange(height, 100, 250) && inRange(weight, 20, 300) && (!needsAge || inRange(age, 18, 100));
    if (!valid) return showResult("invalid");

    if (tool === "bmi") {
      const bmi = weight / (height / 100) ** 2;
      const level = bmi < 18.5 ? "under" : bmi < 24 ? "normal" : bmi < 27 ? "over" : "obese";
      out("bmi").textContent = bmi.toFixed(1);
      out("level").textContent = levels[level];
      out("level").dataset.level = level;
      out("marker").style.left = ((Math.min(Math.max(bmi, 15), 35) - 15) / 20) * 100 + "%";
    } else {
      const bmr = bmrOf(form.elements.sex.value, age, height, weight);
      if (tool === "bmr") out("bmr").textContent = Math.round(bmr).toLocaleString();
      else {
        const factor = parseFloat(form.elements.activity.value);
        out("tdee").textContent = Math.round(bmr * factor).toLocaleString();
        out("tdee-bmr").textContent = Math.round(bmr).toLocaleString();
      }
    }
    showResult(tool);
  };

  const select = (name) => {
    tool = name;
    tabs.forEach((t) => {
      const on = t.dataset.tool === name;
      t.setAttribute("aria-pressed", on);
      t.setAttribute("aria-selected", on);
      if (on) panel.setAttribute("aria-labelledby", t.id);
    });
    panel.querySelectorAll("[data-for]").forEach((el) => {
      el.hidden = !el.dataset.for.split(" ").includes(name);
    });
    update();
  };

  tabs.forEach((t) => t.addEventListener("click", () => {
    select(t.dataset.tool);
    history.replaceState(null, "", "#" + t.dataset.tool);
  }));
  form.addEventListener("input", update);
  form.addEventListener("submit", (e) => e.preventDefault());

  const fromHash = location.hash.slice(1);
  select(tabs.some((t) => t.dataset.tool === fromHash) ? fromHash : "bmi");
}
