import { execSync } from "child_process";
import esquery from "esquery";
import { parse } from "@babel/parser";

/**
 * Collapses all whitespace sequences to a single space and trims the result.
 * Call this on every file read so that formatting differences don't affect
 * string matching in tests.
 */
export function normalize(content) {
  if (content === null) return null;
  return content.replace(/\s+/g, " ").trim();
}

/**
 * Type-checks the app with TypeScript. Uses tsconfig.app.json directly because
 * the root tsconfig.json is a project-references wrapper with "files": [] and
 * checks nothing on its own.
 */
export function checkCompiles(root) {
  try {
    execSync("npx tsc -p tsconfig.app.json --noEmit", { cwd: root, stdio: "pipe" });
    return { ok: true, output: "" };
  } catch (err) {
    const output =
      err.stderr?.toString() || err.stdout?.toString() || "(no output)";
    return { ok: false, output };
  }
}

/**
 * Runs `vite build` to verify the app bundles without errors. This catches
 * issues that TypeScript alone misses — missing assets, bad imports, etc.
 */
export function checkBuilds(root) {
  try {
    execSync("npx vite build", { cwd: root, stdio: "pipe" });
    return { ok: true, output: "" };
  } catch (err) {
    const output =
      err.stderr?.toString() || err.stdout?.toString() || "(no output)";
    return { ok: false, output };
  }
}


/**
 * Parses a file into an AST tree.
 */
export function parseFileContent(fileContent) {
  try {
    return parse(fileContent, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (error) {
    throw new Error(`❌ Error parsing file content: ${error.message}`);
  }
}


/**
 * Finds all JSX elements in an AST tree.
 */
export function findQuerySelector(ast, selector) {
  return esquery(ast, selector);
}


