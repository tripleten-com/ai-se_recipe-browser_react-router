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

console.log("\nLesson 01: Client-Side Routing\n");

const compiled = checkCompiles(root);
if (!compiled.ok) {
  console.log("❌ TypeScript compilation failed — fix all type errors before running tests\n");
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

const pkg = read("package.json");
const main = read("src/main.tsx");

test("package.json exists", () => {
  assert(pkg !== null, "package.json not found");
});

test("react-router-dom is listed as a dependency", () => {
  assert(
    pkg && pkg.includes("react-router-dom"),
    "react-router-dom not found in package.json — did you run npm install react-router-dom@6?"
  );
});

test("main.tsx imports BrowserRouter from react-router-dom", () => {
  assert(
    main && main.includes("BrowserRouter"),
    "main.tsx does not import BrowserRouter from react-router-dom"
  );
});

test("main.tsx wraps the app with BrowserRouter", () => {
  assert(
    main && /<BrowserRouter\s*>/.test(main),
    "main.tsx does not render <BrowserRouter> — wrap <App /> with it"
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnIxLXdyYXA=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
