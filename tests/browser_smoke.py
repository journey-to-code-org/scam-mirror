from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

os.chdir(ROOT)
server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get("CHROMIUM_PATH") or None)
    for scenario in ["dream-job", "compromised-account", "coding-challenge", "equipment-reimbursement", "open-source-invitation"]:
        page = browser.new_page(viewport={"width": 1280, "height": 900}, color_scheme="light")
        errors, interaction_requests = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{base}/?scenario={scenario}", wait_until="networkidle")
        page.on("request", lambda request: interaction_requests.append(request.url))
        assert page.locator(".simulation-view").is_visible()
        assert page.locator(".site-header").is_hidden()
        assert page.locator(".scenario-header").inner_text().startswith("PRIVATE SESSION")
        for step in range(3):
            if scenario == "dream-job" and step == 2:
                page.locator('[name="fullName"]').fill("<script>alert(1)</script>")
                page.locator('[name="email"]').fill("jordan@example.test")
            page.locator("[data-decision]").first.click()
        assert page.locator(".reveal-view").is_visible()
        assert page.locator(".decision-report li").count() == 3
        if scenario == "dream-job":
            assert page.locator("#sample-report dd").first.inner_text() == "<script>alert(1)</script>"
            assert page.locator("body script").count() == 1
        assert interaction_requests == [], interaction_requests
        assert errors == [], errors
        previous_title = page.title()
        page.locator('[data-action="another"]').click()
        assert page.title() != previous_title
        page.close()

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, color_scheme="dark")
    mobile.goto(f"{base}/?scenario=dream-job", wait_until="networkidle")
    assert mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    previous_title = mobile.title()
    mobile.locator("body").press("Escape")
    assert mobile.locator(".simulation-view").is_visible()
    assert mobile.title() != previous_title
    browser.close()

server.shutdown()
print("PASS: five scenarios, reveals, no interaction requests, mobile layout, safe exit")
