# PlainClaw

PlainClaw is an OpenClaw plugin that forces jargon-heavy agent replies back into
short, plain language.

It is the opposite of a "Humanizer" surface that tries to make AI sound more
impressive. PlainClaw strips consultant tone, workplace buzzwords, and
unexplained technical terms so users get the point in human words instead of
being dazzled by fluff.

## Why it is different

Most adjacent tools fall into one of three buckets:

- browser extensions that explain selected text after you highlight and send it
  somewhere else
- humanizer tools that make AI output sound more polished or more human
- generic simplifiers that do not live inside the OpenClaw reply path

PlainClaw is different on purpose:

- OpenClaw-native: it works inside the reply pipeline instead of as copy/paste
- anti-buzzword: it removes fog instead of adding more style
- privacy-first: it rewrites locally and does not upload local chat content to a
  plugin database
- confidence-aware: it pushes the model away from fake certainty and inflated
  phrasing before the text is sent
- bilingual: it ships with both English and Chinese rewrite rules out of the box

## What it does

- pushes the model toward plain, concise wording before generation
- rewrites final replies locally before they are written and sent
- matches the user's language and rough tone instead of sounding like generic AI
- supports instant `/plainclaw on|off|status|adaptive|always` commands
- does not upload local conversation data to any plugin database

## Install

```bash
openclaw plugins install clawhub:@sheygoodbai/openclaw-plainclaw
openclaw plugins enable plainclaw
```

Then turn rewriting on in chat:

```text
/plainclaw adaptive
```

`openclaw plugins enable plainclaw` only loads the plugin. The actual rewrite
switch stays off until you run `/plainclaw on` or `/plainclaw adaptive`.

If ClawHub returns `429 Rate limit exceeded`, use the source fallback:

```bash
git clone https://github.com/Sheygoodbai/plainclaw.git
cd plainclaw
openclaw plugins install -l .
openclaw plugins enable plainclaw
```

If the plugin does not show up immediately in `openclaw plugins list`, restart
the gateway once after install or enable.

## Commands

- `/plainclaw on`
- `/plainclaw off`
- `/plainclaw adaptive`
- `/plainclaw always`
- `/plainclaw status`
- `/plainclaw help`

## Config

```json
{
  "plugins": {
    "entries": {
      "plainclaw": {
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

PlainClaw reduces wasted output in the cheapest way OpenClaw currently allows:

- it tells the model up front to answer in plain language, which can reduce
  output tokens at the source
- it also trims and rewrites the final reply locally without calling another
  model

It cannot retroactively refund tokens that the upstream model already generated.
It is designed to minimize waste, not pretend the platform supports impossible
refunds.
