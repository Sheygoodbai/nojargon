# 说人话 NoJargon

说人话 NoJargon is an OpenClaw plugin that rewrites jargon-heavy AI replies
into short, plain language before they reach the user.

It is built for users who want clarity instead of polished fog. 说人话
NoJargon strips consultant phrasing, workplace buzzwords, and unexplained
technical terms so the answer is easier to trust, easier to scan, and harder to
use as smoke and mirrors.

Canonical install page:

- `https://clawhub.ai/plugins/openclaw-nojargon`

## Why it is different

- OpenClaw-native: it works inside the reply pipeline instead of as copy/paste
- local-first: the final rewrite is deterministic and does not call another model
- privacy-first: it does not upload local chat content to any plugin database
- confidence-aware: it pushes replies away from fake certainty and inflated phrasing
- tone-aware: it stays closer to the user's language and rough tone
- bilingual: it ships with English and Chinese rewrite rules out of the box

## What it does

- pushes the model toward plain, concise wording before generation
- rewrites final replies locally before they are written and sent
- removes jargon, consultant phrasing, and unexplained acronyms
- keeps the user's language and rough tone instead of sounding like generic AI
- supports instant `/nojargon on|off|status|adaptive|always` controls

## Install

```bash
openclaw plugins install clawhub:@sheygoodbai/openclaw-nojargon
openclaw plugins enable nojargon
```

Then turn rewriting on in chat:

```text
/nojargon adaptive
```

`openclaw plugins enable nojargon` only loads the plugin. The actual rewrite
switch stays off until you run `/nojargon on` or `/nojargon adaptive`.

If ClawHub returns `429 Rate limit exceeded`, use the source fallback:

```bash
git clone https://github.com/Sheygoodbai/nojargon.git
cd nojargon
openclaw plugins install -l .
openclaw plugins enable nojargon
```

If the plugin does not show up immediately in `openclaw plugins list`, restart
the gateway once after install or enable.

## Commands

- `/nojargon on`
- `/nojargon off`
- `/nojargon adaptive`
- `/nojargon always`
- `/nojargon status`
- `/nojargon help`

## Config

```json
{
  "plugins": {
    "entries": {
      "nojargon": {
        "config": {
          "enabled": true,
          "mode": "adaptive",
          "toneMatch": true,
          "jargonSensitivity": "balanced",
          "shortenOutput": true,
          "trackStats": true
        }
      }
    }
  }
}
```

## Token note

说人话 NoJargon reduces wasted output in the cheapest way OpenClaw currently
allows:

- it tells the model up front to answer in plain language, which can reduce output tokens at the source
- it also trims and rewrites the final reply locally without calling another model

It cannot retroactively refund tokens that the upstream model already
generated. It is designed to minimize waste, not pretend the platform supports
impossible refunds.
