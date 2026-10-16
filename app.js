(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ── Shared helpers ──────────────────────────────────────────────
  let toastTimer;
  function showToast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  function setStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg || "";
    el.className = el.classList.contains("status-bar")
      ? `status-bar${type === "success" ? " success" : type === "error" ? " error" : ""}`
      : `status-text${type === "success" ? " success" : type === "error" ? " error" : ""}`;
  }

  // ── JSON Tool ───────────────────────────────────────────────────
  const jsonInput = $("json-input");
  const jsonOutput = $("json-output");
  const jsonStatus = $("json-status");
  const jsonIndent = $("json-indent");

  const sampleJson = {
    project: "DevPocket",
    description: "A simple developer toolkit",
    version: 1,
    active: true,
    features: ["format JSON", "validate syntax", "minify JSON"],
    owner: { role: "developer", location: "Nepal" },
    settings: { theme: "light", indentation: 2 }
  };

  function getIndent() {
    return jsonIndent.value === "tab" ? "\t" : Number(jsonIndent.value);
  }

  function updateJsonMeta() {
    const inVal = jsonInput.value;
    const outVal = jsonOutput.value;
    $("json-input-meta").textContent = `${inVal.length} characters`;
    $("json-output-meta").textContent = outVal
      ? `${outVal.length} characters`
      : "No output";
  }

  function formatJson() {
    const raw = jsonInput.value.trim();
    if (!raw) {
      setStatus(jsonStatus, "Add some JSON first, or load the sample.", "error");
      jsonInput.focus();
      return;
    }
    try {
      const value = JSON.parse(raw);
      jsonOutput.value = JSON.stringify(value, null, getIndent());
      updateJsonMeta();
      setStatus(jsonStatus, "Valid JSON — formatted successfully.", "success");
    } catch (e) {
      setStatus(jsonStatus, e.message || "Invalid JSON.", "error");
    }
  }

  function minifyJson() {
    const raw = jsonInput.value.trim();
    if (!raw) {
      setStatus(jsonStatus, "Add some JSON first, or load the sample.", "error");
      jsonInput.focus();
      return;
    }
    try {
      const value = JSON.parse(raw);
      jsonOutput.value = JSON.stringify(value);
      updateJsonMeta();
      setStatus(jsonStatus, "Valid JSON — minified.", "success");
    } catch (e) {
      setStatus(jsonStatus, e.message || "Invalid JSON.", "error");
    }
  }

  function validateJson() {
    const raw = jsonInput.value.trim();
    if (!raw) {
      setStatus(jsonStatus, "Add some JSON first, or load the sample.", "error");
      jsonInput.focus();
      return;
    }
    try {
      JSON.parse(raw);
      setStatus(jsonStatus, "Valid JSON — no syntax errors found.", "success");
    } catch (e) {
      setStatus(jsonStatus, e.message || "Invalid JSON.", "error");
    }
  }

  async function copyJson() {
    if (!jsonOutput.value) {
      setStatus(jsonStatus, "No output to copy yet.", "error");
      return;
    }
    const ok = await copyText(jsonOutput.value);
    if (ok) {
      showToast("Copied to clipboard");
      setStatus(jsonStatus, "Output copied to clipboard.", "success");
    } else {
      setStatus(jsonStatus, "Copy failed. Select the output and copy manually.", "error");
    }
  }

  function clearJson() {
    jsonInput.value = "";
    jsonOutput.value = "";
    updateJsonMeta();
    setStatus(jsonStatus, "Workspace cleared. Paste JSON or load the sample.");
    jsonInput.focus();
  }

  function loadSample() {
    jsonInput.value = JSON.stringify(sampleJson);
    formatJson();
  }

  function swapJson() {
    if (!jsonOutput.value) {
      setStatus(jsonStatus, "Create an output first before swapping.", "error");
      return;
    }
    const prev = jsonInput.value;
    jsonInput.value = jsonOutput.value;
    jsonOutput.value = prev;
    updateJsonMeta();
    setStatus(jsonStatus, "Input and output swapped.", "success");
  }

  if (jsonInput) {
    jsonInput.addEventListener("input", updateJsonMeta);
    $("json-format").addEventListener("click", formatJson);
    $("json-minify").addEventListener("click", minifyJson);
    $("json-validate").addEventListener("click", validateJson);
    $("json-copy").addEventListener("click", copyJson);
    $("json-clear").addEventListener("click", clearJson);
    $("json-sample").addEventListener("click", loadSample);
    $("json-swap").addEventListener("click", swapJson);
    jsonIndent.addEventListener("change", () => {
      if (jsonOutput.value) formatJson();
    });
    updateJsonMeta();
  }

  // ── Timestamp Tool ──────────────────────────────────────────────
  const tsInput = $("ts-input");
  const tsOutput = $("ts-output");
  const tsStatus = $("ts-status");
  const dateInput = $("date-input");
  const dateOutput = $("date-output");
  const dateStatus = $("date-status");

  function convertTimestamp() {
    const raw = tsInput.value.trim();
    if (!raw) {
      setStatus(tsStatus, "Enter a numeric timestamp.", "error");
      tsOutput.textContent = "";
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setStatus(tsStatus, "Invalid number. Enter a valid Unix timestamp.", "error");
      tsOutput.textContent = "";
      return;
    }
    // Heuristic: |n| >= 1e12 → milliseconds, else seconds
    const isMs = Math.abs(n) >= 1e12;
    const ms = isMs ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
      setStatus(tsStatus, "Out-of-range or invalid timestamp.", "error");
      tsOutput.textContent = "";
      return;
    }
    const unit = isMs ? "milliseconds" : "seconds";
    tsOutput.textContent =
      `Interpreted as: ${unit}\n` +
      `UTC:   ${d.toISOString()}\n` +
      `Local: ${d.toString()}`;
    setStatus(tsStatus, `Converted (${unit}).`, "success");
  }

  function useNow() {
    const sec = Math.floor(Date.now() / 1000);
    tsInput.value = String(sec);
    convertTimestamp();
  }

  async function copyTs() {
    const text = tsOutput.textContent;
    if (!text) {
      setStatus(tsStatus, "Nothing to copy.", "error");
      return;
    }
    const ok = await copyText(text);
    setStatus(tsStatus, ok ? "Copied." : "Copy failed; select and copy manually.", ok ? "success" : "error");
    if (ok) showToast("Copied to clipboard");
  }

  function convertDate() {
    const val = dateInput.value;
    if (!val) {
      setStatus(dateStatus, "Choose a date and time.", "error");
      dateOutput.textContent = "";
      return;
    }
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) {
      setStatus(dateStatus, "Invalid date.", "error");
      dateOutput.textContent = "";
      return;
    }
    const ms = d.getTime();
    dateOutput.textContent =
      `Seconds:      ${Math.floor(ms / 1000)}\n` +
      `Milliseconds: ${ms}`;
    setStatus(dateStatus, "Converted.", "success");
  }

  if (tsInput) {
    $("ts-convert").addEventListener("click", convertTimestamp);
    $("ts-now").addEventListener("click", useNow);
    $("ts-copy").addEventListener("click", copyTs);
    $("date-convert").addEventListener("click", convertDate);
    tsInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") convertTimestamp();
    });
  }

  // ── UUID Tool ───────────────────────────────────────────────────
  const uuidOutput = $("uuid-output");
  const uuidStatus = $("uuid-status");

  function generateUuid() {
    // Prefer crypto.randomUUID, fall back to getRandomValues
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
      const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    return null;
  }

  function generateUuids() {
    const count = Number($("uuid-count").value) || 1;
    const upper = $("uuid-uppercase").checked;
    const list = [];
    for (let i = 0; i < count; i++) {
      const id = generateUuid();
      if (id === null) {
        setStatus(uuidStatus, "Secure randomness is unavailable in this environment. Open the page over HTTPS or localhost.", "error");
        uuidOutput.textContent = "";
        return;
      }
      list.push(upper ? id.toUpperCase() : id);
    }
    uuidOutput.textContent = list.join("\n");
    setStatus(uuidStatus, `Generated ${list.length} UUID${list.length === 1 ? "" : "s"}.`, "success");
  }

  async function copyUuids() {
    const text = uuidOutput.textContent;
    if (!text) {
      setStatus(uuidStatus, "Nothing to copy. Generate UUIDs first.", "error");
      return;
    }
    const ok = await copyText(text);
    setStatus(uuidStatus, ok ? "Copied." : "Copy failed; select and copy manually.", ok ? "success" : "error");
    if (ok) showToast("Copied to clipboard");
  }

  function clearUuids() {
    uuidOutput.textContent = "";
    setStatus(uuidStatus, "");
  }

  if ($("uuid-generate")) {
    $("uuid-generate").addEventListener("click", generateUuids);
    $("uuid-copy").addEventListener("click", copyUuids);
    $("uuid-clear").addEventListener("click", clearUuids);
  }

  // ── Regex Tool ──────────────────────────────────────────────────
  const regexPattern = $("regex-pattern");
  const regexFlags = $("regex-flags");
  const regexText = $("regex-text");
  const regexOutput = $("regex-output");
  const regexStatus = $("regex-status");
  const MAX_MATCHES = 500;

  function testRegex() {
    const pattern = regexPattern.value;
    const flags = regexFlags.value;
    const input = regexText.value;

    if (!pattern) {
      setStatus(regexStatus, "Enter a regular expression pattern.", "error");
      regexOutput.textContent = "";
      return;
    }

    // Validate flags
    const validFlags = /^[gimsuy]*$/;
    if (flags && !validFlags.test(flags)) {
      setStatus(regexStatus, "Invalid flags. Allowed: g, i, m, s, u, y.", "error");
      regexOutput.textContent = "";
      return;
    }

    // Check for duplicate flags
    if (flags && new Set(flags).size !== flags.length) {
      setStatus(regexStatus, "Duplicate flags are not allowed.", "error");
      regexOutput.textContent = "";
      return;
    }

    let re;
    try {
      re = new RegExp(pattern, flags);
    } catch (e) {
      setStatus(regexStatus, `Invalid regular expression: ${e.message}`, "error");
      regexOutput.textContent = "";
      return;
    }

    // Always use global for finding all matches; preserve user's other flags
    const globalFlags = flags.includes("g") ? flags : flags + "g";
    let globalRe;
    try {
      globalRe = new RegExp(pattern, globalFlags);
    } catch (e) {
      setStatus(regexStatus, `Invalid regular expression: ${e.message}`, "error");
      regexOutput.textContent = "";
      return;
    }

    const matches = [];
    let m;
    let guard = 0;
    while ((m = globalRe.exec(input)) !== null && guard < MAX_MATCHES) {
      guard++;
      const groups = m.slice(1);
      let line = `Match ${matches.length + 1} at index ${m.index}: ${JSON.stringify(m[0])}`;
      if (groups.length) {
        line += `\n  Captures: ${JSON.stringify(groups)}`;
      }
      matches.push(line);
      // Prevent infinite loop on zero-width matches
      if (m[0] === "") {
        globalRe.lastIndex++;
      }
      if (globalRe.lastIndex > input.length) break;
    }

    if (matches.length === 0) {
      // Double-check with original (non-forced-global) for consistency message
      const found = re.test(input);
      regexOutput.textContent = found
        ? "A match was found but could not be enumerated (check sticky/y flag behaviour)."
        : "No matches found.";
      setStatus(regexStatus, "No matches.", "info");
    } else {
      let result = matches.join("\n\n");
      if (guard >= MAX_MATCHES) {
        result += `\n\n… stopped after ${MAX_MATCHES} matches (limit reached).`;
      }
      regexOutput.textContent = result;
      setStatus(regexStatus, `${matches.length} match${matches.length === 1 ? "" : "es"} found.`, "success");
    }
  }

  function loadRegexExample() {
    regexPattern.value = "\\b[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,}\\b";
    regexFlags.value = "gi";
    regexText.value = "Contact us at hello@example.com or support@devpocket.dev.\nInvalid: not-an-email, user@, @domain.com";
    testRegex();
  }

  function clearRegex() {
    regexPattern.value = "";
    regexFlags.value = "gi";
    regexText.value = "";
    regexOutput.textContent = "";
    setStatus(regexStatus, "");
  }

  if (regexPattern) {
    $("regex-test").addEventListener("click", testRegex);
    $("regex-example").addEventListener("click", loadRegexExample);
    $("regex-clear").addEventListener("click", clearRegex);
  }

  // ── Footer year ─────────────────────────────────────────────────
  const yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
