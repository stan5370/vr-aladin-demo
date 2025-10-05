import { useEffect, useRef } from "react";

// const CLICK_MOVE_TOLERANCE_PX = 6;   // how much movement counts as a drag
// const CLICK_TIME_TOLERANCE_MS = 600; // optional guard against long drags/holds

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
  const words = text.split(" ");
  let line = "";
  const lines = [];

  words.forEach(word => {
    // If adding the next word exceeds maxChars, push the line and start a new one
    if ((line + word).length > maxChars) {
      lines.push(line.trim());
      line = "";
    }
    line += word + " ";
  });

  if (line) lines.push(line.trim()); // push the last line

  return lines.join("<br>");
}

export default function Aladin() {
  const aladinRef = useRef(null);

  useEffect(() => {
    // Wait for ref to be ready
    if (aladinRef.current) {
      setIsReady(true);
    }
  }, []);
  
  useEffect(() => {
    if (!isReady) return;
    
    const loadAladin = () => {
      // Create Aladin
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

      // OPTIONAL: keep your catalog if you still want markers (but we won't use its onClick)
    //   const catalog = window.A.catalogHiPS("https://hipscat.cds.unistra.fr/HiPSCatService/Simbad", {});
    //   aladin.addCatalog(catalog);

      // Click anywhere on the sky view (but ignore UI controls) → get RA/Dec
      const container = document.getElementById("aladin-lite-div");

const handleClick = async (e) => {
  // Ignore UI controls
  if (
    e.target.closest(".aladin-control") ||
    e.target.closest(".aladin-control-top") ||
    e.target.closest(".aladin-control-bottom") ||
    e.target.closest(".aladin-btn") ||
    e.target.closest(".aladin-toolbar")
  ) {
    return;
  }

    // Pixel → world coordinates
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const [raDeg, decDeg] = aladin.pix2world(x, y) || [];
    if (typeof raDeg !== "number" || typeof decDeg !== "number") return;

    const raSexa = toHMS(raDeg);
    const decSexa = toDMS(decDeg);

    // Center / zoom Aladin to the clicked coordinates
    aladin.gotoRaDec(raDeg, decDeg, aladin.getFov()); // keeps current FOV
    // Or use aladin.gotoRaDec(raDeg, decDeg, 10) to zoom in to FOV=10 deg

    // Add a loading message
    aladin.addStatusBarMessage({
      id: "loadingMsg",
      duration: 10000,
      type: "loading",
      message: `Clicked: ${raSexa} ${decSexa}`
    });

    try {
      const prefix = "https://localhost:7071/api/";
      const params = new URLSearchParams({ RA: raSexa, Declination: decSexa });
      const url = `${prefix}namesToDesc?${params.toString()}`;

      const res = await fetch(url);
      const description = await res.text();

      // Format message nicely
      const formatted = formatMessageWithLineBreaks(description, 100);

      // Remove loading message but **keep previous info messages if needed**
      aladin.removeStatusBarMessage("loadingMsg");

      aladin.addStatusBarMessage({
	id: "message",
	duration: 10000,
	type: "info",
	message: formatted
      });

    } catch (err) {
      console.error("namesToDesc fetch failed:", err);
    }
  };

      container.addEventListener("contextmenu", handleClick);
      aladinRef.current = { aladin, handleClick, container };
    };

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

    // Cleanup listener on unmount/re-mount
    return () => {
      if (aladinRef.current?.container && aladinRef.current?.handleClick) {
        aladinRef.current.container.removeEventListener("click", aladinRef.current.handleClick);
      }
    };
  }, []);

  // Let Aladin handle sizing (fullScreen:true), but make the div fill the viewport
  return (
    <div
      id="aladin-lite-div"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    />
  );
}
