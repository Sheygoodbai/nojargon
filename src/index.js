import {
  buildStaticPromptGuidance,
  buildTurnPromptGuidance,
  cloneConfig,
  collectAssistantTexts,
  createRecentlyRewrittenCache,
  DEFAULT_SETTINGS,
  DISPLAY_NAME,
  ensurePluginConfigEntry,
  extractLatestUserMessageText,
  formatHelp,
  formatStatus,
  normalizeSettings,
  PLUGIN_ID,
  rewriteAssistantMessage,
  rewriteOutgoingContent,
} from "./nojargon-core.js";

export default function register(api) {
  let liveOverrides = normalizeSettings(api?.pluginConfig);
  const recentlyRewritten = createRecentlyRewrittenCache();
  const stats = {
    messagesRewritten: 0,
    charsRemoved: 0,
    estimatedTokenSavings: 0,
    lastProvider: "",
    lastModel: "",
    lastOutputTokens: Number.NaN,
  };

  function currentSettings() {
    return normalizeSettings(liveOverrides || DEFAULT_SETTINGS);
  }

  function recordSavings(charsRemoved) {
    const settings = currentSettings();
    if (!settings.trackStats || !charsRemoved) {
      return;
    }
    stats.messagesRewritten += 1;
    stats.charsRemoved += charsRemoved;
    stats.estimatedTokenSavings += Math.max(1, Math.round(charsRemoved / 4));
  }

  async function persistOverrides(nextOverrides) {
    const loadedConfig = await api.runtime.config.loadConfig();
    const nextConfig = cloneConfig(loadedConfig);
    const target = ensurePluginConfigEntry(nextConfig);
    Object.assign(target, nextOverrides);
    await api.runtime.config.writeConfigFile(nextConfig);
    liveOverrides = normalizeSettings(target);
    return liveOverrides;
  }

  api.registerCommand({
    name: "nojargon",
    description: "Turn 说人话 NoJargon on/off or switch rewrite mode",
    acceptsArgs: true,
    async handler(ctx) {
      const args = typeof ctx.args === "string" ? ctx.args.trim().toLowerCase() : "";
      if (!args || args === "help") {
        return { text: formatHelp() };
      }
      if (args === "status") {
        return { text: formatStatus(currentSettings(), stats) };
      }
      if (args === "on") {
        const settings = await persistOverrides({ enabled: true });
        return { text: `${DISPLAY_NAME} is on.\nMode: ${settings.mode}` };
      }
      if (args === "off") {
        const settings = await persistOverrides({ enabled: false });
        return { text: `${DISPLAY_NAME} is off.\nMode: ${settings.mode}` };
      }
      if (args === "adaptive" || args === "always") {
        const settings = await persistOverrides({ enabled: true, mode: args });
        return { text: `${DISPLAY_NAME} is on.\nMode: ${settings.mode}` };
      }
      return { text: formatHelp() };
    },
  });

  api.on(
    "before_prompt_build",
    (event) => {
      const settings = currentSettings();
      if (!settings.enabled) {
        return undefined;
      }
      const latestUserText = extractLatestUserMessageText(event?.messages);
      return {
        prependSystemContext: buildStaticPromptGuidance(settings),
        prependContext: buildTurnPromptGuidance(latestUserText, settings),
      };
    },
    { priority: 75 },
  );

  api.on(
    "llm_output",
    (event) => {
      stats.lastProvider = event?.provider || "";
      stats.lastModel = event?.model || "";
      stats.lastOutputTokens =
        typeof event?.usage?.output === "number" ? event.usage.output : Number.NaN;
    },
    { priority: 20 },
  );

  api.on(
    "before_message_write",
    (event) => {
      const settings = currentSettings();
      if (!settings.enabled) {
        return undefined;
      }
      const rewritten = rewriteAssistantMessage(event?.message, settings);
      if (!rewritten.changed) {
        return undefined;
      }
      for (const text of collectAssistantTexts(rewritten.message)) {
        recentlyRewritten.remember(text);
      }
      recordSavings(rewritten.charsRemoved);
      return { message: rewritten.message };
    },
    { priority: 70 },
  );

  api.on(
    "message_sending",
    (event) => {
      const settings = currentSettings();
      if (!settings.enabled || typeof event?.content !== "string") {
        return undefined;
      }
      if (recentlyRewritten.has(event.content)) {
        return undefined;
      }
      const rewritten = rewriteOutgoingContent(event.content, settings);
      if (!rewritten.changed) {
        return undefined;
      }
      recentlyRewritten.remember(rewritten.content);
      recordSavings(rewritten.charsRemoved);
      return { content: rewritten.content };
    },
    { priority: 70 },
  );
}
