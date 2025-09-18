# FocusFlow Case Study

## Overview

FocusFlow began as a collection of HTML/CSS/JS drills. The goal for this iteration was to craft a recruiter-ready experience that highlights front-end craft: visual polish, thoughtful interactions, and a documented build story.

## Problem Statement

> "Transform a basic to-do demo into a product-quality experience that speaks to design systems, accessibility, and engineering discipline."

Key questions:

- How can a simple feature set feel premium without relying on a heavy framework?
- What signals help a recruiter understand the depth of the implementation quickly?
- How do we keep the learning journey visible while showcasing the final result first?

## Research & Inspiration

I audited productivity tools (Linear, Todoist, Things) to note common heuristics: fast capture, strong typography, satisfying interactions. The design draws from those heuristics while keeping the stack intentionally simple (vanilla HTML/CSS/JS).

## Experience Pillars

1. **Capture with confidence** – accessible forms, validation feedback, and keyboard shortcuts.
2. **Stay in flow** – search, filters, live stats, and a context-aware summary keep momentum high.
3. **Own your data** – local persistence plus JSON export/import features respect user autonomy.
4. **Delight responsibly** – theme toggling, subtle motion, and product copy add personality without sacrificing clarity.

## Technical Decisions

- **No framework** to emphasise fundamentals, ownership of bundle size, and readability for reviewers.
- **Modular JavaScript** using pure functions and DOM APIs; optional chaining avoided for compatibility.
- **CSS variables + data attributes** power theming and skip rebuild costs.
- **localStorage** for persistence paired with import/export to enable backups and cross-browser usage.
- **Progressive enhancement**: edit dialog degrades to `alert()` if `<dialog>` is unsupported.
- **Seed data** gives recruiters immediate context when they open the page.

## Challenges & Solutions

| Challenge | Response |
| --- | --- |
| Maintaining clarity between new features and archive history | Restructured repo with `archive/` and added README callouts. |
| Theme switching without a framework | Data attributes + CSS variables + media query listeners. |
| Import validation | Normalised tasks, generated IDs when missing, guarded against malformed JSON. |
| Communicating impact | Created this case study, README highlights, and usage instructions. |

## Results

- Theme toggle with automatic system preference detection.
- JSON import/export workflow with validation and graceful status messaging.
- Keyboard shortcut (`⌘/Ctrl + K`) for search focus.
- Recruiter-friendly README + component breakdown documentation.
- Archived prototypes demonstrating growth path.

## Next Steps

- Hook into Supabase or GitHub Issues for multi-device sync.
- Add unit tests (Jest/Vitest) and smoke tests (Playwright) with CI.
- Deploy to GitHub Pages and embed analytics for engagement insights.
- Explore "Focus Sessions" (Pomodoro timers, streak tracking) as optional modules.

## Learning Reflection

The project reinforced that strong front-end storytelling is a combination of code quality, documentation, and thoughtful defaults. Even without a full backend, the app now feels like something that can live in a portfolio or onboarding assessment.
