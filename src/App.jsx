import { useEffect, useRef, useState } from "react";

const WIDTH = 640;
const HEIGHT = 480;

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");

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

  // Test drawing on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Green circle in the center
    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "lime";
    ctx.fill();

    // Red line across the screen
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT / 2);
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, []);

  const mirror = { transform: "scaleX(-1)" };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Hand Gesture Controller</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

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