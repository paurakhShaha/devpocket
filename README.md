# DevPocket

Free browser-based developer utilities:

- **JSON Formatter & Validator** — format, minify, validate
- **Unix Timestamp Converter** — seconds ↔ milliseconds ↔ human dates
- **UUID v4 Generator** — secure random identifiers
- **Regular Expression Tester** — matches, indices, capture groups

All processing happens locally in the browser. No backend, no accounts, no uploads.

## Run locally

Any static file server works. Examples:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code / Cursor Live Server
# Open index.html with Live Server
```

Then open `http://localhost:8080` in your browser.

## Deploy

Upload the folder contents to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3, nginx, etc.).

**Important:** Replace every `YOUR-DOMAIN-HERE` placeholder with your real domain (in `index.html`, `sitemap.xml`, `robots.txt`, and any remaining tool pages).

Serve over **HTTPS** (or localhost) so the Clipboard API and `crypto.randomUUID` work reliably.

## Project structure

```
index.html      # Unified homepage with all four tools
styles.css      # Design system
app.js          # All tool logic
favicon.svg
sitemap.xml
robots.txt
README.md
```

The separate HTML pages (`timestamp-converter.html`, `uuid-generator.html`, `regex-tester.html`) are retained for backward compatibility and redirect attention to the main page. The primary experience is the single homepage.

## Testing checklist

### JSON
- [ ] Valid JSON formats and minifies
- [ ] Invalid JSON shows a clear error
- [ ] Empty input handled
- [ ] Sample, clear, swap, copy work
- [ ] Indentation (2 / 4 / tab) respected

### Timestamp
- [ ] `1735689600` → seconds (2025-01-01 UTC)
- [ ] `1735689600000` → milliseconds (same instant)
- [ ] Date → timestamp produces correct seconds & ms
- [ ] “Use current time” works
- [ ] Invalid input shows error

### UUID
- [ ] Generates 1–100 UUIDs
- [ ] Uppercase option works
- [ ] Format is standard UUID v4 (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`)
- [ ] Copy / clear work

### Regex
- [ ] Email example returns expected matches
- [ ] Capture groups shown
- [ ] No matches → clear message
- [ ] Invalid pattern / flags → error
- [ ] Zero-width matches do not loop forever

### Layout
- [ ] All four tools on one page
- [ ] Navigation links scroll to the correct section
- [ ] Desktop and mobile layouts usable
- [ ] No console errors on load

## Design notes

- Neutral palette with green accent (`#315C4C`)
- System font stack + monospace for code
- Max content width ~1120 px
- Cards with subtle borders, no gradients or heavy shadows
