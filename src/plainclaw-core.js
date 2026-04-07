export const PLUGIN_ID = "plainclaw";

export const DEFAULT_SETTINGS = Object.freeze({
  enabled: false,
  mode: "adaptive",
  toneMatch: true,
  jargonSensitivity: "balanced",
  shortenOutput: true,
  trackStats: true,
});

const SENSITIVITY_THRESHOLDS = Object.freeze({
  light: 5,
  balanced: 3,
  aggressive: 1,
});

const ENGLISH_REPLACEMENTS = [
  [/\bit is important to note that\b/gi, ""],
  [/\bplease note that\b/gi, ""],
  [/\bfor the avoidance of doubt\b/gi, ""],
  [/\bfrom a practical standpoint\b/gi, ""],
  [/\bin order to\b/gi, "to"],
  [/\bleverage\b/gi, "use"],
  [/\butili[sz]e\b/gi, "use"],
  [/\bsynerg(?:y|ies)\b/gi, "fit"],
  [/\bactionable\b/gi, "useful"],
  [/\brobust\b/gi, "reliable"],
  [/\boptimi[sz]e\b/gi, "improve"],
  [/\bscalable\b/gi, "able to grow"],
  [/\bstakeholders?\b/gi, "people involved"],
  [/\bbandwidth\b/gi, "time"],
  [/\bparadigm\b/gi, "way"],
  [/\bgranularity\b/gi, "detail level"],
  [/\blatency\b/gi, "delay"],
  [/\bthroughput\b/gi, "capacity"],
  [/\bschema\b/gi, "data shape"],
  [/\bregression\b/gi, "old bug coming back"],
  [/\bedge case\b/gi, "special case"],
  [/\brefactor\b/gi, "rewrite without changing behavior"],
  [/\bdependency\b/gi, "library or tool it relies on"],
  [/\bobservability\b/gi, "logs, metrics, and traces"],
  [/\bproduction-ready\b/gi, "ready for wider use"],
  [/\benterprise-grade\b/gi, "built for stricter use"],
  [/\bbest practice(s)?\b/gi, "common reliable approach$1"],
  [/\bfrictionless\b/gi, "easy"],
  [/\bseamless\b/gi, "smooth"],
  [/\bend-to-end\b/gi, "from start to finish"],
  [/\bfuture-proof\b/gi, "less likely to break with future changes"],
  [/\bstate-of-the-art\b/gi, "among the strongest current options"],
  [/\bworld-class\b/gi, "very strong"],
];

const CHINESE_REPLACEMENTS = [
  [/需要注意的是/g, ""],
  [/本质上(来讲|来说)?/g, ""],
  [/简单来说/g, "直接说"],
  [/赋能/g, "帮上忙"],
  [/抓手/g, "办法"],
  [/闭环/g, "收尾"],
  [/对齐/g, "说清楚并统一"],
  [/拉齐/g, "统一"],
  [/拉通/g, "打通"],
  [/沉淀/g, "整理下来"],
  [/颗粒度/g, "细节程度"],
  [/方法论/g, "做法"],
  [/赛道/g, "方向"],
  [/矩阵/g, "一组"],
  [/协同/g, "配合"],
  [/资源位/g, "位置"],
  [/最佳实践/g, "常用靠谱做法"],
  [/抽象层/g, "中间封装层"],
  [/解耦/g, "减少互相牵连"],
  [/幂等/g, "重复做结果也一样"],
  [/回归(问题|风险)?/g, "旧问题又出现"],
  [/生产级/g, "可正式用"],
  [/无缝/g, "顺畅"],
  [/端到端/g, "从头到尾"],
];

