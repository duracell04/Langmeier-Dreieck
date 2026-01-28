import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  types: path.join(root, "packages", "types", "src", "events", "StudentEvents.ts"),
  validator: path.join(root, "packages", "storage", "src", "events", "validator.ts"),
  spec: path.join(root, "spec", "events-schema.md"),
};

const typeContents = readFileSync(files.types, "utf8");
const validatorContents = readFileSync(files.validator, "utf8");
const specContents = readFileSync(files.spec, "utf8");

const typeVersion = extract(typeContents, /StudentEventVersion\s*=\s*(\d+)/, "types");
const validatorVersion = extract(validatorContents, /version:\s*z\.literal\((\d+)\)/, "validator");
const specVersion = extract(specContents, /StudentEvent v(\d+)/i, "spec");

const versions = {
  types: typeVersion,
  validator: validatorVersion,
  spec: specVersion,
};

const unique = new Set(Object.values(versions));
if (unique.size !== 1) {
  console.error("StudentEvent version mismatch:");
  Object.entries(versions).forEach(([key, value]) => {
    console.error(`- ${key}: ${value}`);
  });
  process.exit(1);
}

console.log(`StudentEvent version OK: v${typeVersion}`);

function extract(contents, pattern, label) {
  const match = contents.match(pattern);
  if (!match) {
    console.error(`Could not find version in ${label}`);
    process.exit(1);
  }
  return Number(match[1]);
}
