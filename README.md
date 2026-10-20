# Ten Heads Of Fire

PROJECT: RAVAN DAHAN — A COMPLETE, IMMERSIVE INTERACTIVE WEB EXPERIENCE

Build a complete, polished, fully functional and visually stunning Ravan Dahan website. This must be a real working website, not just a static design, mockup, or prototype.

The experience should feel cinematic, festive, devotional, interactive and premium, with detailed vector artwork, smooth animations, realistic-looking fire effects, smoke, sparks, fireworks and synchronized sound effects.

Use your full capabilities to create the best possible result. Do not simplify the project into a basic landing page.

VISUAL THEME AND ART DIRECTION

Use a premium dark Indian festive theme:

Deep navy and midnight-blue background.

Gold, saffron, orange and warm amber accents.

Cinematic night sky with stars, subtle atmospheric particles and glowing lights.

A traditional Dussehra-inspired environment with a ground, distant silhouettes and a festive atmosphere.

Smooth transitions, beautiful lighting, depth, shadows, gradients and carefully designed visual details.

Clean, consistent vector illustrations instead of random stock images, emojis or generic placeholders.

The website must be responsive and work properly on desktop, laptop, tablet and mobile.

Avoid excessive scrolling. Keep the main experience focused around a large central visual preview with relevant controls on the sides or in clearly organized panels.

2. HOME SCREEN

Create a visually impressive opening screen featuring:

A prominent “Jai Shri Ram” heading.

A beautifully illustrated ten-headed Ravan.

A subtle animated night sky, floating particles and glowing embers.

A clear “Customize Your Ravan” button.

A secondary “Start Dahan” or “Enter the Arena” action where appropriate.

Smooth entrance animations and tasteful hover effects.

An optional sound toggle that respects browser autoplay restrictions.

The first screen should immediately communicate the purpose and quality of the experience.

3. CUSTOMIZABLE TEN-HEADED RAVAN

Create an original, clean, detailed SVG/vector illustration of traditional Ravan with exactly ten heads.

Requirements:

One central head with the remaining nine heads arranged symmetrically in a traditional composition.

All ten heads must be visible, properly aligned and proportioned.

Detailed crowns, facial features, moustaches, ornaments, clothing, jewellery and traditional colours.

Detailed body, arms, hands, clothing, waist ornaments and other appropriate visual elements.

Consistent illustration style across the entire character.

Separate visual elements wherever practical so they can be animated independently during the burning sequence.

Custom face upload

Allow the user to upload a photo from their device and apply that same face to all ten heads.

Include:

Image upload and replacement.

An oval face crop.

Drag-to-position controls.

Zoom in and out.

Rotation controls.

A live preview before applying.

Apply, reset and remove-photo options.

Proper clipping and alignment so the face fits naturally inside every head.

Consistent face placement across all ten heads.

The uploaded image must be processed locally in the browser using Canvas, SVG masks or equivalent client-side techniques. Do not upload the photo to a server, database or analytics service.

Do not let the custom photo distort the crowns, hair, moustache or surrounding artwork. Design the face areas and masks carefully.

4. SHRI RAM ILLUSTRATION AND ARROW

Create an original, attractive SVG/vector illustration of Shri Ram.

Include appropriate traditional attire, ornaments, a bow, a quiver and a respectful devotional presentation. Maintain a consistent visual style with the Ravan illustration.

Shri Ram should remain a static illustration during the main interaction. The bow-and-arrow action should be animated separately.

Create a polished sequence:

The user activates the arrow-triggered Dahan mode.

The bow-drawing animation begins.

The arrow is released.

The arrow travels towards Ravan along a smooth, visually convincing trajectory.

Add a subtle motion trail, glowing particles and a suitable arrow-flight sound.

The arrow reaches its target.

A synchronized impact effect triggers the ignition sequence.

Make the arrow animation smooth and responsive. It must reach the correct target even when the screen size changes.

5. TWO DHAN MODES

Provide two fully functional modes.

Mode A: Arrow-triggered Dahan

Shri Ram's arrow animation triggers the burning sequence automatically upon impact.

Mode B: Manual Dahan

Allow the user to start the burning sequence using a clear “Ignite Ravan” button.

Both modes must lead to the same high-quality burning animation and finale.

Include a confirmation or preparation step where appropriate so the user does not accidentally trigger the sequence.

6. CINEMATIC RAVAN DAHAN ANIMATION

This is one of the most important parts of the project. Do not make the burning effect look like a simple orange overlay.

Create a staged animation lasting approximately 12–18 seconds.

Stage 1: Arrow impact

A bright impact flash.

A short burst of sparks.

A localized ignition effect.

Synchronized impact audio.

Stage 2: Body ignition

Flames begin around the lower body.

Fire spreads upward along the clothing and torso.

Multiple flame layers create depth.

Glowing embers rise naturally.

Smoke begins to appear and gradually increases.

Stage 3: Torso and arms burn

