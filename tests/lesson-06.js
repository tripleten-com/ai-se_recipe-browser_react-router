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

console.log("\nLesson 06: Rendering Markdown\n");

const pkg = read("package.json");
const recipePage = read("src/pages/RecipePage.tsx");

test("react-markdown is listed as a dependency", () => {
  assert(
    pkg && pkg.includes("react-markdown"),
    "react-markdown not found in package.json — did you run npm install react-markdown?"
  );
});

test("RecipePage.tsx imports ReactMarkdown", () => {
  assert(
    recipePage && recipePage.includes("ReactMarkdown"),
    "RecipePage.tsx does not import ReactMarkdown from react-markdown"
  );
});

test("RecipePage.tsx renders content with ReactMarkdown", () => {
  assert(
    recipePage && recipePage.includes("<ReactMarkdown"),
    "RecipePage.tsx does not render <ReactMarkdown> — use it to wrap recipe.content"
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI2LW1hcms=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
