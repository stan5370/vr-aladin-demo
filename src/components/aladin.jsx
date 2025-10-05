import { useEffect, useRef } from "react";
import useWindowDimensions from "./windowDimensions";
import { Html } from '@react-three/drei'

export default function Aladin(props) {
  const aladinRef = useRef(null);
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    const loadAladin = () => {
      // Initialize Aladin Lite
      const catalog = window.A.catalogHiPS("https://hipscat.cds.unistra.fr/HiPSCatService/Simbad", {
        onClick: (source) => {
          console.log("Clicked source:", source);
        },
      });
      const aladin = window.A.aladin(aladinRef.current, props);

      // Add catalog to Aladin
      aladin.addCatalog(catalog);

      return aladin;
    };

    // Load Aladin script dynamically if not already loaded
    const existingScript = document.getElementById("aladin-script");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "aladin-script";
      script.src =
        "https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js";
      script.async = true;

      script.onload = () => {
        if (window.A) {
          window.A.init.then(loadAladin);
        }
      };

      document.body.appendChild(script);
    } else {
      if (window.A) {
        window.A.init.then(loadAladin);
      }
    }
  }, [props]);

  return (
    <Html>
      <div id="aladin-lite-div" style={{ width: width, height: height }} />
    </Html>
  );
}

