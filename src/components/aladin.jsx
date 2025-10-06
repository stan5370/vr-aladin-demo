import { useEffect, useRef } from "react";

/** =======================
 *  HARD-CODED ELASTIC CONFIG  (⚠️ visible publicly)
 *  ======================= */
const ELASTIC_NODE = "https://fab2b4856297441093951799e34992ed.centralus.azure.elastic-cloud.com:443"; // no trailing slash
const ELASTIC_LLM_ID = ".rainbow-sprinkles-elastic"; // your inference endpoint id
const ELASTIC_API_KEY = "RHJFY3Nwa0JzQ01PWDR6ZFAzTFQ6OHdLZmJBaGNpZ09JMlZYa0ptczFUdw==";      // ApiKey base64 string from Elastic

/** =======================
 *  Helpers
 *  ======================= */
function pad(n, w = 2) { return String(Math.floor(Math.abs(n))).padStart(w, "0"); }
function toHMS(raDeg) {
  const h = raDeg / 15;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = ((h - hh) * 3600 - mm * 60);
  return `${pad(hh)} ${pad(mm)} ${ss.toFixed(2).padStart(5, "0")}`;
}
function toDMS(decDeg) {
  const sign = decDeg >= 0 ? "+" : "-";
  const a = Math.abs(decDeg);
  const dd = Math.floor(a);
  const mm = Math.floor((a - dd) * 60);
  const ss = ((a - dd) * 3600 - mm * 60);
  return `${sign}${pad(dd)} ${pad(mm)} ${ss.toFixed(2).padStart(5, "0")}`;
}
function formatMessageWithLineBreaks(text, maxChars = 100) {
  const words = String(text ?? "").split(" ");
  let line = "";
  const lines = [];
  for (const w of words) {
    if ((line + w).length > maxChars) {
      if (line) lines.push(line.trim());
      line = "";
    }
    line += w + " ";
  }
  if (line) lines.push(line.trim());
  return lines.join("<br>");
}

/** Parse Elastic SSE stream into concatenated text */
function extractTextFromSSE(sseText) {
  const lines = sseText.split(/\r?\n/);
  let out = "";
  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const jsonStr = line.slice(5).trim();
    if (!jsonStr || jsonStr === "[DONE]") continue;
    try {
      const evt = JSON.parse(jsonStr);
      const cc = evt.chat_completion ?? evt;
      const delta = cc?.choices?.[0]?.delta;
      if (typeof delta?.content === "string") out += delta.content;
    } catch { /* ignore malformed lines */ }
  }
  return out.trim();
}

function buildMessages(starCoords) {
  return [
    {
      role: "system",
      content:
        "Return a stringified JSON (no markdown fences) with fields: " +
        "starName, starDescription (short paragraph), radius, radiusUnits (Solar Radii), " +
        "absoluteMagnitude, color, distanceFromEarth, distanceUnits (Light Years), " +
        "coordinates { rightAscension, declination }, exoplanets []."
    },
    { role: "user", content: `Star coordinates: ${starCoords}` }
  ];
}

/** Read a streaming response (SSE) */
async function readElasticStream(resp) {
  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let sseBuffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    sseBuffer += decoder.decode(value, { stream: true });
  }
  return extractTextFromSSE(sseBuffer);
}

export default function Aladin() {
  const aladinRef = useRef(null);

  useEffect(() => {
    const loadAladin = () => {
      const aladin = window.A.aladin("#aladin-lite-div", {
        target: "18 03 57.94 -28 40 55.0",
        projection: "STG",
        survey: "CDS/P/Mellinger/color",
        fullScreen: true,
        realFullscreen: true,
        showSimbadPointerControl: true,
        showReticle: false,
        fov: 140,
      });

      const container = document.getElementById("aladin-lite-div");

      const isOverUi = (el) =>
        !!(
          el.closest?.(".aladin-control, .aladin-control-top, .aladin-control-bottom, .aladin-btn, .aladin-toolbar")
        );

      /** Right-click to query Elastic with the clicked RA/Dec */
      const handleClick = async (e) => {
        e.preventDefault();

        if (isOverUi(e.target)) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const [raDeg, decDeg] = aladin.pix2world(x, y) || [];
        if (typeof raDeg !== "number" || typeof decDeg !== "number") {
          console.warn("Could not resolve sky coordinates for click.");
          return;
        }

        const raSexa = toHMS(raDeg);
        const decSexa = toDMS(decDeg);

        // show loading
        aladin.removeStatusBarMessage("message");
        aladin.addStatusBarMessage({
          id: "loadingMsg",
          duration: 120000, // long enough; we'll remove manually
          type: "loading",
          message: "Querying for: " + raSexa + " " + decSexa
        });
        
        let llmText = "";

        try {
          const prefix = "https://vr-aladin-demo-backend-emd5e0g0agebbcer.canadacentral-01.azurewebsites.net/api/";
          const params = new URLSearchParams({ RA: raSexa, Declination: decSexa });
          const url = `${prefix}namesToDesc?${params.toString()}`;

          const res = await fetch(url);
          llmText = await res.text();

          console.log("namesToDesc:", llmText);

        } catch (err) {
          console.error("namesToDesc fetch failed:", err);
        }

        // Try to parse model's stringified JSON; else show raw text
        let pretty = llmText;
        try {
          const parsed = JSON.parse(llmText);
          pretty = parsed.data.llmResponse || JSON.stringify(parsed);
        } catch {
          // keep as text
        }

        aladin.removeStatusBarMessage("loadingMsg");
        aladin.removeStatusBarMessage("message");

        const formatted = formatMessageWithLineBreaks(pretty, 150);
        aladin.addStatusBarMessage({
          id: "message",
          duration: 20000,
          type: "info",
          message: formatted
        });
      };

      container.addEventListener("contextmenu", handleClick);
      container.addEventListener("touchstart", handleClick);
      aladinRef.current = { aladin, handleClick, container };
    };

    // Load Aladin Lite script once, then init
    const existingScript = document.getElementById("aladin-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "aladin-script";
      script.src = "https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js";
      script.async = true;
      script.onload = () => window.A && window.A.init.then(loadAladin);
      document.body.appendChild(script);
    } else {
      window.A && window.A.init.then(loadAladin);
    }

    return () => {
      if (aladinRef.current?.cleanup) aladinRef.current.cleanup();
    };
  }, []);

  return (
    <div
      id="aladin-lite-div"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    />
  );
}
