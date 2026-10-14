import { scenarios } from "./scenarios.js";
import { SimulationEngine } from "./engine.js";

const app = document.querySelector("#app");
const engine = new SimulationEngine(scenarios);
const SOURCE_URL = "https://github.com/journey-to-code-org/scam-mirror";
let lastScenarioId = null;

const escape = (value) => String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const list = (items) => items.map((item) => `<li>${escape(item)}</li>`).join("");

function focusHeading() {
  requestAnimationFrame(() => {
    const heading = app.querySelector("h1");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
}

function renderIntro() {
  document.title = "Scam Mirror — Social Engineering Simulator";
  app.className = "intro-view";
  app.innerHTML = `
    <section class="intro-shell">
      <p class="eyebrow">Interactive security simulation</p>
      <h1>Five scams. Five different traps. <em>Would you recognize yours?</em></h1>
      <p class="lede">Step into one randomly selected social-engineering scenario. Make the calls you would make in real life, then see the pressure tactics reflected back.</p>
      <div class="consent-card">
        <div><span class="consent-number">05</span><p>Distinct scenarios, one private learning experience.</p></div>
        <ul class="trust-list">
          <li>No real job, account, payment, or authorization</li>
          <li>Use fictional details only</li>
          <li>No entries or decisions are transmitted or saved</li>
        </ul>
        <label class="consent-check"><input id="consent" type="checkbox" /> <span>I understand this is a safe educational simulation.</span></label>
        <button class="primary" data-action="begin" disabled>Enter the simulation <span aria-hidden="true">→</span></button>
      </div>
      <p class="privacy-line"><span aria-hidden="true">●</span> Frontend only · no analytics · no storage · no account required</p>
    </section>`;
  const consent = app.querySelector("#consent");
  const begin = app.querySelector('[data-action="begin"]');
  consent.addEventListener("change", () => { begin.disabled = !consent.checked; });
  focusHeading();
}

function getDevelopmentScenario() {
  const local = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:";
  const requested = new URLSearchParams(location.search).get("scenario");
  return local && scenarios.some((item) => item.id === requested) ? requested : undefined;
}

function beginScenario(useDevelopmentSelection = true) {
  engine.start(useDevelopmentSelection ? getDevelopmentScenario() : undefined, lastScenarioId);
  renderStage();
}

function renderArtifact(artifact) {
  if (artifact.type === "form") return `
    <form class="sample-form" id="sample-form" novalidate>
      <p class="safe-note">Demo fields · fictional values only</p>
      <div class="form-row"><label>Sample full name<input name="fullName" autocomplete="off" placeholder="Jordan Example" maxlength="60" /></label><label>Sample email<input name="email" type="email" autocomplete="off" placeholder="jordan@example.test" maxlength="80" /></label></div>
      <div class="form-row"><label>Sample phone<input name="phone" autocomplete="off" placeholder="555-010-0199" maxlength="30" /></label><label>Sample address<input name="address" autocomplete="off" placeholder="12 Example Street" maxlength="100" /></label></div>
      <div class="form-row"><label>LinkedIn profile<input name="linkedin" autocomplete="off" placeholder="linkedin.com/in/sample" maxlength="100" /></label><label>GitHub profile<input name="github" autocomplete="off" placeholder="github.com/sample" maxlength="100" /></label></div>
      <div class="form-row"><label>Desired salary<input name="salary" autocomplete="off" placeholder="$230,000" maxlength="30" /></label><label>Availability<select name="availability"><option value="">Choose a sample</option><option>Immediately</option><option>Within 2 weeks</option><option>Within a month</option></select></label></div>
      <div class="form-row"><label>Mock ID reference (last 4 only)<input name="idFragment" inputmode="numeric" autocomplete="off" placeholder="1234" maxlength="4" /></label><label>Bank name only<input name="bankName" autocomplete="off" placeholder="Example Bank" maxlength="40" /></label></div>
      <p>No passwords, government IDs, account numbers, or routing numbers.</p>
    </form>`;
  return `<article class="artifact artifact-${escape(artifact.type)}"><header><strong>${escape(artifact.from)}</strong><span>${escape(artifact.meta)}</span></header><pre>${escape(artifact.content)}</pre></article>`;
}

function renderStage() {
  const scenario = engine.scenario;
  const current = engine.currentStage;
  const number = engine.stageIndex + 1;
  document.title = `${scenario.title} — Scam Mirror`;
  app.className = `simulation-view theme-${scenario.atmosphere}`;
  app.innerHTML = `
    <section class="simulation-shell">
      <header class="scenario-header">
        <div><span class="scenario-kicker">Scenario ${scenarios.indexOf(scenario) + 1} of 5</span><strong>${escape(scenario.category)}</strong></div>
        <button class="text-button" data-action="exit">Exit safely</button>
      </header>
      <div class="progress progress-${number}" aria-label="Stage ${number} of ${scenario.stages.length}"><span></span></div>
      <div class="stage-layout">
        <div class="stage-copy">
          <p class="eyebrow">${escape(current.eyebrow)}</p>
          <h1>${escape(current.title)}</h1>
          <p class="stage-body">${escape(current.body)}</p>
          <p class="stage-count">Decision ${number} / ${scenario.stages.length}</p>
        </div>
        <div class="artifact-wrap">${renderArtifact(current.artifact)}</div>
      </div>
      <section class="decision-panel" aria-labelledby="decision-title">
        <div><p class="eyebrow">Your move</p><h2 id="decision-title">What would you do?</h2></div>
        <div class="decision-grid">${current.decisions.map((decision, index) => `<button class="decision" data-decision="${escape(decision.id)}"><span>${String(index + 1).padStart(2, "0")}</span>${escape(decision.label)}<b aria-hidden="true">→</b></button>`).join("")}</div>
        <div class="stage-nav">${engine.stageIndex ? '<button class="text-button" data-action="back">← Revisit previous decision</button>' : ""}<span>Nothing leaves this browser.</span></div>
      </section>
    </section>`;
  focusHeading();
}

function getSample() {
  const form = app.querySelector("#sample-form");
  return form ? Object.fromEntries(new FormData(form)) : {};
}

function renderReveal() {
  const report = engine.report;
  lastScenarioId = report.scenario.id;
  document.title = `The Mirror — ${report.scenario.title}`;
  app.className = "reveal-view";
  app.innerHTML = `
    <section class="reveal-hero">
      <p class="eyebrow">The mirror reveal</p>
      <h1>This was ${escape(report.scenario.title.toLowerCase())}.</h1>
      <p>${escape(report.scenario.attack)}</p>
      <div class="risk-summary"><span>Your simulated exposure</span><strong>${escape(report.riskLabel)}</strong><small>${report.risky.length} of ${report.decisions.length} decisions increased potential risk. This does not mean you were compromised.</small></div>
    </section>
    <section class="report" aria-labelledby="report-title">
      <div class="report-heading"><div><p class="eyebrow">Ephemeral mirror report</p><h2 id="report-title">What your decisions reveal</h2></div><span>Not saved</span></div>
      <div class="report-grid">
        <article><h3>What you were asked to do</h3><ol class="decision-report">${report.decisions.map((item) => `<li><strong>${escape(item.stageTitle)}</strong><span>${escape(item.label)}</span><p>${escape(item.consequence)}</p></li>`).join("")}</ol></article>
        <article><h3>Warning signs you recognized</h3>${report.recognized.length ? `<ul class="tag-list recognized">${list(report.recognized)}</ul>` : "<p>You moved quickly this time. That is exactly what these scenarios are designed to make visible.</p>"}<h3>Other warning signs presented</h3><ul class="tag-list">${list(report.missed)}</ul></article>
      </div>
      ${report.scenario.id === "dream-job" ? '<article class="sample-report"><h3>Fictional application data exposed</h3><p>This temporary view shows how separate details become a useful profile. Values are erased when you leave or restart.</p><dl id="sample-report"></dl></article>' : ""}
      <div class="education-grid"><article><span>Potential impact</span><h3>What could have happened</h3><ul>${list(report.scenario.consequences)}</ul></article><article><span>Defensive playbook</span><h3>How to protect yourself</h3><ul>${list(report.scenario.defenses)}</ul></article></div>
      <aside class="supportive"><strong>Social engineering exploits context, trust, and urgency—not intelligence.</strong><p>The goal is not to feel fooled. It is to notice which moments narrowed your attention, so the real version has less power.</p></aside>
      <div class="reveal-actions"><button class="primary" data-action="another">Try another scenario <span aria-hidden="true">→</span></button><button class="secondary" data-action="home">Return home</button><a class="secondary" href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Inspect source ↗</a></div>
    </section>`;
  const sampleReport = app.querySelector("#sample-report");
  if (sampleReport) {
    const labels = { fullName: "Full name", email: "Email", phone: "Phone", address: "Address", linkedin: "LinkedIn", github: "GitHub", salary: "Salary", availability: "Availability", idFragment: "ID reference", bankName: "Bank name" };
    for (const [key, label] of Object.entries(labels)) {
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = engine.sample[key]?.trim() || "Not provided";
      sampleReport.append(term, description);
    }
  }
  focusHeading();
}

app.addEventListener("click", (event) => {
  const decisionButton = event.target.closest("[data-decision]");
  if (decisionButton) {
    const done = engine.decide(decisionButton.dataset.decision, getSample());
    done ? renderReveal() : renderStage();
    return;
  }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "begin") beginScenario();
  if (action === "another") beginScenario(false);
  if (action === "back" && engine.back()) renderStage();
  if (action === "exit" || action === "home") { engine.reset(); renderIntro(); }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && engine.scenario) { engine.reset(); renderIntro(); }
});

app.addEventListener("submit", (event) => event.preventDefault());

window.addEventListener("pageshow", (event) => { if (event.persisted) { engine.reset(); renderIntro(); } });
renderIntro();
