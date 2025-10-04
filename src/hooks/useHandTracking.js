import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export const useHandTracking = (session) => {
  const [leftHand, setLeftHand] = useState(null);
  const [rightHand, setRightHand] = useState(null);
  const [gestures, setGestures] = useState({
    left: null,
    right: null
  });
  const frameRef = useRef(null);

  useEffect(() => {
    if (!session) return;

    const onFrame = (time, frame) => {
      frameRef.current = frame;
      
      // Get hand tracking data
      const handData = frame.getHandPoses?.();
      if (handData) {
        // Process left hand
        if (handData.left) {
          setLeftHand(handData.left);
          const leftGesture = detectGesture(handData.left);
          setGestures(prev => ({ ...prev, left: leftGesture }));
        }
        
        // Process right hand
        if (handData.right) {
          setRightHand(handData.right);
          const rightGesture = detectGesture(handData.right);
          setGestures(prev => ({ ...prev, right: rightGesture }));
        }
      }
    };

    session.requestAnimationFrame(onFrame);

    return () => {
      frameRef.current = null;
    };
  }, [session]);

  const detectGesture = (hand) => {
    if (!hand || !hand.joints) return null;

    const joints = hand.joints;
    
    // Simple gesture detection based on finger positions
    const thumbUp = isThumbUp(joints);
    const pointing = isPointing(joints);
    const fist = isFist(joints);
    const openHand = isOpenHand(joints);

    if (thumbUp) return 'thumb-up';
    if (pointing) return 'pointing';
    if (fist) return 'fist';
    if (openHand) return 'open-hand';
    
    return 'unknown';
  };

  const isThumbUp = (joints) => {
    // Simplified thumb up detection
    const thumbTip = joints['thumb-tip'];
    const thumbMCP = joints['thumb-metacarpal'];
    
    if (!thumbTip || !thumbMCP) return false;
    
    return thumbTip.position[1] > thumbMCP.position[1];
  };

  const isPointing = (joints) => {
    // Simplified pointing detection
    const indexTip = joints['index-finger-tip'];
    const indexMCP = joints['index-finger-metacarpal'];
    const middleTip = joints['middle-finger-tip'];
    
    if (!indexTip || !indexMCP || !middleTip) return false;
    
    return indexTip.position[1] > indexMCP.position[1] && 
           middleTip.position[1] < indexTip.position[1];
  };

  const isFist = (joints) => {
    // Simplified fist detection
    const fingerTips = [
      'index-finger-tip',
      'middle-finger-tip', 
      'ring-finger-tip',
      'pinky-tip'
    ];
    
    const fingerMCPs = [
      'index-finger-metacarpal',
      'middle-finger-metacarpal',
      'ring-finger-metacarpal', 
      'pinky-metacarpal'
    ];

    let closedFingers = 0;
    
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = joints[fingerTips[i]];
      const mcp = joints[fingerMCPs[i]];
      
      if (tip && mcp && tip.position[1] < mcp.position[1]) {
        closedFingers++;
      }
    }
    
    return closedFingers >= 3;
  };

  const isOpenHand = (joints) => {
    // Simplified open hand detection
    const fingerTips = [
      'index-finger-tip',
      'middle-finger-tip',
      'ring-finger-tip', 
      'pinky-tip'
    ];
    
    const fingerMCPs = [
      'index-finger-metacarpal',
      'middle-finger-metacarpal',
      'ring-finger-metacarpal',
      'pinky-metacarpal'
    ];

    let openFingers = 0;
    
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = joints[fingerTips[i]];
      const mcp = joints[fingerMCPs[i]];
      
      if (tip && mcp && tip.position[1] > mcp.position[1]) {
        openFingers++;
      }
    }
    
    return openFingers >= 3;
  };

  return {
    leftHand,
    rightHand,
    gestures,
    frame: frameRef.current
  };
};