const FLUFF_PATTERNS = [
  /^\s*(here'?s what that means in practice:)\s*/gim,
  /^\s*(to put it simply:)\s*/gim,
  /^\s*(in summary:)\s*/gim,
  /^\s*(总的来说：|总结一下：)\s*/gim,
  /\n{2,}(if you'd like,? I can help with that next\.?)$/i,
  /\n{2,}(let me know if you want me to go deeper\.?)$/i,
  /\n{2,}(如果你愿意，我可以继续往下拆。?)$/u,
  /\n{2,}(如果需要，我可以下一步直接帮你做。?)$/u,
];

const JARGON_PATTERNS = [
  { pattern: /\b(leverage|utili[sz]e|actionable|stakeholders?|bandwidth|paradigm|granularity|synergy|observability|robust)\b/gi, weight: 1 },
  { pattern: /\b(latency|throughput|schema|regression|edge case|refactor|dependency|enterprise-grade|production-ready|future-proof|best practice|best practices|end-to-end)\b/gi, weight: 1 },
  { pattern: /(赋能|抓手|闭环|对齐|拉齐|拉通|沉淀|颗粒度|方法论|赛道|矩阵|协同|资源位|最佳实践|抽象层|解耦|幂等|回归|生产级)/gu, weight: 1 },
  { pattern: /\b(it is important to note that|from a practical standpoint|for the avoidance of doubt|world-class|state-of-the-art)\b/gi, weight: 2 },
];

export function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeEnum(value, allowed, fallback) {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

export function normalizeSettings(value) {
  const source = isRecord(value) ? value : {};
  return {
    enabled: normalizeBoolean(source.enabled, DEFAULT_SETTINGS.enabled),
    mode: normalizeEnum(source.mode, ["adaptive", "always"], DEFAULT_SETTINGS.mode),
    toneMatch: normalizeBoolean(source.toneMatch, DEFAULT_SETTINGS.toneMatch),
    jargonSensitivity: normalizeEnum(
      source.jargonSensitivity,
      ["light", "balanced", "aggressive"],
      DEFAULT_SETTINGS.jargonSensitivity,
    ),
    shortenOutput: normalizeBoolean(source.shortenOutput, DEFAULT_SETTINGS.shortenOutput),
    trackStats: normalizeBoolean(source.trackStats, DEFAULT_SETTINGS.trackStats),
  };
}

export function extractText(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => extractText(entry)).filter(Boolean).join("\n");
  }
  if (!isRecord(value)) {
    return "";
  }
  if (Array.isArray(value.content)) {
    return value.content.map((entry) => extractText(entry)).filter(Boolean).join("\n");
  }
  const chunks = [];
  for (const [key, nested] of Object.entries(value)) {
    if (key === "role" || key === "type" || key === "id" || key === "usage") {
      continue;
    }
    const extracted = extractText(nested);
    if (extracted) {
      chunks.push(extracted);
    }
  }
  return chunks.join("\n");
}

export function extractLatestUserMessageText(messages) {
  if (!Array.isArray(messages)) {
    return "";
  }
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!isRecord(message) || message.role !== "user") {
      continue;
    }
    return extractText(message).trim();
  }
  return "";
}

function detectLanguage(text) {
  return /[\u3400-\u9fff]/u.test(text) ? "zh" : "en";
}

function detectTone(text) {
  const normalized = text.trim();
  if (!normalized) {
    return "neutral";
  }
  if (/[!?]{2,}|哈哈|嘿|欸|lol|pls|thx|hey/i.test(normalized)) {
    return "casual";
  }
  if (/\bplease\b|\bcould you\b|\bwould you\b|麻烦|请|辛苦/u.test(normalized)) {
    return "polite";
  }
  if (normalized.length <= 80) {
    return "direct";
  }
  return "neutral";
}

function detectRequestedDepth(text) {
  if (/(详细|细一点|展开说|一步一步|深入|step by step|deep dive|walk me through)/i.test(text)) {
    return "detailed";
  }
  return "concise";
}

