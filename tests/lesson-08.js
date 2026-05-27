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

console.log("\nLesson 08: Not Found Routes\n");

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

const app = read("src/components/App/App.tsx");
const notFound = read("src/pages/NotFoundPage.tsx");

test("src/pages/NotFoundPage.tsx exists", () => {
  assert(notFound !== null, "src/pages/NotFoundPage.tsx not found — create it in src/pages/");
});

test("NotFoundPage.tsx imports Link from react-router-dom", () => {
  assert(
    notFound && notFound.includes("Link"),
    "NotFoundPage.tsx does not import or use Link from react-router-dom — add a Link back to /"
  );
});

test("NotFoundPage.tsx links back to /", () => {
  assert(
    notFound && /to\s*=\s*["']\/["']/.test(notFound),
    'NotFoundPage.tsx does not contain a Link back to "/" — add one so users can recover'
  );
});

test('App.tsx has a wildcard route with path="*"', () => {
  assert(
    app && /path\s*=\s*["']\*["']/.test(app),
    'App.tsx does not have a wildcard route — add <Route path="*" element={<NotFoundPage />} />'
  );
});

test("App.tsx renders NotFoundPage on the wildcard route", () => {
  assert(
    app && app.includes("NotFoundPage"),
    "App.tsx does not import or render NotFoundPage on the wildcard route"
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI3LW5mbmQ=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
