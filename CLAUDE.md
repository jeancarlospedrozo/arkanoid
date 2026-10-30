# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Arkanoid/Breakout browser game, pre-implementation: only assets exist so far. There is no `index.html`, game code, package manifest, build, lint, or test setup yet, so there are no commands to run. Update this file when they are added.

## Workflow: spec-driven development

Features are meant to be built through two vendored skills (`Klerith/fernando-skills`, pinned in `skills-lock.json`):

1. `/spec <description>` asks clarifying questions, then writes `specs/NN-slug.md` in `Draft` state. It writes no code.
2. The human re-reads the spec and changes its state to `Approved`. The agent never does this.
3. `/spec-impl NN-slug` refuses any spec not marked approved, creates branch `spec-NN-slug` (controlled by `AutoCreateBranch` in `specs/.spec-config.yml`), and implements the plan one step at a time, pausing for diff review after each. It never commits on its own.

The skills live in `.agents/skills/`; `.claude/skills/` holds symlinks to them so Claude Code registers `/spec` and `/spec-impl`.

`/spec-impl` depends on git for its status checks and branching, and it stops to ask if the working tree has uncommitted changes, so commit or stash before running it.

## Assets

`assets/spritesheet.js` is the sprite API, written as a classic script: it declares globals (`SPRITES`, `EXPLOSION_FRAMES`, `EXPLOSION_DURATION`, `loadSpritesheet`, `drawSprite`, `drawFrame`) with no exports, so it must be loaded with a plain `<script>` tag, or converted if the game uses ES modules.

- `loadSpritesheet(cb)` must complete before drawing; the draw functions silently no-op until the sheet is loaded.
- The image path `assets/spritesheet-breakout.png` is relative to the page, so the HTML entry point is expected at the repo root.
- `drawSprite` takes `'paddle'`, `'ball'`, or `'block_<color>'`. `drawFrame` takes one entry from an `EXPLOSION_FRAMES[color]` array (4 frames each).
- Sprite color keys do not match the artwork: by eye, `cyan` is teal-green, `green` is blue, `magenta` is purple, and `hotpink` is orange. Choose colors by looking at the sheet, not the key name.
- `EXPLOSION_FRAMES.gray` reuses the red row's coordinates, so gray blocks explode in red.

`assets/sounds/` holds `ball-bounce.mp3` and `break-sound.mp3`; no code references them yet.

The spritesheet says "Made by Petraheim - Credits Appreciated", so credit the artist in the finished game.