export function buildStaticPromptGuidance(settings) {
  const lines = [
    "PlainClaw is enabled for this conversation.",
    "Reply in plain language first.",
    "Avoid consultant phrasing, workplace buzzwords, and unexplained acronyms.",
    "If a technical term is necessary, explain it in everyday words the first time you use it.",
    "Prefer short, concrete sentences over abstract wording.",
    "Keep uncertainty honest instead of sounding more confident than the evidence supports.",
  ];
  if (settings.shortenOutput) {
    lines.push("Cut filler, throat-clearing, and repeated caveats.");
  }
  return lines.join("\n");
}

export function buildTurnPromptGuidance(latestUserText, settings) {
  const language = detectLanguage(latestUserText || "");
  const tone = detectTone(latestUserText || "");
  const depth = detectRequestedDepth(latestUserText || "");
  const lines = [];
  if (language === "zh") {
    lines.push("Reply in Chinese unless the user clearly switches languages.");
  } else {
    lines.push("Reply in English unless the user clearly switches languages.");
  }
  if (settings.toneMatch) {
    if (tone === "casual") {
      lines.push("Match the user's casual tone, but stay clear.");
    } else if (tone === "polite") {
      lines.push("Match the user's polite tone without becoming stiff.");
    } else if (tone === "direct") {
      lines.push("Match the user's direct style.");
    } else {
      lines.push("Keep a neutral, human tone.");
    }
  }
  if (depth === "detailed") {
    lines.push("Be clear first, then add only the detail needed to answer properly.");
  } else {
    lines.push("Keep it compact and get to the point quickly.");
  }
  return lines.join("\n");
}

function countRegexMatches(pattern, text) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const regex = new RegExp(pattern.source, flags);
  let count = 0;
  while (regex.exec(text)) {
    count += 1;
  }
  return count;
}

export function jargonScore(text) {
  const normalized = typeof text === "string" ? text : "";
  let score = 0;
  for (const { pattern, weight } of JARGON_PATTERNS) {
    score += countRegexMatches(pattern, normalized) * weight;
  }
  if (normalized.length > 1200) {
    score += 2;
  } else if (normalized.length > 600) {
    score += 1;
  }
  if ((normalized.match(/[;,，；:：]/g) || []).length >= 6) {
    score += 1;
  }
  return score;
}

export function shouldRewrite(text, settings) {
  if (typeof text !== "string" || !text.trim()) {
    return false;
  }
  if (settings.mode === "always") {
    return true;
  }
  return jargonScore(text) >= SENSITIVITY_THRESHOLDS[settings.jargonSensitivity];
}

function protectInlineCode(text) {
  const preserved = [];
  const body = text.replace(/`[^`\n]+`/g, (match) => {
    const token = `__PLAINCLAW_INLINE_${preserved.length}__`;
    preserved.push(match);
    return token;
  });
  return { body, preserved };
}

function restoreInlineCode(text, preserved) {
  return preserved.reduce(
    (current, original, index) => current.replaceAll(`__PLAINCLAW_INLINE_${index}__`, original),
    text,
  );
}

function applyReplacementTable(text, table) {
  let current = text;
  for (const [pattern, replacement] of table) {
    current = current.replace(pattern, replacement);
  }
  return current;
}

function trimLowValueTail(text, settings) {
  if (!settings.shortenOutput) {
    return text;
  }
  let current = text;
  for (const pattern of FLUFF_PATTERNS) {
    current = current.replace(pattern, "");
  }
  return current;
}

function cleanupText(text) {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\(\s*\)/g, "")
    .replace(/^\s*[-*]\s*(and|also)\s+/gim, "- ")
    .replace(/^\s*\d+\.\s*(and|also)\s+/gim, (match) => match.replace(/\b(and|also)\s+/i, ""))
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function rewriteTextSegment(text, settings) {
  const { body, preserved } = protectInlineCode(text);
  const rewritten = cleanupText(
    trimLowValueTail(
      applyReplacementTable(applyReplacementTable(body, ENGLISH_REPLACEMENTS), CHINESE_REPLACEMENTS),
      settings,
    ),
  );
  return restoreInlineCode(rewritten, preserved);
}

export function rewritePlainLanguage(text, settings) {
  if (!shouldRewrite(text, settings)) {
    return text;
  }
  const segments = text.split(/(```[\s\S]*?```)/g);
  return segments
    .map((segment) => (segment.startsWith("```") ? segment : rewriteTextSegment(segment, settings)))
    .join("");
}

