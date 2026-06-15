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

function getRoutePath(routeEl) {
  const pathAttr = routeEl.openingElement?.attributes?.find((a) => a.name?.name === "path");
  return pathAttr?.value?.value ?? pathAttr?.value?.expression?.value;
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
const appAst = parseFileContent(join(root, "src/components/App/App.tsx"));
const notFoundPath = "src/pages/NotFoundPage.tsx";
const notFound = read(notFoundPath);
const notFoundAst = parseFileContent(join(root, notFoundPath));

test("src/pages/NotFoundPage.tsx exists", () => {
  assert(notFound !== null, "src/pages/NotFoundPage.tsx not found — create it in src/pages/");
});

test("NotFoundPage.tsx imports Link from react-router-dom", () => {
  const el = findQuerySelector(notFoundAst, "ImportDeclaration:has([name='Link'])")?.[0];
  assert(!!el, "NotFoundPage.tsx does not import or use Link from react-router-dom — add a Link back to /");
});

test('NotFoundPage.tsx links back to /', () => {
  const links = findQuerySelector(notFoundAst, "JSXElement[openingElement.name.name='Link']");
  const homeLink = links?.find((el) =>
    el.openingElement?.attributes?.some(
      (a) => a.name?.name === "to" && (a.value?.value === "/" || a.value?.expression?.value === "/"),
    ),
  );
  assert(!!homeLink, 'NotFoundPage.tsx does not contain a Link back to "/" — add one so users can recover');
});

test('App.tsx has a wildcard route with path="*"', () => {
  const routes = findQuerySelector(appAst, "JSXElement[openingElement.name.name='Route']");
  const wildcardRoute = routes?.find((el) => {
    const pathAttr = el.openingElement?.attributes?.find((a) => a.name?.name === "path");
    return pathAttr?.value?.value === "*" || pathAttr?.value?.expression?.value === "*";
  });
  assert(!!wildcardRoute, 'App.tsx does not have a wildcard route — add <Route path="*" element={<NotFoundPage />} />');
});

test("App.tsx renders NotFoundPage on the wildcard route", () => {
  const importEl = findQuerySelector(appAst, "ImportDeclaration:has([name='NotFoundPage'])")?.[0];
  const rendersNotFound =
    findQuerySelector(appAst, "JSXElement[openingElement.name.name='NotFoundPage']").length > 0;
  assert(!!importEl && rendersNotFound, "App.tsx does not import or render NotFoundPage on the wildcard route");
});

test("App.tsx places the wildcard route last inside AppLayout", () => {
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

  const wildcardRoute = nestedRoutes.find((route) => getRoutePath(route) === "*");
  const rendersNotFound =
    wildcardRoute &&
    findQuerySelector(wildcardRoute, "JSXElement[openingElement.name.name='NotFoundPage']").length > 0;

  assert(
    !!wildcardRoute && rendersNotFound && getRoutePath(nestedRoutes.at(-1)) === "*",
    'App.tsx wildcard route must be the last nested <Route> inside <Route element={<AppLayout />}> — move <Route path="*" element={<NotFoundPage />} /> to the end of the layout routes',
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI3LW5mbmQ=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