Flames spread across the torso and arms.

Parts of the character progressively disappear or become charred.

Use separate SVG groups or masks for different body sections.

Avoid a single flat opacity fade for the entire character.

Stage 4: Ten heads ignite

The flames spread towards the heads and crowns.

The heads ignite progressively in a visually satisfying sequence.

Each head must burn at the correct position.

Crowns, ornaments and facial artwork should disappear or char in coordination with the fire.

Ensure the custom face images are removed along with their respective head masks during the burning animation.

Stage 5: Final burst

A dramatic but tasteful fire burst.

Dense smoke, embers and sparks.

A festive fireworks sequence in the background.

The Ravan illustration should be completely gone by the end of the burning sequence.

Use layered SVG, CSS animations, Canvas particles or a suitable combination. Keep performance smooth and avoid unnecessary heavy effects.

The fire, smoke and particles must be genuine animated visual effects, not static images simply placed over the character.

7. COMPLETE SOUND SYSTEM — VERY IMPORTANT

Create a dedicated sound management system. All sound effects must be independently configurable and replaceable.

Do not hardcode audio files throughout different components. Do not put all sounds into one file.

Required project folder structure

Create a clearly organized folder inside the actual project for all audio assets. Use a structure similar to this:

public/

└── sounds/

 ├── README.md

 ├── background/

 │ ├── festive-ambience.mp3

 │ └── devotional-instrumental.mp3

 ├── intro/

 │ └── temple-bell.mp3

 ├── bow-arrow/

 │ ├── bow-draw.mp3

 │ ├── arrow-release.mp3

 │ └── arrow-flight.mp3

 ├── impact/

 │ └── arrow-impact.mp3

 ├── fire/

 │ ├── ignition.mp3

 │ ├── fire-crackle.mp3

 │ ├── fire-roar.mp3

 │ └── burning-burst.mp3

 ├── smoke/

 │ └── smoke-whoosh.mp3

 ├── fireworks/

 │ ├── firework-launch.mp3

 │ ├── firework-burst.mp3

 │ └── fireworks-finale.mp3

 └── finale/

 └── victory-celebration.mp3

This is the intended organization. Adjust filenames if necessary, but preserve the separation by category and document the final structure.

Create all folders in the real project, not just in the documentation or a text example.

Why the folders matter

I must be able to open the project later and independently replace:

Background ambience.

Devotional instrumental ambience.

Temple bell.

Bow drawing.

Arrow release and flight.

Arrow impact.

Fire ignition.

Fire crackling and roaring.

Smoke whoosh.

Firework launches and explosions.

Final celebration sound.

Replacing a sound file with another compatible file at the same path should work without requiring changes to the animation code.

Audio implementation requirements

Create a centralized audio manager or equivalent reusable sound service.

Keep all audio paths in one clearly documented configuration file.

Trigger sound effects at the correct animation events and timestamps.

Support independent master volume, background music volume and sound-effects volume.

Include a global mute/unmute button.

Include an option to turn background music off while keeping sound effects enabled.

Prevent unwanted overlapping audio and repeated playback.

Stop or clean up relevant sounds when replaying, resetting or leaving the experience.

Avoid abrupt audio cuts where a fade-out would be more appropriate.

Keep audio synchronized with the arrow release, impact, ignition, burning stages and fireworks.

Do not start audio before browser interaction when autoplay restrictions prevent it.

Make the experience usable even when sound is disabled.

Use supported audio formats and handle loading or playback errors gracefully.

Real audio files are mandatory

Do not create empty audio files, fake sound paths, silent placeholders or code that pretends to play sounds.

Use actual original, generated or properly licensed sound assets wherever possible. If the platform can generate audio assets, generate them and place them in the appropriate folders.

If you cannot generate or supply a particular audio file, explicitly report which file is missing and what compatible file I need to add. Do not silently claim that the sound system is complete.

Include a README.md inside the sounds folder explaining:

The purpose of each sound.

The exact file paths used by the application.

Recommended formats and file naming conventions.

How to replace an existing sound.

How to add a new sound.

Which animation event triggers each sound.

Keep the implementation organized so I can add, remove, replace or adjust sounds in the future without rewriting the entire project.

8. FIRE, SMOKE, PARTICLES AND FIREWORKS

Create a reusable visual-effects system with independently configurable effects.

Include:

Multi-layer animated flames.

Rising embers.

Small and large sparks.

Smoke wisps and expanding smoke clouds.

Glowing particles around the burning character.

Background fireworks during the finale.

Suitable glow, blur and lighting effects.

Adjustable particle density and animation intensity where practical.

Keep performance in mind. Use efficient Canvas particle rendering or another appropriate technique, and avoid creating excessive DOM elements.

On smaller devices, reduce the particle count or effect complexity when necessary without breaking the experience.

9. FINALE SCREEN

Once the burning sequence is complete, display a polished finale with:

“Vijayadashami”

“Burai par Achhai ki Vijay”

