---
name: nojargon
version: 0.2.0
description: "说人话 NoJargon makes OpenClaw replies easier to understand. Use when the user wants plain language, shorter wording, fewer buzzwords, fewer unexplained technical terms, or more 人话."
tags: [nojargon, openclaw, clawhub, plain-language, no-jargon, 人话, 术语翻译, 职场黑话, jargon-removal]
source: Sheygoodbai/nojargon
trigger: "NoJargon"
metadata:
  openclaw:
    emoji: "🗣️"
    homepage: "https://clawhub.ai/plugins/openclaw-nojargon"
---

# 说人话 NoJargon

Use this skill when the user wants OpenClaw to:

- speak in plain language
- stop hiding behind jargon
- remove workplace buzzwords
- explain technical terms in normal words
- stay concise without losing the main point

## What 说人话 NoJargon is

`说人话 NoJargon` is an OpenClaw plugin with a bundled skill.

It is designed to keep agent output understandable, short, and hard to use as
smoke and mirrors.

## Install

- `openclaw plugins install clawhub:@sheygoodbai/openclaw-nojargon`
- `openclaw plugins enable nojargon`
- `/nojargon adaptive`

If ClawHub returns `429 Rate limit exceeded`, clone the repo and install with
`openclaw plugins install -l .` instead.

## Quick controls

- `/nojargon on`
- `/nojargon off`
- `/nojargon adaptive`
- `/nojargon always`
- `/nojargon status`

## Rules

- Match the user's language and rough tone.
- Prefer short, concrete sentences.
- If a technical term is necessary, explain it in everyday words right away.
- Remove fluff before adding more detail.
- Keep uncertainty honest instead of sounding more certain than the evidence.
- Do not upload local conversation data anywhere just to rewrite wording.
