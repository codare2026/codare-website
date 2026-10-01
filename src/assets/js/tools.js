// 互動園地: BMI / 體脂率 / BMR / TDEE calculators sharing one form.
// Results update as you type; nothing is sent anywhere or stored.
const panel = document.querySelector("[data-tools]");
if (panel) {
  const form = panel.querySelector("form");
  const tabs = [...document.querySelectorAll("[data-tool]")];
  const out = (name) => panel.querySelector(`[data-out="${name}"]`);
  const results = [...panel.querySelectorAll("[data-result]")];
  const bmiLevels = JSON.parse(panel.querySelector("[data-bmi-levels]").dataset.bmiLevels);
  const bfLevels = JSON.parse(out("bf-legend").dataset.levels);
  let tool = "bmi";

  // Which inputs each tool needs, with the accepted range
  const ranges = { age: [18, 100], height: [100, 250], weight: [20, 300], neck: [20, 60], waist: [40, 200], hip: [50, 200] };
  const needs = {
    bmi: ["height", "weight"],
    bodyfat: ["age", "height", "weight", "neck", "waist"],
    bmr: ["age", "height", "weight"],
    tdee: ["age", "height", "weight"],
  };

  const num = (name) => {
    const v = parseFloat(form.elements[name].value);
    return Number.isFinite(v) ? v : null;
  };
  const fmt = (n) => Math.round(n).toLocaleString();
  const showResult = (name) => results.forEach((el) => { el.hidden = el.dataset.result !== name; });
  const placeMarker = (marker, value, min, max) => {
    marker.style.left = ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100 + "%";
  };

  // Mifflin-St Jeor
  const bmrOf = (sex, age, height, weight) =>
    10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161);

  // U.S. Navy circumference method (cm)
  const bodyFatOf = (sex, height, neck, waist, hip) =>
    sex === "male"
      ? 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450
      : 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450;

  // Common adult reference ranges by sex and age: [low, high] is the standard range, then the "過高" line
  const bodyFatRange = (sex, age) =>
    sex === "male" ? (age < 30 ? [14, 20, 25] : [17, 23, 25]) : (age < 30 ? [17, 24, 30] : [20, 27, 30]);
  const BF_MIN = 5, BF_MAX = 45;

  const update = () => {
    const sex = form.elements.sex.value;
    const picked = form.querySelector('input[name="activity"]:checked');
    if (picked) out("activity-desc").textContent = picked.dataset.desc;
    panel.querySelectorAll("[data-sex]").forEach((el) => {
      if (el.dataset.for.split(" ").includes(tool)) el.hidden = el.dataset.sex !== sex;
    });

    const fields = [...needs[tool], ...(tool === "bodyfat" && sex === "female" ? ["hip"] : [])];
    const v = Object.fromEntries(fields.map((f) => [f, num(f)]));
    if (fields.some((f) => v[f] === null)) return showResult("empty");
    if (fields.some((f) => v[f] < ranges[f][0] || v[f] > ranges[f][1])) return showResult("invalid");

    if (tool === "bmi") {
      const bmi = v.weight / (v.height / 100) ** 2;
      const level = bmi < 18.5 ? "under" : bmi < 24 ? "normal" : bmi < 27 ? "over" : "obese";
      out("bmi").textContent = bmi.toFixed(1);
      out("level").textContent = bmiLevels[level];
      placeMarker(out("marker"), bmi, 15, 35);
    } else if (tool === "bodyfat") {
      const girth = sex === "male" ? v.waist - v.neck : v.waist + v.hip - v.neck;
      if (girth <= 0) return showResult("invalid");
      const bf = bodyFatOf(sex, v.height, v.neck, v.waist, v.hip);
      if (!Number.isFinite(bf) || bf < 2 || bf > 60) return showResult("invalid");
      const [lo, hi, top] = bodyFatRange(sex, v.age);
      const level = bf < lo ? "low" : bf <= hi ? "normal" : bf < top ? "high" : "obese";
      out("bodyfat").textContent = bf.toFixed(1);
      out("bf-level").textContent = bfLevels[level];
      // Four equal-width bands (their limits depend on sex/age); the marker sits proportionally inside its band
      const edges = [BF_MIN, lo, hi, top, BF_MAX];
      const clamped = Math.min(Math.max(bf, BF_MIN), BF_MAX);
      const band = Math.min(edges.findIndex((e, i) => clamped < edges[i + 1]), 3);
      const pos = (band + (clamped - edges[band]) / (edges[band + 1] - edges[band])) / 4;
      out("bf-marker").style.left = pos * 100 + "%";
      const labels = [[bfLevels.low, `< ${lo}%`], [bfLevels.normal, `${lo}–${hi}%`], [bfLevels.high, `${hi}–${top}%`], [bfLevels.obese, `≥ ${top}%`]];
      out("bf-legend").querySelectorAll("li").forEach((li, i) => { li.innerHTML = `${labels[i][0]}<small>${labels[i][1]}</small>`; });
      out("fat-mass").textContent = (v.weight * bf / 100).toFixed(1);
      out("lean-mass").textContent = (v.weight * (1 - bf / 100)).toFixed(1);
    } else {
      const bmr = bmrOf(sex, v.age, v.height, v.weight);
      if (tool === "bmr") out("bmr").textContent = fmt(bmr);
      else {
        out("tdee").textContent = fmt(bmr * parseFloat(form.elements.activity.value));
        out("tdee-bmr").textContent = fmt(bmr);
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
  form.addEventListener("change", update);
  form.addEventListener("submit", (e) => e.preventDefault());

  const fromHash = location.hash.slice(1);
  select(tabs.some((t) => t.dataset.tool === fromHash) ? fromHash : "bmi");
}
