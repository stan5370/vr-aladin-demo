import { useEffect, useRef } from "react";

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

export default function Aladin() {
  const aladinRef = useRef(null);

  useEffect(() => {
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
        // Bail if you clicked on any Aladin UI control/button
        if (
          e.target.closest(".aladin-control") ||
          e.target.closest(".aladin-control-top") ||
          e.target.closest(".aladin-control-bottom") ||
          e.target.closest(".aladin-btn") ||
          e.target.closest(".aladin-toolbar")
        ) {
          return;
        }

        // Pixel → world coordinates (degrees)
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Some versions nest canvases; use the API conversion if available:
        const [raDeg, decDeg] = aladin.pix2world(x, y) || [];

        if (typeof raDeg !== "number" || typeof decDeg !== "number") {
          console.warn("Could not resolve sky coordinates for click.");
          return;
        }

        const raSexa = toHMS(raDeg);
        const decSexa = toDMS(decDeg);

        console.log("Clicked sky coords:", raSexa, decSexa);

        try {
          const prefix = "https://purple-smoke-070adf60f.1.azurestaticapps.net/api/";
          const params = new URLSearchParams({ RA: raSexa, Declination: decSexa });
          const url = `${prefix}namesToDesc?${params.toString()}`;

          const res = await fetch(url);
          const description = await res.text();
          console.log("namesToDesc:", description);
        } catch (err) {
          console.error("namesToDesc fetch failed:", err);
        }
      };

      container.addEventListener("click", handleClick);
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
