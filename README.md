# PlainClaw

PlainClaw is an OpenClaw plugin that forces jargon-heavy agent replies back into
short, plain language.

It is the opposite of a "Humanizer" surface that tries to make AI sound more
impressive. PlainClaw strips consultant tone, workplace buzzwords, and
unexplained technical terms so users get the point in human words instead of
being dazzled by fluff.

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

Then turn it on in chat:

```text
/plainclaw adaptive
```

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

