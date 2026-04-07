---
name: plainclaw
version: 0.1.0
description: "PlainClaw makes OpenClaw replies easier to understand. Use when the user wants AI answers in plain language, shorter wording, fewer buzzwords, fewer unexplained technical terms, less corporate speak, or more 人话."
tags: [plainclaw, openclaw, clawhub, plain-language, 人话, 术语翻译, 职场黑话, jargon-removal]
source: Sheygoodbai/plainclaw
trigger: "PlainClaw"
metadata:
  openclaw:
    emoji: "🗣️"
    homepage: "https://github.com/Sheygoodbai/plainclaw"
---

# PlainClaw

Use this skill when the user wants OpenClaw to:

- speak in plain language
- stop hiding behind jargon
- remove workplace buzzwords
- explain technical terms in normal words
- stay concise without losing the main point

## What PlainClaw is

`PlainClaw` is an OpenClaw plugin with a bundled skill.

It is designed to keep agent output understandable, short, and hard to use as
smoke and mirrors.

## Install

- `openclaw plugins install clawhub:@sheygoodbai/openclaw-plainclaw`
- `openclaw plugins enable plainclaw`

## Quick controls

- `/plainclaw on`
- `/plainclaw off`
- `/plainclaw adaptive`
- `/plainclaw always`
- `/plainclaw status`

## Rules

- Match the user's language and rough tone.
- Prefer short, concrete sentences.
- If a technical term is necessary, explain it in everyday words right away.
- Remove fluff before adding more detail.
- Do not upload local conversation data anywhere just to rewrite wording.

