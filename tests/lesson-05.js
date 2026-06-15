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
  return pathAttr?.value?.value ?? pathAttr?.value?.expression?.value ?? "";
}

console.log("\nLesson 05: Dynamic Routes with useParams\n");

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

const appAst = parseFileContent(join(root, "src/components/App/App.tsx"));
const recipePagePath = "src/pages/RecipePage.tsx";
const recipePage = read(recipePagePath);
const recipePageAst = parseFileContent(join(root, "src/pages/RecipePage.tsx"));

test("src/pages/RecipePage.tsx exists", () => {
  assert(recipePage !== null, "src/pages/RecipePage.tsx not found — create it in src/pages/");
});

test("App.tsx has a dynamic route with an :id segment", () => {
  const routes = findQuerySelector(appAst, "JSXElement[openingElement.name.name='Route']");
  const dynamicRoute = routes?.find((el) => {
    const pathAttr = el.openingElement?.attributes?.find((a) => a.name?.name === "path");
    const pathValue = pathAttr?.value?.value ?? pathAttr?.value?.expression?.value ?? "";
    return pathValue.includes(":id") || pathValue.includes(":recipeId");
  });
  assert(!!dynamicRoute, 'App.tsx does not have a dynamic route segment — add a Route with path="recipes/:id"');
});

test("App.tsx renders RecipePage on the dynamic route", () => {
  const importEl = findQuerySelector(appAst, "ImportDeclaration:has([name='RecipePage'])")?.[0];
  const rendersRecipePage =
    findQuerySelector(appAst, "JSXElement[openingElement.name.name='RecipePage']").length > 0;
  assert(!!importEl && rendersRecipePage, "App.tsx does not import or render RecipePage");
});

test("App.tsx places the recipe route inside AppLayout", () => {
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

  const recipeRouteInLayout = nestedRoutes.find((route) => {
    const pathValue = getRoutePath(route);
    const rendersRecipePage =
      findQuerySelector(route, "JSXElement[openingElement.name.name='RecipePage']").length > 0;
    return (pathValue.includes(":id") || pathValue.includes(":recipeId")) && rendersRecipePage;
  });

  assert(
    !!recipeRouteInLayout,
    "App.tsx recipe route must be nested inside <Route element={<AppLayout />}> — move it inside the layout route",
  );
});

test("RecipePage.tsx imports useParams from react-router-dom", () => {
  const el = findQuerySelector(recipePageAst, "ImportDeclaration:has([name='useParams'])")?.[0];
  assert(!!el, "RecipePage.tsx does not import useParams from react-router-dom");
});

test("RecipePage.tsx calls useParams()", () => {
  const el = findQuerySelector(recipePageAst, "CallExpression[callee.name='useParams']")?.[0];
  assert(!!el, "RecipePage.tsx does not call useParams() — destructure the id from it");
});

test("RecipePage.tsx handles the case where no recipe matches", () => {
  const stringLiterals = findQuerySelector(recipePageAst, "StringLiteral");
  const hasNotFoundText = stringLiterals?.some(
    (n) => n.value?.toLowerCase().includes("not found") || n.value?.includes("Recipe not"),
  );
  const hasNotRecipeCheck =
    findQuerySelector(recipePageAst, "UnaryExpression[operator='!']:has(Identifier[name='recipe'])").length > 0;
  assert(
    hasNotFoundText || hasNotRecipeCheck,
    "RecipePage.tsx does not handle the case where the recipe id doesn't match any recipe",
  );
});

test("RecipePage.tsx renders recipe data when a recipe is found", () => {
  const recipeProperties = ["category", "title", "description", "content"];
  const memberAccesses = [
    ...findQuerySelector(recipePageAst, "JSXExpressionContainer MemberExpression[object.name='recipe']"),
    ...findQuerySelector(recipePageAst, "JSXAttribute MemberExpression[object.name='recipe']"),
  ];
  const renderedProperties = new Set(
    memberAccesses
      ?.map((node) => node.property?.name)
      .filter((name) => recipeProperties.includes(name)) ?? [],
  );
  const missingProperties = recipeProperties.filter((prop) => !renderedProperties.has(prop));
  assert(
    missingProperties.length === 0,
    `RecipePage.tsx does not render all recipe properties — missing: ${missingProperties.join(", ")}`,
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI1LXBhcm0=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
