import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SimulationEngine, selectScenario } from "../src/engine.js";
import { scenarios, validateScenarios } from "../src/scenarios.js";

test("all five scenarios register with unique ids", () => {
  assert.equal(scenarios.length, 5);
  assert.equal(new Set(scenarios.map(({ id }) => id)).size, 5);
  assert.equal(validateScenarios(), true);
});

test("selection returns registered scenarios with equal index ranges", () => {
  scenarios.forEach((scenario, index) => assert.equal(selectScenario(scenarios, { random: () => (index + 0.5) / scenarios.length }).id, scenario.id));
});

test("selection can exclude the immediately completed scenario", () => {
  assert.equal(selectScenario(scenarios, { excludeId: scenarios[0].id, random: () => 0 }).id, scenarios[1].id);
});

test("a new scenario can be selected without engine changes", () => {
  const extra = { ...scenarios[0], id: "new-scenario", title: "New scenario" };
  assert.equal(selectScenario([...scenarios, extra], { random: () => 0.999 }).id, "new-scenario");
});

test("each decision path produces scenario-specific feedback", () => {
  for (const scenario of scenarios) for (const mode of ["cautious", "risky"]) {
    const engine = new SimulationEngine(scenarios); engine.start(scenario.id);
    for (const current of scenario.stages) {
      const decision = mode === "cautious" ? current.decisions.reduce((best, item) => item.risk < best.risk ? item : best) : current.decisions.reduce((worst, item) => item.risk > worst.risk ? item : worst);
      engine.decide(decision.id);
    }
    assert.equal(engine.report.scenario.id, scenario.id);
    assert.equal(engine.report.decisions.length, scenario.stages.length);
    assert.ok(engine.report.decisions.every(({ consequence }) => consequence.length > 20));
    if (mode === "risky") assert.ok(engine.report.risk > 0);
  }
});

test("back and reset clear transient decision state", () => {
  const engine = new SimulationEngine(scenarios); engine.start("dream-job");
  engine.decide("research", { sampleName: "Jordan Example" });
  assert.equal(engine.back(), true); assert.equal(engine.decisions.length, 0);
  engine.reset(); assert.equal(engine.scenario, null); assert.deepEqual(engine.sample, {});
});

test("runtime source contains no transmission or browser storage APIs", async () => {
  const source = await Promise.all(["src/main.js", "src/engine.js", "src/scenarios.js"].map((file) => readFile(new URL(`../${file}`, import.meta.url), "utf8")));
  const joined = source.join("\n");
  for (const forbidden of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket(", "localStorage", "sessionStorage", "document.cookie", "window.open("]) assert.equal(joined.includes(forbidden), false, `Found forbidden runtime API: ${forbidden}`);
});

test("CSP blocks connections and form actions", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /connect-src 'none'/); assert.match(html, /form-action 'none'/); assert.doesNotMatch(html, /<form[^>]+action=/i);
});
