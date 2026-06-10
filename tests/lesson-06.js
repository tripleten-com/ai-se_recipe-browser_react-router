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

console.log("\nLesson 06: Rendering Markdown\n");

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
const recipePagePath = "src/pages/RecipePage.tsx";
const recipePageAst = parseFileContent(join(root, recipePagePath));

test("react-markdown is listed as a dependency", () => {
  assert(
    pkg && pkg.includes("react-markdown"),
    "react-markdown not found in package.json — did you run npm install react-markdown?",
  );
});

test("RecipePage.tsx imports ReactMarkdown", () => {
  const el = findQuerySelector(recipePageAst, "ImportDeclaration:has([name='ReactMarkdown'])")?.[0];
  assert(!!el, "RecipePage.tsx does not import ReactMarkdown from react-markdown");
});

test("RecipePage.tsx renders content with ReactMarkdown", () => {
  const rendersContentInMarkdown =
    findQuerySelector(
      recipePageAst,
      "JSXElement[openingElement.name.name='ReactMarkdown'] JSXExpressionContainer MemberExpression[object.name='recipe'][property.name='content']",
    ).length > 0;
  assert(
    !!rendersContentInMarkdown,
    "RecipePage.tsx does not render recipe.content inside <ReactMarkdown> — pass recipe.content as children",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI2LW1hcms=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
