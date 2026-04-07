import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStaticPromptGuidance,
  createRecentlyRewrittenCache,
  normalizeSettings,
  rewriteOutgoingContent,
} from "../src/plainclaw-core.js";

test("balanced mode rewrites obvious corporate jargon", () => {
  const settings = normalizeSettings({ enabled: true, mode: "adaptive", jargonSensitivity: "balanced" });
  const input =
    "We should leverage best practices and align stakeholders on a robust end-to-end plan.";
  const output = rewriteOutgoingContent(input, settings);

  assert.equal(output.changed, true);
  assert.match(output.content, /use/i);
  assert.doesNotMatch(output.content, /\bleverage\b/i);
  assert.doesNotMatch(output.content, /\bstakeholders\b/i);
  assert.doesNotMatch(output.content, /\bapproachs\b/i);
});

test("code fences stay untouched", () => {
  const settings = normalizeSettings({ enabled: true, mode: "always" });
  const input = [
    "We should leverage this.",
    "```js",
    "const latency = 120;",
    "```",
  ].join("\n");
  const output = rewriteOutgoingContent(input, settings);

  assert.equal(output.changed, true);
  assert.match(output.content, /use this/i);
  assert.match(output.content, /const latency = 120;/);
});

test("low-jargon content is skipped in adaptive mode", () => {
  const settings = normalizeSettings({ enabled: true, mode: "adaptive", jargonSensitivity: "balanced" });
  const input = "The fix is ready. Run the command and check the result.";
  const output = rewriteOutgoingContent(input, settings);

  assert.equal(output.changed, false);
  assert.equal(output.content, input);
});

test("recent rewrite cache avoids duplicate passes", () => {
  const cache = createRecentlyRewrittenCache(10_000);
  cache.remember("plain reply");

  assert.equal(cache.has("plain reply"), true);
  assert.equal(cache.has("different reply"), false);
});

test("static prompt guidance includes anti-overclaiming rule", () => {
  const prompt = buildStaticPromptGuidance(normalizeSettings({ enabled: true }));
  assert.match(prompt, /plain language first/i);
  assert.match(prompt, /uncertainty honest/i);
});
