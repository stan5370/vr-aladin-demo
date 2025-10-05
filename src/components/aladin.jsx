import { useEffect, useRef, useState } from "react";

export default function Aladin(props) {
  const aladinRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Wait for ref to be ready
    if (aladinRef.current) {
      setIsReady(true);
    }
  }, []);
  
  useEffect(() => {
    if (!isReady) return;
    
    const loadAladin = () => {
      if (!aladinRef.current) {
        console.error("Aladin ref is still null");
        return;
      }
      
      const catalog = window.A.catalogHiPS("https://hipscat.cds.unistra.fr/HiPSCatService/Simbad", {
        onClick: (source) => {
          console.log("Clicked source:", source);
        },
      });
      
      const config = {
        ...props,
        showFullscreenControl: false,
        fullScreen: false
      };
      
      const aladin = window.A.aladin(aladinRef.current, config);
      aladin.addCatalog(catalog);
      return aladin;
    };
    
    const existingScript = document.getElementById("aladin-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "aladin-script";
      script.src = "https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js";
      script.async = true;
      script.onload = () => {
        if (window.A) {
          window.A.init.then(loadAladin);
        }
      };
      document.body.appendChild(script);
    } else {
      if (window.A && window.A.init) {
        window.A.init.then(loadAladin);
      }
    }
  }, [isReady, props]);
  
  return (
    <div 
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '100%',
        zIndex: isFullscreen ? 9999 : 'auto',
        background: '#000'
      }}
    >
      <div 
        ref={aladinRef} 
        id="aladin-lite-div" 
        style={{ width: '100%', height: '100%' }} 
      />
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px 16px',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          border: '2px solid #fff',
          borderRadius: '6px',
          cursor: 'pointer',
          zIndex: 1,
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {isFullscreen ? '✕' : '⛶'}
      </button>
    </div>
  );
}
