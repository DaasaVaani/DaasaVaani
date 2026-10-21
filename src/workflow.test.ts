import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { isMap, isSeq, parseDocument } from "yaml";

test("manual deployment defaults off and upload/deployment require validated main with explicit recovery consent", () => {
  const workflow = parseDocument(readFileSync(new URL("../.github/workflows/validate.yml", import.meta.url), "utf8"), { uniqueKeys: true });
  expect(workflow.errors).toEqual([]);
  const input = ["on", "workflow_dispatch", "inputs", "deploy_main"];
  expect(workflow.getIn([...input, "type"])).toBe("boolean");
  expect(workflow.getIn([...input, "default"])).toBe(false);
  const guard = "github.ref == 'refs/heads/main' && (github.event_name == 'push' || (github.event_name == 'workflow_dispatch' && inputs.deploy_main))";
  expect(workflow.getIn(["jobs", "deploy", "if"])).toBe(guard);
  const needs = workflow.getIn(["jobs", "deploy", "needs"]);
  if (!isSeq(needs)) throw new Error("Missing deployment dependencies");
  expect(needs.toJSON()).toEqual(["workflow-lint", "web-app"]);
  const steps = workflow.getIn(["jobs", "web-app", "steps"]);
  if (!isSeq(steps)) throw new Error("Missing web validation steps");
  const buildIndex = steps.items.findIndex(step => isMap(step) && step.get("run") === "npm run check");
  const uploadIndex = steps.items.findIndex(step => isMap(step) && step.get("name") === "Upload validated fixture-only website");
  expect(buildIndex).toBeGreaterThanOrEqual(0);
  expect(uploadIndex).toBeGreaterThan(buildIndex);
  const build = steps.items[buildIndex], upload = steps.items[uploadIndex];
  if (!isMap(build) || !isMap(upload)) throw new Error("Missing complete validation/upload gates");
  expect(build.get("continue-on-error")).toBeUndefined();
  expect(workflow.getIn(["jobs", "web-app", "continue-on-error"])).toBeUndefined();
  expect(upload.get("if")).toBe(guard);
});
