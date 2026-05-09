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

console.log("\nLesson 03: Shared Layout with Outlet\n");

const layout = read("src/components/AppLayout/AppLayout.tsx");
const app = read("src/components/App/App.tsx");

test("src/components/AppLayout/AppLayout.tsx exists", () => {
  assert(layout !== null, "src/components/AppLayout/AppLayout.tsx not found — create it");
});

test("AppLayout.tsx imports Outlet from react-router-dom", () => {
  assert(
    layout && layout.includes("Outlet"),
    "AppLayout.tsx does not import Outlet from react-router-dom"
  );
});

test("AppLayout.tsx renders <Outlet />", () => {
  assert(
    layout && layout.includes("<Outlet"),
    "AppLayout.tsx does not render <Outlet /> — add it where child route content should appear"
  );
});

test("AppLayout.tsx renders Header", () => {
  assert(
    layout && layout.includes("Header"),
    "AppLayout.tsx does not render Header — move the Header import and usage here from App.tsx"
  );
});

test("App.tsx uses AppLayout as a layout route", () => {
  assert(
    app && app.includes("AppLayout"),
    "App.tsx does not use AppLayout — wrap your routes with <Route element={<AppLayout />}>"
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnIzLW91dGw=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
