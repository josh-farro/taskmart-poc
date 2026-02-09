# TaskMart PoC Training Lab (Static Simulation)

## Summary
TaskMart is a classroom-only Proof of Concept web security training environment:
- Static site only (no backend, no database)
- Client-side logic and persistence via browser localStorage
- "Training Mode" toggles intentionally unsafe DOM sinks in selected components for XSS simulation

## Quick Start (Local)
1. Extract the ZIP
2. From the project root:
   python -m http.server 8080
3. Open:
   http://127.0.0.1:8080/index.html

## Accounts (Simulation)
- student01 / student01 ... student15 / student15
- admin / admin

## Training Mode
- Default: OFF (Safe Mode)
- Toggle: teacher.html
- Effects when ON:
  - Reflected XSS simulation on shop.html search echo (innerHTML sink)
  - Stored XSS simulation on forum.html post bodies (innerHTML sink)
  - Stored XSS simulation on product.html review bodies (innerHTML sink)
- Effects when OFF:
  - The same components render via textContent (safe output encoding)

## Reset
- teacher.html: reset data per-browser (localStorage)
- admin.html: reset data per-browser (localStorage)
- Reset does not affect other students' browsers.

## Hosting
Use any static host (GitHub Pages, Netlify, Vercel Static, Render Static).
Recommendation: keep Training Mode OFF for anything public.

## Ethics
Use only in authorized educational contexts. This is a simulation and must not be used to target real systems.
