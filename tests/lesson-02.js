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

console.log("\nLesson 02: Defining Routes\n");

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

const app = read("src/components/App/App.tsx");
const homePage = read("src/pages/HomePage.tsx");
const favPage = read("src/pages/FavoritesPage.tsx");

test("App.tsx exists", () => {
  assert(app !== null, "src/components/App/App.tsx not found");
});

test("App.tsx imports Routes and Route from react-router-dom", () => {
  assert(
    app && app.includes("Routes") && app.includes("Route"),
    "App.tsx does not import Routes and Route from react-router-dom",
  );
});

test("src/pages/HomePage.tsx exists", () => {
  assert(
    homePage !== null,
    "src/pages/HomePage.tsx not found — create it in the src/pages/ directory",
  );
});

test("src/pages/FavoritesPage.tsx exists", () => {
  assert(
    favPage !== null,
    "src/pages/FavoritesPage.tsx not found — create it in the src/pages/ directory",
  );
});

test("App.tsx has a route for the home path", () => {
  assert(
    app && (/path\s*=\s*["']\/["']/.test(app) || app.includes("index")),
    'App.tsx does not have a route for "/" — add a Route with path="/" or the index prop',
  );
});

test("App.tsx has a route for /favorites", () => {
  assert(
    app && (app.includes('"/favorites"') || app.includes("'/favorites'")),
    'App.tsx does not have a route for "favorites" — add a Route with path="favorites"',
  );
});

test("HomePage.tsx manages query state locally", () => {
  assert(
    homePage && homePage.includes("useState"),
    "HomePage.tsx does not use useState — the search query state should live here",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnIyLXJvdXQ=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
