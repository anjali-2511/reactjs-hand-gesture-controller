import { useEffect, useRef, useState } from "react";
import { classifyGesture } from "./gestures";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const WIDTH = 640;
const HEIGHT = 480;

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Loading hand model...");
  const [gesture, setGesture] = useState("None");

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

  // Hand detection loop
  useEffect(() => {
    let handLandmarker;
    let animationId;
    let cancelled = false;
    let lastVideoTime = -1;

    const ctx = canvasRef.current.getContext("2d");
    const drawingUtils = new DrawingUtils(ctx);

    function detect() {
      const video = videoRef.current;

      // Only process when the video has data and has a new frame
      if (video && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const result = handLandmarker.detectForVideo(video, performance.now());

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        if (result.landmarks.length > 0) {
          setStatus("Hand detected");
          for (const landmarks of result.landmarks) {
            drawingUtils.drawConnectors(
              landmarks,
              HandLandmarker.HAND_CONNECTIONS,
              { color: "#00ff88", lineWidth: 3 }
            );
            drawingUtils.drawLandmarks(landmarks, {
              color: "#ff3b3b",
              radius: 4,
            });
          }
          setGesture(classifyGesture(result.landmarks[0]));
        } else {
          setStatus("No hand detected");
          setGesture("None");
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
          style={{
            ...mirror,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>
    </div>
  );
}

export default App;