# A React app that lets you control the UI with hand gestures using your webcam.

- [x] Step 1: Project setup

## Step 1: Project Setup (Completed)

### What was done

Created a new React project using Vite, installed the MediaPipe hand detection library, and cleaned up the default files.

### Commands

npm create vite@latest hand-gesture-controller -- --template react
cd hand-gesture-controller
npm install
npm run dev
npm install @mediapipe/tasks-vision

### Key points

- Vite is a fast tool for creating and running React projects.
- `@mediapipe/tasks-vision` is installed now and used later in Step 4 for hand detection.
- Replaced `src/App.jsx` with a simple component showing the heading "Hand Gesture Controller".
- Emptied `src/App.css` and `src/index.css` for a clean start.

### Result

Opening `http://localhost:5173` in Chrome shows the heading "Hand Gesture Controller".



- [x] Step 2: Show the webcam feed

## Step 2: Show the Webcam Feed  

### What was done

Accessed the webcam using `navigator.mediaDevices.getUserMedia()` and displayed the live stream in a `<video>` element using `useRef`.

### Key points

- `useRef` gives direct access to the video element to set `srcObject`.
- `autoPlay`, `playsInline` and `muted` are needed so the video starts automatically.
- The video is mirrored with `transform: scaleX(-1)` for a natural mirror feel.
- The `useEffect` cleanup stops all camera tracks when the component unmounts.
- Camera access needs `localhost` or `https`, and the user must allow permission.

### Result

The live webcam feed appears on the page, with an error message if camera access is denied.