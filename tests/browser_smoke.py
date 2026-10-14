from pathlib import Path
import os
from playwright.sync_api import sync_playwright

html=(Path(__file__).resolve().parents[1] / 'index.html').read_text(encoding='utf-8')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_PATH') or None, args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page(viewport={'width':1440,'height':1100}, device_scale_factor=1)
 errs=[];requests=[]
 page.on('pageerror', lambda err: errs.append(str(err)))
 page.on('request',lambda req: requests.append((req.method, req.url)))
 page.set_content(html,wait_until='domcontentloaded',timeout=15000)
 page.screenshot(path=str(Path(__file__).resolve().parents[1] / 'preview.png'),full_page=True,animations='disabled')
 assert 'shortlisted' in page.locator('#recruitment-view').inner_text().lower()
 assert page.locator('#reveal-view').is_hidden()
 page.locator('#candidate-form button[type=submit]').click()
 assert page.locator('#reveal-view').is_hidden(), 'Required values were not checked'
 payload={'fullName':'<script>alert(1)</script>', 'email':'jordan@example.test', 'phone':'555-010-0199', 'address':'12 Example Street, Fiction City','linkedin':'linkedin.com/in/jordan-test','github':'github.com/demo-test','salary':'$230000','idFragment':'1234','bankName':'Example Bank'}
 for key,val in payload.items(): page.locator('#'+key).fill(val)
 page.locator('#availability').select_option(label='Within 2 weeks')
 page.locator('#confirm').check()
 page.locator('#candidate-form button[type=submit]').click()
 assert page.locator('#reveal-view').is_visible()
 assert page.locator('#recruitment-view').is_hidden()
 assert page.locator('.exposure-card').count()==10
 assert page.locator('.field-value').first.inner_text()=='<script>alert(1)</script>'
 assert page.locator('body script').count()==1
 assert page.locator('#source-unset').is_visible()
 assert page.locator('#source-link').is_hidden()
 assert page.evaluate('document.getElementById("fullName").value')==''
 assert not any(('localStorage.setItem(' in html, 'sessionStorage.setItem(' in html, 'document.cookie =' in html))
 assert not errs, errs
 assert requests==[],requests
 page.screenshot(path=str(Path(__file__).resolve().parents[1] / 'reveal-preview.png'),full_page=True,animations='disabled')
 page.locator('#restart-button').click()
 assert page.locator('#recruitment-view').is_visible()
 assert page.locator('.exposure-card').count()==0
 page.set_viewport_size({'width':390,'height':844})
 page.screenshot(path=str(Path(__file__).resolve().parents[1] / 'mobile-preview.png'),full_page=True,animations='disabled')
 assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), 'Mobile horizontal overflow'
 print('PASS: input validation, reveal field mapping, XSS safety, zero outbound requests, no storage, erase/restart, mobile no-overflow')
 browser.close()
