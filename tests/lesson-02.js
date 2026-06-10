import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { checkCompiles, checkBuilds, normalize, parseFileContent, findQuerySelector } from "./lib/utils.js";

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
const appAst = parseFileContent(join(root, "src/components/App/App.tsx"));
const homePage = read("src/pages/HomePage.tsx");
const homePageAst = parseFileContent(join(root, "src/pages/HomePage.tsx"));
const favPage = read("src/pages/FavoritesPage.tsx");

test("App.tsx exists", () => {
  assert(app !== null, "src/components/App/App.tsx not found");
});

let localRoutesName = 'Routes';
let localRouteName = 'Route';
test("App.tsx imports Routes and Route from react-router-dom", () => {
  const el = findQuerySelector(appAst, "ImportDeclaration:has([name='Routes'])")?.[0];
  if (el) localRoutesName = el?.specifiers?.[0]?.local?.name;
  const el2 = findQuerySelector(appAst, `ImportDeclaration:has([name='Route'])`)?.[0];
  if (el2) localRouteName = el2?.specifiers?.[0]?.local?.name;
  assert(!!el && !!el2, "App.tsx does not import Routes and Route from react-router-dom");
});

test("src/pages/HomePage.tsx exists", () => {
  assert(homePage !== null, "src/pages/HomePage.tsx not found — create it in the src/pages/ directory");
});

test("src/pages/FavoritesPage.tsx exists", () => {
  assert(favPage !== null, "src/pages/FavoritesPage.tsx not found — create it in the src/pages/ directory");
});

test("App.tsx has a route for the home path", () => {
  const el = findQuerySelector(
    appAst,
    "JSXElement[openingElement.name.name='Routes'] JSXElement[openingElement.name.name='Route']",
  );
  const indexRoute = el?.find(
    (e) =>
      e.openingElement?.attributes?.find((a) => a.name.name === "index") ||
      e.openingElement?.attributes?.find((a) => a.name.name === "path" && a.value?.value === "/"),
  );
  assert(!!indexRoute, 'App.tsx does not have a route for "/" — add a Route with path="/" or the index prop');
});

test("App.tsx has a route for /favorites", () => {
  const el = findQuerySelector(
    appAst,
    "JSXElement[openingElement.name.name='Routes'] JSXElement[openingElement.name.name='Route']",
  );
  const favoritesRoute = el?.find((e) =>
    e.openingElement?.attributes?.find((a) => a.name.name === "path" && a.value?.value === "/favorites"),
  );
  assert(!!favoritesRoute, 'App.tsx does not have a route for "/favorites" — add a Route with path="/favorites"');
});

test("HomePage.tsx manages query state locally", () => {
  const el = findQuerySelector(homePageAst, "ImportDeclaration:has([name='useState'])")?.[0];
  assert(!!el, "HomePage.tsx does not use useState — the search query state should live here");
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnIyLXJvdXQ=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
