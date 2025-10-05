import { useEffect, useRef } from "react";

export default function Aladin() {
    const aladinRef = useRef();
    const height = window.height;
    const width = window.height;

    useEffect(() => {
        const loadAladin = () => {
            // Initialize catalog
            const catalog = window.A.catalogHiPS("https://hipscat.cds.unistra.fr/HiPSCatService/Simbad", {
                onClick: (source) => {
                    console.log("Clicked source:", source);
                },
            });

            // Create aladin
            const aladin = window.A.aladin('#aladin-lite-div', {
                target: "18 03 57.94 -28 40 55.0",
                projection: "STG",
                survey: "CDS/P/Mellinger/color",
                fullScreen: true,
                showSimbadPointerControl: true,
                showReticle: false,
                fov: 90,
            });
            aladin.addCatalog(catalog);
            aladinRef.current = aladin;
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
    }, []);

    return (
        <div ref={aladinRef} id="aladin-lite-div" style={{ width: width, height: height }} />
    );
}

