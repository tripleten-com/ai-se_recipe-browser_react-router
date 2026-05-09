import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function read(relPath) {
  try {
    return readFileSync(join(root, relPath), "utf8");
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

console.log("\nLesson 06: Programmatic Navigation with useNavigate\n");

const recipeCard = read("src/components/RecipeCard/RecipeCard.tsx");

test("RecipeCard.tsx exists", () => {
  assert(recipeCard !== null, "src/components/RecipeCard/RecipeCard.tsx not found");
});

test("RecipeCard.tsx imports useNavigate from react-router-dom", () => {
  assert(
    recipeCard && recipeCard.includes("useNavigate"),
    "RecipeCard.tsx does not import useNavigate from react-router-dom"
  );
});

test("RecipeCard.tsx calls useNavigate() to get the navigate function", () => {
  assert(
    recipeCard && recipeCard.includes("useNavigate()"),
    "RecipeCard.tsx does not call useNavigate() — call it at the top of the component"
  );
});

test("RecipeCard.tsx calls navigate() in a click handler", () => {
  assert(
    recipeCard && recipeCard.includes("navigate("),
    "RecipeCard.tsx does not call navigate() — call it inside the button's onClick handler"
  );
});

test("RecipeCard.tsx navigates to a /recipes/ path", () => {
  assert(
    recipeCard && (recipeCard.includes("recipes/") || recipeCard.includes("recipes/${") || recipeCard.includes("`/recipes/")),
    "RecipeCard.tsx does not navigate to a /recipes/ path — use a template literal: `/recipes/${recipe.id}`"
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI2LW5hdmk=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