export function rewriteAssistantMessage(message, settings) {
  if (!isRecord(message) || message.role !== "assistant" || !Array.isArray(message.content)) {
    return { message, changed: false, charsRemoved: 0 };
  }
  let changed = false;
  let charsRemoved = 0;
  const content = message.content.map((entry) => {
    if (!isRecord(entry) || entry.type !== "text" || typeof entry.text !== "string") {
      return entry;
    }
    const rewritten = rewritePlainLanguage(entry.text, settings);
    if (rewritten === entry.text) {
      return entry;
    }
    changed = true;
    charsRemoved += Math.max(0, entry.text.length - rewritten.length);
    return { ...entry, text: rewritten };
  });
  if (!changed) {
    return { message, changed: false, charsRemoved: 0 };
  }
  return { message: { ...message, content }, changed: true, charsRemoved };
}

export function rewriteOutgoingContent(text, settings) {
  const rewritten = rewritePlainLanguage(text, settings);
  return {
    content: rewritten,
    charsRemoved: Math.max(0, text.length - rewritten.length),
    changed: rewritten !== text,
  };
}

export function collectAssistantTexts(message) {
  if (!isRecord(message) || message.role !== "assistant" || !Array.isArray(message.content)) {
    return [];
  }
  return message.content
    .filter((entry) => isRecord(entry) && entry.type === "text" && typeof entry.text === "string")
    .map((entry) => entry.text);
}

export function createRecentlyRewrittenCache(ttlMs = 60_000) {
  const cache = new Map();

  function prune(now = Date.now()) {
    for (const [key, expiresAt] of cache.entries()) {
      if (expiresAt <= now) {
        cache.delete(key);
      }
    }
  }

  return {
    remember(text) {
      if (typeof text !== "string" || !text) {
        return;
      }
      const now = Date.now();
      prune(now);
      cache.set(text, now + ttlMs);
    },
    has(text) {
      if (typeof text !== "string" || !text) {
        return false;
      }
      const now = Date.now();
      prune(now);
      return cache.has(text);
    },
  };
}

export function formatStatus(settings, stats) {
  return [
    `PlainClaw: ${settings.enabled ? "on" : "off"}`,
    `Mode: ${settings.mode}`,
    `Tone match: ${settings.toneMatch ? "on" : "off"}`,
    `Jargon sensitivity: ${settings.jargonSensitivity}`,
    `Shorten output: ${settings.shortenOutput ? "on" : "off"}`,
    `Tracked rewrites this run: ${stats.messagesRewritten}`,
    `Characters removed locally: ${stats.charsRemoved}`,
    `Estimated visible token savings: ${stats.estimatedTokenSavings}`,
    stats.lastModel ? `Last model: ${stats.lastProvider}/${stats.lastModel}` : "Last model: n/a",
    Number.isFinite(stats.lastOutputTokens) ? `Last raw output tokens: ${stats.lastOutputTokens}` : "Last raw output tokens: n/a",
  ].join("\n");
}

export function formatHelp() {
  return [
    "PlainClaw commands:",
    "/plainclaw on",
    "/plainclaw off",
    "/plainclaw adaptive",
    "/plainclaw always",
    "/plainclaw status",
    "/plainclaw help",
  ].join("\n");
}

export function cloneConfig(config) {
  return structuredClone(isRecord(config) ? config : {});
}

export function ensurePluginConfigEntry(config) {
  config.plugins ??= {};
  config.plugins.entries ??= {};
  config.plugins.entries[PLUGIN_ID] ??= {};
  config.plugins.entries[PLUGIN_ID].config ??= {};
  return config.plugins.entries[PLUGIN_ID].config;
}
