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
const layoutAst = parseFileContent(join(root, "src/components/AppLayout/AppLayout.tsx"));
const appAst = parseFileContent(join(root, "src/components/App/App.tsx"));
const appLayoutCss = read("src/components/AppLayout/AppLayout.css");
const appCss = read("src/components/App/App.css");

test("src/components/AppLayout/AppLayout.tsx exists", () => {
  assert(
    layout !== null,
    "src/components/AppLayout/AppLayout.tsx not found — create it",
  );
});

test("AppLayout.tsx imports Outlet from react-router-dom", () => {
  const el = findQuerySelector(layoutAst, "ImportDeclaration:has([name='Outlet'])")?.[0];
  assert(!!el, "AppLayout.tsx does not import Outlet from react-router-dom");
});

test("AppLayout.tsx renders <Outlet />", () => {
  const el = findQuerySelector(layoutAst, "JSXElement:has([openingElement.name.name='Outlet'])")?.[0];
  assert(!!el, "AppLayout.tsx does not render <Outlet /> — add it where child route content should appear");
});

test("AppLayout.tsx imports AppLayout.css", () => {
  const el = findQuerySelector(layoutAst, "ImportDeclaration[source.value='./AppLayout.css']")?.[0];
  assert(!!el, "AppLayout.tsx does not import AppLayout.css");
});

test("AppLayout.css contains styles moved from App.css", () => {
  const requiredClasses = [".app", ".app__main"];
  const missing = requiredClasses.filter((cls) => !appLayoutCss?.includes(cls));
  assert(
    appLayoutCss !== null && missing.length === 0,
    missing.length > 0
      ? `AppLayout.css is missing styles: ${missing.join(", ")} — move them from App.css`
      : "src/components/AppLayout/AppLayout.css not found",
  );
});

test("App.tsx wraps page routes in a parent Route with AppLayout", () => {
  const routesEl = findQuerySelector(appAst, "JSXElement[openingElement.name.name='Routes']")?.[0];
  const topLevelRoutes =
    routesEl?.children?.filter(
      (child) => child.type === "JSXElement" && child.openingElement?.name?.name === "Route",
    ) ?? [];

  const layoutRoute = topLevelRoutes.find((route) => {
    const elementAttr = route.openingElement?.attributes?.find((a) => a.name?.name === "element");
    const elementJsx = elementAttr?.value?.expression;
    return elementJsx?.type === "JSXElement" && elementJsx.openingElement?.name?.name === "AppLayout";
  });

  const nestedRoutes =
    layoutRoute?.children?.filter(
      (child) => child.type === "JSXElement" && child.openingElement?.name?.name === "Route",
    ) ?? [];

  const hasHomeRoute = nestedRoutes.some(
    (route) =>
      route.openingElement?.attributes?.some((a) => a.name?.name === "index") ||
      route.openingElement?.attributes?.some((a) => a.name?.name === "path" && a.value?.value === "/"),
  );
  const hasFavoritesRoute = nestedRoutes.some((route) =>
    route.openingElement?.attributes?.some((a) => a.name?.name === "path" && a.value?.value === "/favorites"),
  );

  assert(
    !!layoutRoute && hasHomeRoute && hasFavoritesRoute,
    "Inside <Routes>, wrap your home and favorites routes in a parent <Route element={<AppLayout />}>",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnIzLW91dGw=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
