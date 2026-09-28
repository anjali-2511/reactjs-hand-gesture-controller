import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { classifyGesture } from "./gestures";

const WIDTH = 640;
const HEIGHT = 480;
const STABLE_FRAMES = 5; // frames a gesture must last to count
const COOLDOWN_MS = 800; // minimum time between slide changes

const SLIDES = [
  { title: "Slide 1: Welcome", color: "#4f46e5" },
  { title: "Slide 2: Hand Tracking", color: "#059669" },
  { title: "Slide 3: Gestures", color: "#d97706" },
  { title: "Slide 4: The End", color: "#dc2626" },
];

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Refs for stabilizing gestures (change every frame, no re-render needed)
  const candidateRef = useRef("None");
  const countRef = useRef(0);
  const stableRef = useRef("None");
  const lastActionRef = useRef(0);

  const [error, setError] = useState("");
  const [status, setStatus] = useState("Loading hand model...");
  const [gesture, setGesture] = useState("None");
  const [slide, setSlide] = useState(0);
  const [pointer, setPointer] = useState(null);

  // Camera (from Step 2)
  useEffect(() => {
    let stream;
    let cancelled = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: WIDTH, height: HEIGHT },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Could not access the camera. Please allow camera permission.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Hand detection loop (Steps 4, 5 and 6)
  useEffect(() => {
    let handLandmarker;
    let animationId;
    let cancelled = false;
    let lastVideoTime = -1;

    const ctx = canvasRef.current.getContext("2d");
    const drawingUtils = new DrawingUtils(ctx);

    // Runs only when the stable gesture changes
    function handleGestureChange(g) {
      const now = performance.now();
      if (now - lastActionRef.current < COOLDOWN_MS) return;

      if (g === "Pinch") {
        setSlide((s) => Math.min(s + 1, SLIDES.length - 1));
        lastActionRef.current = now;
      } else if (g === "Fist") {
        setSlide((s) => Math.max(s - 1, 0));
        lastActionRef.current = now;
      }
    }

    function detect() {
      const video = videoRef.current;

      if (video && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const result = handLandmarker.detectForVideo(video, performance.now());

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        let rawGesture = "None";

        if (result.landmarks.length > 0) {
          setStatus("Hand detected");
          const landmarks = result.landmarks[0];

          drawingUtils.drawConnectors(
            landmarks,
            HandLandmarker.HAND_CONNECTIONS,
            { color: "#00ff88", lineWidth: 3 }
          );
          drawingUtils.drawLandmarks(landmarks, { color: "#ff3b3b", radius: 4 });

          rawGesture = classifyGesture(landmarks);

          // Pointer follows the index fingertip (mirrored x)
          if (rawGesture === "Pointing") {
            setPointer({
              x: (1 - landmarks[8].x) * WIDTH,
              y: landmarks[8].y * HEIGHT,
            });
          } else {
            setPointer(null);
          }
        } else {
          setStatus("No hand detected");
          setPointer(null);
        }

        // Stabilize: count how many frames in a row the gesture is the same
        if (rawGesture === candidateRef.current) {
          countRef.current += 1;
        } else {
          candidateRef.current = rawGesture;
          countRef.current = 1;
        }

        if (
          countRef.current >= STABLE_FRAMES &&
          stableRef.current !== rawGesture
        ) {
          stableRef.current = rawGesture;
          setGesture(rawGesture);
          handleGestureChange(rawGesture);
        }
      }

      animationId = requestAnimationFrame(detect);
    }

    async function setup() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (cancelled) {
          handLandmarker.close();
          return;
        }

        setStatus("Model ready. Show your hand!");
        detect();
      } catch (err) {
        console.error(err);
        setError("Could not load the hand detection model.");
      }
    }

    setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationId);
      if (handLandmarker) {
        handLandmarker.close();
      }
    };
  }, []);

  const mirror = { transform: "scaleX(-1)" };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Hand Gesture Controller</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>{status}</p>
      <h2>Gesture: {gesture}</h2>

      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: HEIGHT,
          margin: "0 auto",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={WIDTH}
          height={HEIGHT}
          style={{
            ...mirror,
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: "12px",
            background: "#000",
          }}
        />
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{ ...mirror, position: "absolute", top: 0, left: 0 }}
        />

        {/* Blue dot that follows the index finger when Pointing */}
        {pointer && (
          <div
            style={{
              position: "absolute",
              left: pointer.x - 12,
              top: pointer.y - 12,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "dodgerblue",
              border: "3px solid white",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Slideshow controlled by gestures */}
      <div
        style={{
          width: WIDTH,
          margin: "20px auto",
          padding: "40px 0",
          borderRadius: "12px",
          background: SLIDES[slide].color,
          color: "white",
        }}
      >
        <h2 style={{ margin: 0 }}>{SLIDES[slide].title}</h2>
        <p style={{ margin: "8px 0 0" }}>
          {slide + 1} / {SLIDES.length} | Pinch: next | Fist: previous
        </p>
      </div>
    </div>
  );
}

export default App;