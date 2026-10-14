export function selectScenario(registry, { excludeId, random = Math.random } = {}) {
  const candidates = registry.filter((item) => item.id !== excludeId);
  const pool = candidates.length ? candidates : registry;
  if (!pool.length) throw new Error("At least one scenario is required");
  const value = Math.min(Math.max(Number(random()) || 0, 0), 0.999999999999);
  return pool[Math.floor(value * pool.length)];
}

export class SimulationEngine {
  constructor(registry, random = Math.random) { this.registry = registry; this.random = random; this.reset(); }
  start(id, excludeId) {
    const selected = id ? this.registry.find((item) => item.id === id) : selectScenario(this.registry, { excludeId, random: this.random });
    if (!selected) throw new Error(`Unknown scenario: ${id}`);
    this.scenario = selected; this.stageIndex = 0; this.decisions = []; this.complete = false; this.sample = {};
    return selected;
  }
  decide(decisionId, sample = {}) {
    if (!this.scenario || this.complete) throw new Error("No active stage");
    const current = this.currentStage;
    const decision = current.decisions.find((item) => item.id === decisionId);
    if (!decision) throw new Error(`Unknown decision: ${decisionId}`);
    this.decisions.push({ stageId: current.id, stageTitle: current.title, ...decision });
    this.sample = { ...this.sample, ...sample };
    if (this.stageIndex === this.scenario.stages.length - 1) this.complete = true; else this.stageIndex += 1;
    return this.complete;
  }
  back() { if (!this.scenario || this.stageIndex === 0 || this.complete) return false; this.stageIndex -= 1; this.decisions.pop(); return true; }
  get currentStage() { return this.scenario?.stages[this.stageIndex]; }
  get report() {
    if (!this.scenario || !this.complete) throw new Error("Scenario is not complete");
    const recognized = new Set(this.decisions.flatMap((item) => item.recognizes));
    const encountered = [...new Set(this.scenario.stages.flatMap((item) => item.redFlags))];
    const risk = this.decisions.reduce((sum, item) => sum + item.risk, 0);
    return { scenario: this.scenario, decisions: this.decisions.map((item) => ({ ...item })), encountered, recognized: encountered.filter((item) => recognized.has(item)), missed: encountered.filter((item) => !recognized.has(item)), risky: this.decisions.filter((item) => item.risk > 0), risk, riskLabel: risk === 0 ? "Low exposure" : risk <= 3 ? "Guarded" : risk <= 6 ? "Elevated" : "High exposure" };
  }
  reset() { this.scenario = null; this.stageIndex = 0; this.decisions = []; this.complete = false; this.sample = {}; }
}
