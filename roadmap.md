# Roadmap — Spectacular Ravan Dahan upgrade

- [ ] Generate improved, varied sound assets (fireworks launches/bursts/crackle, fire loops, impact, finale) into public/sounds/
- [ ] Update src/lib/sounds.config.ts with new sound keys + variations
- [ ] Rebuild src/lib/fx.ts: layered turbulent flames, heat glow, dense smoke, varied fireworks (chrysanthemum, willow, peony, crackle, ring, secondary bursts), launch/burst/crackle callbacks
- [ ] Extend burn TIMELINE in src/lib/experience.ts (~17s, stays within test bounds)
- [ ] Update src/components/Arena.tsx: staged ignition, continuous background fireworks, finale volley, synced sounds
- [ ] Update public/sounds/README.md asset documentation
- [ ] Run vitest + check build log
- [ ] Playwright: run full Dahan, screenshot stages, check console errors + audio requests
