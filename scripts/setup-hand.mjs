// Copies MediaPipe WASM files and downloads the hand-tracking model into /public
// so camera mode works offline and without third-party CDNs.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const wasmSrc = "node_modules/@mediapipe/tasks-vision/wasm";
const modelPath = "public/models/hand_landmarker.task";
const modelUrl =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

try {
  if (existsSync(wasmSrc)) {
    mkdirSync("public/wasm", { recursive: true });
    cpSync(wasmSrc, "public/wasm", { recursive: true });
    console.log("✓ MediaPipe wasm copied to public/wasm");
  } else {
    console.log("• @mediapipe/tasks-vision not installed yet; skipping wasm copy");
  }
} catch (e) {
  console.warn("⚠ wasm copy failed:", e.message);
}

if (!existsSync(modelPath)) {
  try {
    const r = await fetch(modelUrl);
    if (!r.ok) throw new Error("HTTP " + r.status);
    mkdirSync("public/models", { recursive: true });
    await writeFile(modelPath, Buffer.from(await r.arrayBuffer()));
    console.log("✓ Hand model downloaded to " + modelPath);
  } catch (e) {
    console.warn("⚠ Could not download the hand model (" + e.message + ").");
    console.warn("  Download it manually from:\n  " + modelUrl + "\n  and save it as " + modelPath);
  }
}
