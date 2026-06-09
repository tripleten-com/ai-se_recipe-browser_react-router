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

console.log("\nLesson 07: Programmatic Navigation with useNavigate\n");

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

const recipeCardPath = "src/components/RecipeCard/RecipeCard.tsx";
const recipeCard = read(recipeCardPath);
const recipeCardAst = parseFileContent(readFileSync(join(root, recipeCardPath), "utf8"));

test("RecipeCard.tsx exists", () => {
  assert(recipeCard !== null, "src/components/RecipeCard/RecipeCard.tsx not found");
});

test("RecipeCard.tsx imports useNavigate from react-router-dom", () => {
  const el = findQuerySelector(recipeCardAst, "ImportDeclaration:has([name='useNavigate'])")?.[0];
  assert(!!el, "RecipeCard.tsx does not import useNavigate from react-router-dom");
});

test("RecipeCard.tsx calls useNavigate() to get the navigate function", () => {
  const el = findQuerySelector(recipeCardAst, "CallExpression[callee.name='useNavigate']")?.[0];
  assert(!!el, "RecipeCard.tsx does not call useNavigate() — call it at the top of the component");
});

test("RecipeCard.tsx calls navigate() in a click handler", () => {
  const el = findQuerySelector(recipeCardAst, "CallExpression[callee.name='navigate']")?.[0];
  assert(!!el, "RecipeCard.tsx does not call navigate() — call it inside the button's onClick handler");
});

test("RecipeCard.tsx navigates to a /recipes/ path", () => {
  const templateLiterals = findQuerySelector(recipeCardAst, "TemplateLiteral");
  const stringLiterals = findQuerySelector(recipeCardAst, "StringLiteral");
  const hasRecipesPath =
    templateLiterals?.some((t) =>
      t.quasis?.some((q) => q.value?.raw?.includes("recipes/") || q.value?.cooked?.includes("recipes/")),
    ) || stringLiterals?.some((n) => n.value?.includes("recipes/"));
  assert(
    !!hasRecipesPath,
    "RecipeCard.tsx does not navigate to a /recipes/ path — use a template literal: `/recipes/${recipe.id}`",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI2LW5hdmk=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
