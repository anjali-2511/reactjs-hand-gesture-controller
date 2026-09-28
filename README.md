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