A subtle fireworks or glowing-embers background.

A “Watch Again” button.

A “Customize Again” button.

A “Download Ravan Image” option.

A “Share Experience” option.

Allow the user to download the customized Ravan illustration as an image where technically feasible.

For sharing, use the Web Share API when supported and provide a proper fallback, such as copying the website URL. Do not show fake success messages if sharing or downloading fails.

10. INTERFACE AND INTERACTIONS

Create a polished, consistent interface with:

A large central preview.

Side controls or compact panels.

Smooth transitions between home, customization, setup, arena and finale.

Clear buttons and labels.

Useful loading and error states.

Responsive layouts.

Keyboard accessibility where practical.

Properly visible focus states.

A fullscreen option.

A sound settings panel.

A reduced-motion option for users who prefer fewer animations.

Every visible button must perform its stated function. Do not include decorative controls that do nothing.

Use clear, easy-to-understand language throughout the interface.

11. TECHNICAL IMPLEMENTATION

Use the framework already supported by the selected website builder. Do not unnecessarily replace the existing project structure.

If building from scratch, React with TypeScript is a suitable option.

Use:

SVG for the characters and other vector artwork.

CSS animations or an appropriate animation library for transitions.

Canvas for the face-cropping editor or particle systems where useful.

A centralized application state to control each stage of the experience.

A centralized audio manager.

A centralized sound-path configuration.

Reusable components for the major interface sections.

Clean separation between visual assets, audio assets, UI, animation logic and application state.

Use a predictable animation state flow such as:

idle → customizing → ready → arrow_flight → ignition → progressive_burn → finale → complete

The manual ignition mode should transition directly from the ready state into ignition.

Prevent duplicate animation triggers. Disable or appropriately manage conflicting buttons while an animation is running.

When the user chooses to replay, restore the original character, face masks, particles, animation states and audio playback correctly.

Ensure the website can be run locally and deployed to a static hosting platform such as GitHub Pages or Netlify, subject to the framework's build requirements. Avoid unnecessary backend services, authentication or databases.

12. PRIVACY AND RELIABILITY

Process uploaded face images entirely in the browser.

Do not send uploaded images to any server.

Do not store the uploaded image remotely.

Validate uploaded files and handle unsupported image formats gracefully.

Handle missing audio assets without crashing the website.

Clean up timers, animation loops and audio resources when resetting or leaving the experience.

Ensure all local asset paths work in the actual production build.

Test responsive behaviour and avoid broken layouts.

13. ORIGINAL ARTWORK REQUIREMENTS

Create the actual artwork required by the website.

Do not simply describe what the artwork should look like. Generate and implement the actual SVG/vector markup or appropriate visual assets.

Required original artwork includes:

Ten-headed Ravan.

Shri Ram.

Bow and arrow.

Background environment.

Ground and distant silhouettes.

Flames.

Smoke.

Embers and sparks.

Firework effects.

Do not substitute emoji, generic coloured circles, empty image boxes or unrelated stock images for these main elements.

Keep important artwork separated into logical groups so it can be edited and animated independently.

If any visual element cannot be created directly by the platform, clearly identify that limitation and implement the best functional alternative available.

14. FINAL TESTING CHECKLIST

Before considering the project complete, verify all of the following:

The home screen works.

The Ravan has exactly ten visible heads.

The custom face can be uploaded, cropped, positioned, zoomed and applied.

The same face appears correctly on all ten heads.

The face image stays local to the browser.

Shri Ram and the arrow render correctly.

Arrow-triggered Dahan works.

Manual Dahan works.

The burning sequence lasts approximately 12–18 seconds.

Body, torso and heads burn progressively.

Smoke, sparks, embers and fireworks animate properly.

Every available sound file actually plays.

Each sound is synchronized with the relevant event.

Background music and sound effects have independent volume controls.

Mute and unmute work correctly.

All sound files are organized in separate folders by category.

The sound-path configuration is centralized and documented.

Replacing a compatible sound file does not require rewriting animation code.

Replay does not duplicate animations or sounds.

Download and sharing actions work or show an honest fallback.

Fullscreen works where supported.

The website works on desktop and mobile.

No major buttons are broken.

No missing assets are silently presented as completed features.

15. FINAL DELIVERY REQUIREMENTS

Build the complete working website, not merely a plan or design preview.

At the end, provide a concise project summary that tells me:

What features are working.

Which visual assets have actually been created.

Which sound files have actually been supplied.

The complete location of the sounds folder.

How to replace any sound file.

Whether all features have been tested.

Any limitations or missing assets that still need attention.

Final priority: Deliver a complete, polished, visually impressive and functional Ravan Dahan experience with editable vector artwork, customizable faces, cinematic animations and a properly organized, independently replaceable sound library.

Do not claim a feature is complete unless it has actually been implemented and verified.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ten-heads-of-fire.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8993571a-8419-5e63-bf7b-1e0419502f83).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
