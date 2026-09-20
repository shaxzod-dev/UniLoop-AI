import fs from "node:fs";
import Module, { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Use the project's existing TypeScript compiler to run source validation without a test framework.
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const requireSource = createRequire(import.meta.url);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  const sourcePath = request.startsWith("@/")
    ? path.join(projectRoot, "src", request.slice(2))
    : request;
  return originalResolve.call(this, sourcePath, ...args);
};
Module._extensions[".ts"] = function (loadedModule, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  loadedModule._compile(result.outputText, filename);
};
const { createMockDatabase } = requireSource("../src/lib/mocks/database.ts");
const { validateMockData } = requireSource(
  "../src/lib/validation/mock-data.ts",
);
const { validateApiWorkflows } = requireSource(
  "../src/lib/validation/api-workflows.ts",
);
validateMockData(createMockDatabase());
await validateApiWorkflows();
console.log(
  "Domain references, safe assessment payloads, scenarios, mutations, consent, matching, query invalidation, and HTTP transport passed.",
);
