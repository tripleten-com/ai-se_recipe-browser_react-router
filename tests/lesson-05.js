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

console.log("\nLesson 05: Dynamic Routes with useParams\n");

const app = read("src/components/App/App.tsx");
const recipePage = read("src/pages/RecipePage.tsx");

test("src/pages/RecipePage.tsx exists", () => {
  assert(recipePage !== null, "src/pages/RecipePage.tsx not found — create it in src/pages/");
});

test("App.tsx has a dynamic route with an :id segment", () => {
  assert(
    app && (app.includes(":id") || app.includes(":recipeId")),
    'App.tsx does not have a dynamic route segment — add a Route with path="recipes/:id"'
  );
});

test("App.tsx renders RecipePage on the dynamic route", () => {
  assert(
    app && app.includes("RecipePage"),
    "App.tsx does not import or render RecipePage"
  );
});

test("RecipePage.tsx imports useParams from react-router-dom", () => {
  assert(
    recipePage && recipePage.includes("useParams"),
    "RecipePage.tsx does not import useParams from react-router-dom"
  );
});

test("RecipePage.tsx calls useParams()", () => {
  assert(
    recipePage && recipePage.includes("useParams()"),
    "RecipePage.tsx does not call useParams() — destructure the id from it"
  );
});

test("RecipePage.tsx handles the case where no recipe matches", () => {
  assert(
    recipePage && (recipePage.includes("not found") || recipePage.includes("!recipe") || recipePage.includes("Recipe not")),
    "RecipePage.tsx does not handle the case where the recipe id doesn't match any recipe"
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI1LXBhcm0=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
