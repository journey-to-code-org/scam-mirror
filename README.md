# Scam Mirror

**Five scams. Five different traps. Would you recognize yours?**

Scam Mirror is a privacy-first, frontend-only social-engineering simulator. A visit opens directly inside one of five randomly selected fictional attacks, records decisions only in memory, and generates a supportive debrief showing the pressure tactics, warning signs, potential consequences, and safer alternatives. Campaign or social-post copy should provide participants with the educational context before they follow the link.

This is an educational simulation. It is not a real job, security alert, payment, coding assessment, or authorization flow. Use fictional sample values only.

## Scenarios

1. **The Dream Job** — recruitment fraud and personal-information harvesting. Preserves the original Cindervale Labs offer and sample application experience.
2. **The Compromised Account** — credential phishing, lookalike destinations, and MFA approval abuse.
3. **The Coding Challenge** — developer-targeted dependency, lifecycle-script, and workstation compromise risks.
4. **The Equipment Reimbursement** — fake-check, advance-fee, and fictional vendor fraud.
5. **The Open-Source Invitation** — OAuth consent phishing and excessive repository permission requests.

Every scenario has three decision stages and its own presentation. No simulated credential, installation, payment, OAuth authorization, or network submission performs a real action.

## Architecture

The application has no build step and no runtime dependencies:

```text
index.html             Entry document and restrictive CSP
src/main.js            Accessible renderer and interaction controller
src/engine.js          Scenario lifecycle, selection, decisions, and reports
src/scenarios.js       Five declarative scenario contracts
src/styles.css         Shared system and scenario atmospheres
tests/engine.test.js   Engine and security invariant tests
tests/browser_smoke.py Optional Playwright coverage for all scenarios
```

Each scenario declares a unique ID, metadata, stages, decisions, red flags, consequences, and defensive actions. `SimulationEngine` knows only this contract; adding another conforming scenario does not require engine changes.

`selectScenario` uses `Math.random()` and gives all five registered scenarios equal selection ranges. “Try another scenario” excludes the immediately completed scenario when alternatives exist. Selection history, decisions, and fictional form entries remain in JavaScript memory only and are cleared on restart or safe exit.

For local automated browser testing, `?scenario=<id>` directly selects a scenario on `localhost`, `127.0.0.1`, or `file:` URLs. Deployed hosts ignore this development selector.

## Privacy and security properties

- No backend, application API, analytics, tracking pixels, cookies, or service worker.
- No `localStorage`, `sessionStorage`, IndexedDB, or URL-based participant state.
- No runtime `fetch`, `XMLHttpRequest`, `sendBeacon`, or `WebSocket` calls.
- No real passwords, MFA codes, government IDs, bank accounts, payment details, or access tokens.
- Sample recruitment values are never placed in the reveal and are discarded on restart.
- User-entered values are not interpolated into HTML. Scenario strings are escaped before rendering.
- The Content Security Policy blocks connections, form actions, frames, objects, remote fonts, and third-party scripts.
- The favicon is an inline data image; all other runtime assets are local.
- External source links open only after an intentional click with `noopener`, `noreferrer`, and a no-referrer policy.

A static host can still record the initial document and asset requests. Browser extensions, autofill, screenshots, and compromised devices are outside the app’s guarantees.

## Run locally

ES modules require an HTTP origin in most browsers. Start any static file server from the repository root, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

The engine/security suite uses Node’s built-in modules and needs no installation:

```bash
npm test
```

The optional browser suite traverses all five scenarios at desktop size, checks mobile overflow and safe exit behavior, verifies reveals, and observes interaction-time requests:

```bash
python -m pip install playwright
python -m playwright install chromium
npm run test:browser
```

Set `CHROMIUM_PATH` if Chromium is already installed elsewhere.

## Add a scenario

1. Add one contract to `scenarios` in `src/scenarios.js` with a unique `id`, display metadata, at least one stage, decision consequences and risk values, red flags, real-world consequences, and defensive actions.
2. Keep every interaction fictional and inert. Never collect credentials, payment data, tokens, or full identity data.
3. Add engine assertions for cautious and risky paths and include the ID in browser coverage.
4. Run the engine/security suite and, when Playwright is available, the browser suite.
5. Document any new attack category here.

## Source transparency

The reveal links to the configured public source repository: <https://github.com/journey-to-code-org/scam-mirror>. If the project moves, update `SOURCE_URL` in `src/main.js`; the browser’s View Source and developer tools remain available for inspecting every runtime file.

Scam Mirror is licensed under the [MIT License](LICENSE). All organizations, people, offers, repositories, account alerts, vendors, payments, and authorization requests depicted by the simulator are fictional.
