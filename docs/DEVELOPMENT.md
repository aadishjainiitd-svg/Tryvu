# Development and deployment

[← Product overview](../README.md)

## Run locally

**Requirements:** Python 3.10+ and a modern browser. No frontend build step or Python packages are required.

```sh
git clone https://github.com/aadishjainiitd-svg/Tryvu.git
cd Tryvu
python3 prototypes/tryvo/server.py --port 8765
```

Open **[http://127.0.0.1:8765](http://127.0.0.1:8765)**. On Windows, use `py` if your Python installation does not provide `python3`. Keep the server running while using the prototype.

### Enable the AI client and reports

Copy the supplied template to **`.env.tryvo` in the repository root**:

```sh
# macOS / Linux
cp .env.example .env.tryvo
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env.tryvo
```

Edit the local copy:

```dotenv
GROQ_API_KEY=your_private_groq_key
GROQ_MODEL=openai/gpt-oss-120b
```

Use a model available to your Groq account. This integration uses **Groq**, not xAI Grok. Requests consume your provider quota and may incur provider charges. With no key, use **Demo** and the explicit **offline route exercise**; the interface never pretends an offline response came from AI.

Serve the application with `server.py` for local development. Static hosting uses the separate Render backend configured below. The example configuration contains no credential.

### Vercel frontend and Render backend

The hosted frontend at **https://tryvu-tryvo.vercel.app** sends its case and practice-report requests to **https://tryvu-5.onrender.com**. The public API base is defined once in `prototypes/tryvo/js/api-config.js`; localhost development continues to use the local Python server. This is a plain JavaScript site with no build step, so no `NEXT_PUBLIC_API_URL`, `VITE_API_URL` or `REACT_APP_API_URL` variable is needed.

- **Vercel:** deploy `main` with Root Directory `prototypes/tryvo` and Framework Preset **Other**. The existing project can redeploy after the GitHub push.
- **Render:** deploy the same branch with start command `python3 prototypes/tryvo/server.py`. If the service Root Directory is `prototypes/tryvo`, use `python3 server.py`. The server reads Render's `PORT` automatically; `--port` remains available for local use.
- Set `GROQ_API_KEY` and optionally `GROQ_MODEL` in **Render's** environment. Never put the private key in Vercel frontend JavaScript.
- Check `https://tryvu-5.onrender.com/api/health`: HTTP 200 with `configured: true` means the server can see its configured key; it does not validate the key with Groq.
- CORS supports `GET`, `POST`, `OPTIONS`, `Content-Type` and the frontend's `X-Tryvo-Client` header, including API error responses. By default it allows any origin as requested for this prototype. Optionally set `TRYVO_ALLOWED_ORIGINS=https://tryvu-tryvo.vercel.app` in Render to restrict access from browsers; add other exact origins separated by commas if needed.

If automatic deployment is disabled, deploy the latest commit in both dashboards. A Render restart without persistent storage may clear existing case sessions; start a fresh case if an older session is unavailable.

### A useful first walkthrough

1. Open **Demo** and try “Your first connection.”
2. Choose a journey on **Explore** and click **Open client case**.
3. Record your first take, open exhibits and ask the client a question if useful.
4. Submit a recommendation, revise if necessary and unlock the route.
5. Run the tram, respond to the arrival development and inspect **My progress**.
6. Open **MindScore → Generate AI report** after a reviewed case.

## Architecture

Plain **HTML, CSS and vanilla JavaScript** form the interface. A small **Python standard-library server** serves the app and proxies AI requests. SQLite retains local case sessions and cached reports.

```text
Tryvu/
├── .env.example                  Safe configuration template
├── .gitignore                    Credentials, databases and generated files excluded
└── prototypes/tryvo/
    ├── index.html                Application shell
    ├── css/                      Responsive interface and game styling
    ├── js/
    │   ├── rescue-engine.js      Route economics and one-time awards
    │   ├── case-workbench.js     Brief → evidence → decision → feedback
    │   └── mindscore.js          Eligible points and practice-report interface
    ├── assets/                   Local artwork, fonts and authored case dossiers
    ├── server.py                 Local web server and Groq case API
    ├── report_service.py         Evidence-linked practice reports
    ├── tests/                    Engine, API and browser checks
    └── vendor/                   Retained third-party license notices
```

| Boundary | Responsibility |
| --- | --- |
| Authored case dossiers | Keep the scenario and exhibits consistent |
| AI client and reviewer | Discuss evidence and critique a recommendation |
| Server validation | Validate response shape, citations and acceptance criteria |
| Game engine | Apply route constraints, credits and non-repeatable awards |
| Browser state | Preserve non-sensitive demo progress on this device |

The two case-bank files—`assets/business-cases.json` and `js/case-data.js`—must stay in sync when editing scenarios.

## Credentials and data

- Real `.env` files are ignored at every directory level. **Only `.env.example` is intended for Git.**
- API keys remain server-side, outside the served web directory. They are never placed in JavaScript or localStorage.
- `.tryvo-local/`, local databases, logs and generated AI reports are excluded from version control.
- Case requests have payload limits, rate limits, response validation and retry caching. The server listens on `0.0.0.0`, accepts local and configured Render hosts, and supports optional browser-origin restrictions.
- Use fictional information. Case text is sent to Groq when you request AI conversation, review or reporting.
- **Reset Demo** clears browser progress and its saved report. It does not delete the private server-side session store. To remove that store, stop the server and remove the repository's `.tryvo-local` folder.
- Rotate any API key that has been shared or exposed. A `.gitignore` rule cannot revoke an already exposed credential.

## Tests

Run the deterministic checks from the repository root:

```sh
node prototypes/tryvo/tests/economy-engine.cjs
node prototypes/tryvo/tests/cases-engine.cjs
python3 prototypes/tryvo/tests/cases-server.py
python3 prototypes/tryvo/tests/report-server.py
python3 prototypes/tryvo/tests/deployment-http.py
node prototypes/tryvo/tests/api-config.cjs
```

For browser checks, install Node.js and Playwright, then start the local server in another terminal:

```sh
npm install --no-save playwright
npx playwright install chromium
node prototypes/tryvo/tests/cases-browser.cjs
node prototypes/tryvo/tests/mindscore-browser.cjs
node prototypes/tryvo/tests/economy-browser.cjs
node prototypes/tryvo/tests/tutorial.cjs
node prototypes/tryvo/tests/tutorial-preservation.cjs
```

Browser coverage includes case revisions, unavailable AI, retry recovery, saved drafts, one-time rewards, mobile layouts at 320/390px, keyboard controls, reset and preservation of older progress. AI-path browser tests use controlled responses; they do not spend provider credits or establish model quality. Historical live-provider checks are separate from these deterministic suites; a passing mock does not establish model quality or current provider availability.


### Presentation and navigation checks

```sh
node prototypes/tryvo/tests/fieldguide-browser.cjs
node prototypes/tryvo/tests/motion-browser.cjs
node prototypes/tryvo/tests/journey-polish-browser.cjs
node prototypes/tryvo/tests/guidance-browser.cjs
```

These additional suites cover responsive layouts, selected contrast checks, reduced motion, tram travel, return navigation and saved case/arrival handoffs. They write screenshots to your OS temporary directory by default; set `TRYVO_SCREENSHOT_DIR` to choose a different directory. Other older suites write local screenshots under `prototypes/tryvo/screenshots/`; inspect generated changes before committing.

### Troubleshooting

| Symptom | Next step |
| --- | --- |
| AI client or report is unavailable | Use Demo or the explicit offline route exercise; check the backend health endpoint and server-side configuration. |
| A saved case session is missing after a backend restart | Start a new case session. The interface retains the written browser draft. |
| Local files open, but API requests fail | Run the Python server and open its HTTP URL instead of opening `index.html` directly. |
| Playwright is missing | Install the browser-test dependency and Chromium using the commands above. Node.js is needed only for tests. |
| Browser progress differs between devices | Progress is stored locally in each browser; the prototype has no account sync. |

## Related documentation

- [Design system](../DESIGN.md)
- [Business case contract](../prototypes/tryvo/BUSINESS-CASES.md)
- [Route economy](../prototypes/tryvo/ECONOMY.md)
- [Guided lessons](../prototypes/tryvo/DEMO-DESIGN.md)
- [First-use design rationale](../product/first-use-guidance.md)
