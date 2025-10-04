import { useState, useEffect, useRef } from 'react';

export const useWebXR = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [session, setSession] = useState(null);
  const [handTrackingSupported, setHandTrackingSupported] = useState(false);
  const sessionRef = useRef(null);

  useEffect(() => {
    // Check WebXR support
    console.log('Checking WebXR support...');
    console.log('navigator.xr available:', !!navigator.xr);
    
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        console.log('WebXR immersive-vr supported:', supported);
        setIsSupported(supported);
        
        // Check hand tracking support
        if (supported) {
          navigator.xr.isSessionSupported('immersive-vr', {
            requiredFeatures: ['hand-tracking']
          }).then((handSupported) => {
            console.log('Hand tracking supported:', handSupported);
            setHandTrackingSupported(handSupported);
          }).catch((error) => {
            console.log('Hand tracking check failed:', error);
            setHandTrackingSupported(false);
          });
        }
      }).catch((error) => {
        console.error('WebXR support check failed:', error);
        setIsSupported(false);
      });
    } else {
      console.log('WebXR not available in this browser');
      setIsSupported(false);
    }
  }, []);

  const startSession = async () => {
    if (!isSupported || !navigator.xr) {
      console.error('WebXR not supported');
      return false;
    }

    try {
      const sessionInit = {
        requiredFeatures: handTrackingSupported ? ['hand-tracking'] : [],
        optionalFeatures: ['hand-tracking']
      };

      const newSession = await navigator.xr.requestSession('immersive-vr', sessionInit);
      sessionRef.current = newSession;
      setSession(newSession);
      setIsSessionActive(true);

      newSession.addEventListener('end', () => {
        setIsSessionActive(false);
        setSession(null);
        sessionRef.current = null;
      });

      return true;
    } catch (error) {
      console.error('Failed to start WebXR session:', error);
      return false;
    }
  };

  const endSession = async () => {
    if (sessionRef.current) {
      await sessionRef.current.end();
    }
  };

  return {
    isSupported,
    isSessionActive,
    session,
    handTrackingSupported,
    startSession,
    endSession
  };
};
