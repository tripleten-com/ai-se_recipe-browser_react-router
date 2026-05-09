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

console.log("\nLesson 04: Navigation with NavLink\n");

const header = read("src/components/Header/Header.tsx");

test("Header.tsx exists", () => {
  assert(header !== null, "src/components/Header/Header.tsx not found");
});

test("Header.tsx imports NavLink from react-router-dom", () => {
  assert(
    header && header.includes("NavLink"),
    "Header.tsx does not import NavLink from react-router-dom"
  );
});

test("Header.tsx renders NavLink elements", () => {
  assert(
    header && header.includes("<NavLink"),
    "Header.tsx does not render any <NavLink> elements"
  );
});

test("Header.tsx includes a link to /favorites", () => {
  assert(
    header && header.includes("favorites"),
    'Header.tsx does not have a NavLink to "/favorites" — add one to the nav'
  );
});

test("Header.tsx uses a named className function for active styling", () => {
  assert(
    header && header.includes("isActive"),
    "Header.tsx does not use a className function with isActive — define a named function and pass it to each NavLink"
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cnI0LW5hdmw=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
