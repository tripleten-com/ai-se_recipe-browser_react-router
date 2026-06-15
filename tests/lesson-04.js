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

console.log("\nLesson 04: Navigation with NavLink\n");

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

const header = read("src/components/Header/Header.tsx");
const headerAst = parseFileContent(join(root, "src/components/Header/Header.tsx"));

test("Header.tsx exists", () => {
  assert(header !== null, "src/components/Header/Header.tsx not found");
});

test("Header.tsx imports NavLink from react-router-dom", () => {
  const el = findQuerySelector(headerAst, "ImportDeclaration:has([name='NavLink'])")?.[0];
  assert(!!el, "Header.tsx does not import NavLink from react-router-dom");
});

test("Header.tsx renders NavLink elements", () => {
  const els = findQuerySelector(headerAst, "JSXElement[openingElement.name.name='NavLink']");
  assert(els?.length > 0, "Header.tsx does not render any <NavLink> elements");
});

test('Header.tsx includes a link to / with the label "Recipes"', () => {
  const els = findQuerySelector(headerAst, "JSXElement[openingElement.name.name='NavLink']");
  const recipesLink = els?.find((el) => {
    const hasHomePath = el.openingElement?.attributes?.some(
      (a) =>
        a.name?.name === "to" &&
        (a.value?.value === "/" || a.value?.expression?.value === "/"),
    );
    const hasRecipesLabel = el.children?.some(
      (child) => child.type === "JSXText" && child.value.trim() === "Recipes",
    );
    return hasHomePath && hasRecipesLabel;
  });
  assert(!!recipesLink, 'Header.tsx does not have a NavLink to "/" labeled "Recipes" — add one to the nav');
});

test("Header.tsx includes a link to /favorites", () => {
  const els = findQuerySelector(headerAst, "JSXElement[openingElement.name.name='NavLink']");
  const favoritesLink = els?.find((el) =>
    el.openingElement?.attributes?.some(
      (a) =>
        a.name?.name === "to" &&
        (a.value?.value === "/favorites" || a.value?.expression?.value === "/favorites"),
    ),
  );
  assert(!!favoritesLink, 'Header.tsx does not have a NavLink to "/favorites" — add one to the nav');
});

test("Header.tsx uses a named className function for active styling", () => {
  const namedFn =
    findQuerySelector(headerAst, "FunctionDeclaration:has(Identifier[name='isActive'])")?.[0] ||
    findQuerySelector(headerAst, "VariableDeclarator[id.name]:has(Identifier[name='isActive'])")?.[0];
  const navLinks = findQuerySelector(headerAst, "JSXElement[openingElement.name.name='NavLink']");
  const usesClassNameFn = navLinks?.every((el) => {
    const classNameAttr = el.openingElement?.attributes?.find((a) => a.name?.name === "className");
    const expr = classNameAttr?.value?.expression;
    return expr?.type === "Identifier" || expr?.type === "MemberExpression";
  });
  assert(
    !!namedFn && usesClassNameFn,
    "Header.tsx does not use a className function with isActive — define a named function and pass it to each NavLink",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI0LW5hdmw=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
