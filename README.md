# A React app that lets you control the UI with hand gestures using your webcam.

- [x] Step 1: Project setup

## Step 1: Project Setup  

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



- [x] Step 3: Add a canvas overlay

## Step 3: Add a Canvas Overlay  

### What was done

Placed a `<canvas>` exactly on top of the webcam `<video>` and drew a test circle and line using the Canvas 2D API.

### Key points

- The parent div uses `position: relative`, and the video and canvas use `position: absolute` to stack.
- Canvas `width` and `height` are set as attributes (not CSS) to avoid stretched drawings.
- `getContext("2d")` gives the drawing tools: `arc()`, `moveTo()`, `lineTo()`, `fill()` and `stroke()`.
- `clearRect()` clears the canvas, and will be used on every frame in the next step.
- Both video and canvas are mirrored with `scaleX(-1)` so the drawings stay aligned with the video.

### Result

The webcam feed shows with a green circle and a red line drawn on top.

- [x] Step 4: Detect the hand and draw 21 landmarks



## Step 4: Detect the Hand  

### What was done

Loaded the MediaPipe Hand Landmarker in the browser and ran it on every webcam frame. The 21 hand landmarks and their connections are drawn live on the canvas overlay.

### Key points

- `FilesetResolver` loads the WebAssembly files, and `HandLandmarker.createFromOptions` loads the model.
- `runningMode: "VIDEO"` is used for continuous frames, with `numHands: 1`.
- `detectForVideo(video, timestamp)` returns 21 landmarks per hand with normalized x, y, z values (0 to 1).
- `DrawingUtils` converts normalized values to pixels and draws the skeleton and dots.
- The detection loop uses `requestAnimationFrame`, and only processes new video frames.
- `useEffect` cleanup cancels the animation frame and closes the model.
- Important landmark indexes: 0 wrist, 4 thumb tip, 8 index tip, 12 middle tip, 16 ring tip, 20 pinky tip.

### Result

A green hand skeleton with red points follows the hand in real time, and a status message shows whether a hand is detected.




- [x] Step 5: Detect gestures (open palm, fist, pinch)

## Step 5: Detect Gestures  

### What was done

Created `src/gestures.js` with a `classifyGesture(landmarks)` function that turns the 21 hand landmarks into a gesture name, and displayed it live in the UI.

### Key points

- Gestures are simple geometry on the landmark points, with no extra AI model.
- A finger is extended if its tip is farther from the wrist than its middle joint (PIP).
- Pinch is detected when the thumb tip (4) and index tip (8) are close together.
- Distances are divided by hand size (wrist to middle knuckle), so detection works at any distance from the camera.
- Coordinates are multiplied by canvas width and height before measuring, because normalized values are not square.
- Pinch is checked first, then the extended fingers are counted: 4 is Open Palm, 0 is Fist, index only is Pointing.

### Result

The app shows the current gesture (Open Palm, Fist, Pinch, Pointing or Unknown) in real time.