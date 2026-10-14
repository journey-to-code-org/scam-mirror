# Scam Mirror

An immersive, fictional job-scam awareness experience implemented as **one self-contained static HTML file**.

## How it works

1. Visitors first see a fictional recruiting message, provisional offer letter, and application form.
2. On **Submit**, JavaScript calls `event.preventDefault()`, performs native browser validation, and reads the form with `FormData`.
3. The site displays the submitted values locally alongside an explanation of how scammers can exploit each data point.
4. The original form inputs are reset immediately. **Erase displayed entries and restart** removes the values from the reveal DOM.

All people, companies, job terms, and offers depicted here are fictional. This is an educational demonstration, not a real employment listing.

## Privacy and safety properties

- **No backend, form endpoint, API, analytics, tracking pixel, cookies, or third-party library.**
- No outbound network calls are made by site JavaScript. All styling and behavior are inline.
- An explicit restrictive Content Security Policy blocks connections, native form posts, remote images, and third-party resources.
- Values are not persisted in localStorage, sessionStorage, IndexedDB, cookies, or the URL.
- Entered values are rendered using `textContent`, not `innerHTML`.
- The mock ID field accepts at most four characters. The payroll field requests **bank name only**. Full government IDs, SSNs, routing numbers, and account numbers are *never requested*.
- The site has outbound links to the public GitHub repo and fraud reporting agencies **only if a user clicks them**. Those pages are outside this app's privacy guarantees.

**Important limitations:** A static hosting provider can record visits to the HTML page; browser features and extensions may observe or autofill input fields. The app cannot guarantee privacy against a compromised browser, a modified distribution, browser plugins, keyloggers, or infrastructure run by another party. Use **invented sample values** when testing or demonstrating.

**Source:** https://github.com/journey-to-code-org/scam-mirror

## Run locally

Open `index.html` directly in any modern browser. No server, package installation, build command, or environment variables are required.

## Publish an auditable public repository

1. Create a new **public** GitHub repository (for example, `scam-mirror`).
2. Commit `index.html`, this README, `LICENSE`, and the optional local audit script.
3. In `index.html`, set `PUBLIC_SOURCE_REPOSITORY` to its *actual, verified* URL, (this deployment uses `https://github.com/journey-to-code-org/scam-mirror`), then commit that change.
4. Optionally serve `index.html` with GitHub Pages. Verify the static host does not inject scripts or analytics.
5. Test the network panel: after the initial HTML document load, filling the form and pressing Submit should produce **zero** requests. Navigating to external reporting/source links is user-initiated and will contact those services.

Until an actual public repository URL is configured, the reveal plainly says that the source link is not yet available and directs the user to View Page Source. **Do not imply that a repository exists before it is published.**

## Automated browser smoke test (optional)

The application itself needs no dependencies. To run the test harness:

```bash
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

If your Chromium is already installed elsewhere, set `CHROMIUM_PATH` to its executable. The smoke test uses a browser document populated from local HTML without a remote navigation. It checks reveal behavior, escaping, no observed network requests, and mobile overflow; the source audit checks that the app has no storage writes.

## Manual QA checklist

- [ ] Can submit with sample values and see every entry, including blank optional fields.
- [ ] Browser validation prevents a missing or invalid required value from reaching reveal.
- [ ] Pressing Submit sends no HTTP request and changes no browser storage.
- [ ] Rendering user strings such as `<script>alert(1)</script>` treats them as plain text.
- [ ] Erase/restart clears previously displayed values.
- [ ] No reveal wording is visible in the initial rendered view.
- [ ] Works on narrow mobile viewports and with keyboard-only navigation.
- [ ] Deployed public repo link works and source matches deployed HTML.

## Threat model and scope

Scam Mirror intentionally mimics common job-fraud tactics for education. It does **not** harvest credentials, payment details, or full identification documents. It should be deployed in a context where visitors can reasonably expect a security-awareness exercise, and it should never be used to impersonate an actual employer or trick real candidates into surrendering authentic sensitive information.

The fake company is **Cindervale Labs**; the brand mark is drawn entirely with CSS. No real corporate identity assets are used.
