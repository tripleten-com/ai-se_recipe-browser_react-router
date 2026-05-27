import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { checkCompiles, checkBuilds, normalize } from "./lib/utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function read(relPath) {
  try {
    return normalize(readFileSync(join(root, relPath), "utf8"));
  } catch {
    return null;
  }
}

let pass = 0;
let fail = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch (err) {
    console.log(`❌ ${label} — ${err.message}`);
    fail++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log("\nLesson 03: Shared Layout with Outlet\n");

const compiled = checkCompiles(root);
if (!compiled.ok) {
  console.log(
    "❌ TypeScript compilation failed — fix all type errors before running tests\n",
  );
  console.log(compiled.output);
  process.exit(1);
}
console.log("✅ Project compiles without type errors");

const built = checkBuilds(root);
if (!built.ok) {
  console.log("❌ Vite build failed — the app does not run without errors\n");
  console.log(built.output);
  process.exit(1);
}
console.log("✅ App builds and runs without errors\n");

const layout = read("src/components/AppLayout/AppLayout.tsx");
const app = read("src/components/App/App.tsx");

test("src/components/AppLayout/AppLayout.tsx exists", () => {
  assert(
    layout !== null,
    "src/components/AppLayout/AppLayout.tsx not found — create it",
  );
});

test("AppLayout.tsx imports Outlet from react-router-dom", () => {
  assert(
    layout && layout.includes("Outlet"),
    "AppLayout.tsx does not import Outlet from react-router-dom",
  );
});

test("AppLayout.tsx renders <Outlet />", () => {
  assert(
    layout && layout.includes("<Outlet"),
    "AppLayout.tsx does not render <Outlet /> — add it where child route content should appear",
  );
});

test("App.tsx uses AppLayout as a layout route", () => {
  assert(
    app && app.includes("AppLayout"),
    "App.tsx does not use AppLayout — wrap your routes with <Route element={<AppLayout />}>",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnIzLW91dGw=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
