import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;
    let cancelled = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });

        // If the component unmounted while waiting, stop right away
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

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Hand Gesture Controller</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
        style={{ transform: "scaleX(-1)", borderRadius: "12px", background: "#000" }}
      />
    </div>
  );
}

export default App;