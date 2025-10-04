import { useState, useEffect } from 'react';
import { useWebXR } from '../hooks/useWebXR';
import SphericalAladin from './SphericalAladin';

export default function VRAladin() {
  const { 
    isSupported, 
    isSessionActive, 
    session, 
    handTrackingSupported, 
    startSession, 
    endSession 
  } = useWebXR();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Aladin Lite script
    const loadAladin = () => {
      if (window.A) {
        setIsLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js';
      script.async = true;
      script.onload = () => {
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadAladin();
  }, []);

  const handleStartVR = async () => {
    console.log('Attempting to start VR session...');
    try {
      const success = await startSession();
      if (!success) {
        console.error('Failed to start VR session');
        alert('Failed to start VR session. Check the console for details. Make sure you have a VR headset connected or use the WebXR emulator.');
      } else {
        console.log('VR session started successfully');
      }
    } catch (error) {
      console.error('Error starting VR session:', error);
      alert(`Error starting VR session: ${error.message}`);
    }
  };

  const handleEndVR = async () => {
    await endSession();
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading Aladin Lite...
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2>WebXR Not Supported</h2>
        <p>Your browser doesn't support WebXR or VR features.</p>
        <p>Please use Chrome, Edge, or Firefox with WebXR support enabled.</p>
        <p>For testing without a VR headset, install the WebXR Emulator extension.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {!isSessionActive ? (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '30px',
          borderRadius: '10px'
        }}>
          <h2>VR Aladin Demo</h2>
          <p>Hand Tracking: {handTrackingSupported ? 'Supported' : 'Not Supported'}</p>
          <button 
            onClick={handleStartVR}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Enter VR
          </button>
          <div style={{ marginTop: '20px', fontSize: '14px' }}>
            <p><strong>Gesture Controls:</strong></p>
            <p>• Pointing with both hands: Rotate sphere</p>
            <p>• Fist: Zoom in/out</p>
            <p>• Open hand: Reset view</p>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <SphericalAladin session={session} />
          <button 
            onClick={handleEndVR}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              zIndex: 1000
            }}
          >
            Exit VR
          </button>
        </div>
      )}
    </div>
  );
}
