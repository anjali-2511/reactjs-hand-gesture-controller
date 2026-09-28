const WIDTH = 640;
const HEIGHT = 480;

// Distance between two landmarks in pixels
function distance(a, b) {
  const dx = (a.x - b.x) * WIDTH;
  const dy = (a.y - b.y) * HEIGHT;
  return Math.hypot(dx, dy);
}

// A finger is extended if its tip is farther from the wrist than its middle joint
function isFingerExtended(landmarks, tipIndex, pipIndex) {
  const wrist = landmarks[0];
  return (
    distance(landmarks[tipIndex], wrist) > distance(landmarks[pipIndex], wrist)
  );
}

export function classifyGesture(landmarks) {
  const wrist = landmarks[0];
  const handSize = distance(wrist, landmarks[9]); // wrist to middle knuckle

  // 1. Pinch: thumb tip close to index tip (checked first)
  const pinchRatio = distance(landmarks[4], landmarks[8]) / handSize;
  if (pinchRatio < 0.3) {
    return "Pinch";
  }

  // 2. Count extended fingers (thumb ignored for simplicity)
  const fingers = [
    isFingerExtended(landmarks, 8, 6), // index
    isFingerExtended(landmarks, 12, 10), // middle
    isFingerExtended(landmarks, 16, 14), // ring
    isFingerExtended(landmarks, 20, 18), // pinky
  ];
  const extendedCount = fingers.filter(Boolean).length;

  if (extendedCount === 4) return "Open Palm";
  if (extendedCount === 0) return "Fist";
  if (fingers[0] && extendedCount === 1) return "Pointing";

  return "Unknown";
}