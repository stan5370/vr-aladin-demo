import { useEffect, useRef } from "react";
import useWindowDimensions from "./windowDimensions";

export default function Aladin(props) {
  const aladinRef = useRef(null);
  const { height, width } = useWindowDimensions();

  useEffect(() => {
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
          window.A.init.then(() => {
            window.A.aladin(aladinRef.current, props);
          });
        }
      };

      document.body.appendChild(script);
    } else {
      // If already loaded, just init
      if (window.A) {
        window.A.init.then(() => {
          window.A.aladin(aladinRef.current, props);
        });
      }
    }
  }, [props]);

  return (
    <div
      ref={aladinRef}
      style={{ width: width, height: height }}
      id="aladin-lite-div"
    />
  );
}

