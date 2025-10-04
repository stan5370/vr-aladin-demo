import { useEffect, useRef } from 'react';

export default function SphericalAladin({ session }) {
  const aladinRef = useRef(null);
  const aladinInstanceRef = useRef(null);

  useEffect(() => {
    if (!window.A) return;

    // Initialize Aladin Lite
    if (!aladinInstanceRef.current) {
      aladinInstanceRef.current = window.A.aladin('#aladin-container', {
        survey: 'P/DSS2/color',
        fov: 60,
        target: '00:00:00 +00:00:00',
        showFullscreenControl: false,
        showGotoControl: false,
        showZoomControl: false,
        showFrame: false,
      });
    }

    const aladin = aladinInstanceRef.current;

    if (!session) return;

    let xrRefSpace = null;

    const onXRFrame = (time, frame) => {
      const pose = frame.getViewerPose(xrRefSpace);
      if (pose) {
        const orientation = pose.transform.orientation; // quaternion
        const { yaw, pitch } = quaternionToYawPitch(orientation);

        // Map head rotation to RA/Dec
        const ra = (yawToRA(yaw) + 360) % 360;
        const dec = pitchToDec(pitch);

        aladin.gotoRaDec(ra, dec);
      }
      session.requestAnimationFrame(onXRFrame);
    };

    const startTracking = async () => {
      xrRefSpace = await session.requestReferenceSpace('local');
      session.requestAnimationFrame(onXRFrame);
    };

    startTracking();

    return () => {
      // Cleanup
      if (session) session.end();
    };
  }, [session]);

  return (
    <div
      ref={aladinRef}
      id="aladin-container"
      style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}
    />
  );
}

// --- Helper functions ---

function quaternionToYawPitch(q) {
  const { x, y, z, w } = q;
  const siny_cosp = 2 * (w * y + z * x);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);

  const sinp = 2 * (w * x - y * z);
  const pitch = Math.asin(Math.max(-1, Math.min(1, sinp)));

  return { yaw, pitch };
}

function yawToRA(yaw) {
  // Convert radians to degrees, flip direction
  return (-yaw * 180) / Math.PI;
}

function pitchToDec(pitch) {
  return (pitch * 180) / Math.PI;
}
