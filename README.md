# Paper Cosmos

An original, offline canvas game: an origami explorer climbs folded constellations,
collects stars, and avoids ink clouds. All artwork is drawn procedurally, with no
external assets or copied Copilot artwork or code.

## Launch

Clone or download this repository to any folder on your computer. If you download
a ZIP, extract it first. Double-click `index.html` in that folder, or open it
from your browser's File > Open menu. Use a current Edge, Chrome, Firefox, or
Safari browser with JavaScript enabled. Keep `index.html`, `styles.css`, and
`game.js` together. No server, installation, build step, or internet is required.

## Play

- Click **Begin exploring**, or press **Space / Enter**.
- Steer with **Left / Right** or **A / D**.
- On a touch device, **hold the Left/Right buttons** below the playfield to
  steer and **tap Jump** with your other thumb. Multi-touch lets you steer and
  jump together. Holding Jump does not repeat jumps, and tapping while airborne
  does not grant an air jump. Releasing/canceling touches, pausing, leaving the
  app, or restarting clears held steering. Opposite directions cancel each other.
  Solar Fold boosts remain automatic.
- Press **Space** to jump **only while standing on a normal platform**. Release it and
  press again for the next jump. Holding Space does not repeat jumps; there are
  no air jumps or automatic bounces on normal platforms. Starting a run leaves you standing still.
- Land on the top of normal folded platforms to rest. You pass through them from below.
  Moving platforms carry you; walk off an edge and you fall. Their dotted tracks
  mark their full horizontal travel. Line up and time your jumps to higher levels.
- Levels have multiple landing platforms. Choose a side fold or keep climbing
  the normal route; the dotted constellation line connects all platforms.
- **Solar folds** are optional side platforms with a golden origami fan,
  upward chevron, gold frame, and `SOLAR FOLD` label. **Touch anywhere inside
  the gold frame to launch automatically**, from above, beside, or below.
  No Space press or landing is needed. The frame encloses the platform and fan
  (the full platform width, from 32 units above its surface to 13 below).
  Each pad triggers once per continuous contact, not every frame. Separate
  completely and touch it again to get another boost, even without pressing Space.
  Pausing or losing focus does not re-arm an ongoing contact; restarting clears
  all contact state. The boost can skip a level, but the normal route never needs it.
  A pad consumed by the rising edge cannot be reused; aim for a higher landing.
- Collect stars for **25 stardust** each and a gold-and-mint sparkle burst,
  expanding ring, and floating `+25`. Each star scores and sparkles only once.
  Climbing also earns **1 per 10 height units**.
- **Stay ahead of the unraveling.** After a four-second grace period, the
  coral paper edge rises and consumes every platform whose top reaches it.
  Both its world ascent speed and its position above the screen bottom tighten
  smoothly throughout the run. The HUD shows speed in world units/second,
  extra floor rise above its original position, and your feet's lead over it.
  Touching the edge
  with your feet ends the run, even if you were standing on a platform.
  You cannot wait indefinitely. Jump early and keep climbing.
- Every run uses the **progressive all-four combo**, beginning with the original published
  quiet ink, then gradually mixes in sweeps, patrols, and occasional lunges as
  active play time grows. A brief desktop stage cue above the game announces the mix.
  The desktop **Restart** button starts a fresh run from the gentle introduction.
  Watch the dotted travel lanes: moving ink crosses the normal
  jump corridors instead of staying safely at the edges. **Solid ink is lethal;
  hollow ink is harmless.** Falling below the view also ends your run.
- Press **P / Esc**, or use the **Pause / Resume** button. Returning to the window
  does not automatically resume: lost focus or a hidden tab pauses and clears
  steering. The edge, difficulty clock, and sparkle effects all freeze while paused.
- Click **Explore again**, or press **Space / Enter** after a run to start fresh.

### Focus mode

Click **Focus mode** (top right of the game) or press **F** to hide the
title, instructions, and page decoration. The game then uses the whole browser
window, keeping score, best, the unraveling bar, status, and the Pause and
**Exit focus** buttons. Press **Esc**, **F**, or **Exit focus** to return to
the normal page. In focus mode, Esc exits focus and pauses a running climb;
**P** still pauses and resumes. The 960 x 720 world keeps its 4:3 shape and
physics on desktop, so it is scaled to fit. Windows that are wider or taller
than 4:3 show dark margins beside or above and below the playfield instead of
stretching it. For edge-to-edge play, combine focus mode with your browser's
own full screen (usually **F11**).

### Mobile layout

Phones and small touch tablets automatically use a compact game-only layout.
The mobile HUD hides the ink-stage and Restart row to leave more height for
the climb. Restart a finished run from the game-over screen.
Touch controls sit **outside the canvas**, so thumbs do not cover hazards or
platforms. **Portrait is the preferred mobile layout**: the canvas fills the
available tall space and reveals additional world above the normal play area.
The full 960-unit width is retained and artwork scales uniformly, without
changing jump physics or rising-floor pressure. Landscape still works with an
aspect-preserving fit. The extra portrait look-ahead can show future rows sooner;
ink retains its generation-time behavior. Browser-bar resizing and safe-area insets are
accounted for. Touching the controls does not scroll/zoom the page; browser
zoom is not disabled globally. Use the overlay to begin, resume, or restart a
finished run; Pause remains in the top score row. Keyboard play remains available.

### Four ink behaviors

1. **Original quiet ink:** the published stationary, 27-unit-radius blots.
   Placement is attempted every second row after row two, but only outside the
   original normal-jump, moving-platform, side-hop, and Solar Fold corridor
   exclusions. Its interior animates; its position stays fixed. Solid ink is
   still lethal if you take a side detour into it. This is the gentle introduction,
   not a new aggressive variant.
2. **Comet sweep:** an amber dashed lane and `INCOMING` cue warn for **1.2s**,
   followed by a **1.2s** crossing. It rests harmlessly for **2.6s** before
   warning and sweeping back the other way.
3. **Orbit patrol:** solid ink moves continuously back and forth along a
   350-unit horizontal lane. Jump behind it or go around its footprint.
4. **Snapshot lunge:** a crosshair locks a bounded snapshot of your position.
   It warns for **1.25s**, lunges for **0.45s**, and holds for **0.18s**.
   Move away from the locked target; it never tracks you during the warning
   or strike. Its **0.8s retreat** and **2.6s rest** are harmless.

The three moving behaviors get a harmless **one-second wake-up** when you approach within
420 vertical units from below (or approach from above). Sweeps and lunges then
give their full warning before their first attack. One moving 24-unit-radius hazard
is placed in the gap before each fourth row, centered on the normal route's
travel corridor. Its lane extends 175 units each way; gaps of three intervening
rows separate moving hazards. Lunges can reach 65 units up/down from their home height
and 175 units sideways. Collisions sweep relative motion, including boosted
flight and fast ink, against the explorer's full rectangle.

Landing geometry and the third-row boost are unchanged, but their corridors
are **not permanently ink-free** once moving ink joins: timing and avoidance matter. Plan
before jumping or touching gold. A platform is not an unlimited safe waiting
place because the rising floor continues to close. Pausing, focus loss, and a
hidden tab freeze ink motion, warning clocks, the floor, and particles together.
Restart resets all attacks, targets, weights, and the active-time stage clock.
Every run uses the progressive combo.

### Progressive mix

The transitions use smoothstep (`s*s*(3-2*s)`, with `s` clamped from 0 to 1)
over **active seconds**, never wall-clock time:

| Active run time | What changes for newly generated ink |
|---|---|
| 0-20s | Original quiet ink only |
| 20-50s | Sweep weight rises smoothly; original weight falls |
| 50-60s | Sweep-dominated introduction |
| 60-100s | Patrols gradually join the sweep mix |
| 100-110s | Patrol/sweep mix |
| 110-160s | Occasional lunges gradually join as variety, not a hardest-mode replacement |
| 160s onward | Stable varied mix; the floor still accelerates |

Let `S`, `P`, and `L` be the smooth transitions over 20-50s, 60-100s, and
110-160s respectively. With `M=0.95*S`, the per-candidate weights are
`original=1-M`, `sweep=M*(1-0.55*P-0.20*L)`, `patrol=M*0.55*P`,
and `lunge=M*0.20*L`. Late weights are **5%, 23.75%, 52.25%, 19%**.

Each eligible even row after row two draws once. Original ink uses its faithful
safe-side placement, which can fail if no side is clear. Moving ink is admitted
only on every fourth row, preserving three intervening rows between moving
hazards; other moving draws intentionally spawn nothing. Thus weights are
candidate probabilities, not guaranteed final counts. Before safe-side skips,
late encounters are about 9.5% original / 22.6% sweep / 49.8% patrol / 18.1% lunge.
Original ink cannot dominate late play.

Behavior is assigned **once at generation**, with its birth time recorded.
Already visible blots never change behavior when a stage threshold is crossed.
Generation runs only during active play (apart from the initial quiet preview);
the short look-ahead means a new mix may appear a few rows after its HUD cue.
Moving blots still give their full wake-up and attack warnings when approached.
Every restart starts its clock and introductory weights over at zero.

Best score is saved in this browser where local storage is permitted. File-based
storage policies vary between browsers. If reading or writing storage fails, a
visible notice explains that best score lasts only for this visit; play still works.
Scores are saved on pause, game over, and page departure.

### Clear personal best

Hover over **Personal Best** to reveal a small, subdued reset arrow beside the
number. The arrow is hidden otherwise, with its space reserved to avoid layout
shift. Keyboard users can Tab to the arrow to reveal and activate it with
Enter or Space. There is deliberately no always-visible touch reset control.
Activate it to open a confirmation; **Keep my record** or **Esc** cancels.
A running climb pauses while you decide and stays paused if you cancel.
**Clear best & end run** removes only this game's current best-score storage key,
clears the displayed record, and ends any existing run so its score cannot
immediately restore the record. The next fresh run can earn a new best normally.
Other storage, preferences, and older score keys are left alone.

Records belong to this browser and origin: **the local file and hosted GitHub
Pages game have separate records**. Clear the best in the version you play.
If browser storage blocks removal, the game explicitly reports that the reset
applies only to this visit and the old saved record may return after reload.

The world is **960 x 720** logical units (33% wider than the previous 720-unit
world, and twice the original 480-unit width), with a 4:3 desktop playfield up to
960 CSS pixels wide. Small windows scale the same world uniformly, without
changing jump distances or stretching art.
Physics use 1/120-second steps, with long frame delays bounded to 50 ms.

The jump speed is 760 units/s, gravity 1,700 units/s squared (about 170 units of
maximum rise), and steering speed 300 units/s. Higher platforms are **124-148
units apart vertically**, with **72-94-unit** landing widths (previously 100-128).
Two out of every three normal-route platforms move horizontally, with **24-42-unit
amplitude**. Slow movers use **0.2-0.5 radians/s** (about 12.6-31.4 seconds/cycle);
fast movers use **2.2-3.2 radians/s** (about 2-2.9 seconds/cycle).
Their peak speeds span **4.8-134.4 units/s**, a wider contrast than the previous
10.8-100.8 range. The starting platform is stationary.
Spacing reserves both platforms' full motion envelopes inside 86% of the actual
descending flight-time steering range, minus 12 extra units. Consecutive platform
centers remain reachable even at opposite movement extremes; you still have to
steer and deliberately jump. Two levels exceed the normal jump height, so they
cannot be skipped without a boost. Ink crosses these corridors intentionally;
the motion-envelope checks guarantee platform reach, not automatic hazard avoidance.

The unraveling starts at world y=688 (32 units above the initial bottom).
After four active seconds, its timed speed rises continuously from zero using
`24 * (1 - exp(-u / 3)) + 136 * u / (u + 100)` units/s, where `u` is
active time after the grace period. Speed is about 28 units/s at 10 seconds,
52 at 30, 73 at 60, 97 at 120, 126 at 300, and 140 at 600. It keeps
increasing, approaching 160 (below sustained normal-jump climbing speed, rather
than eventually making every run mathematically impossible). Its analytically integrated
distance is independent of frame rate. Jump, gravity, steering, and platform
motion speeds do not accelerate. The camera-follow floor is now
`32 + 220 * u / (u + 100)` units above the screen bottom, rather than always 32.
It reaches about 111 units at 60 seconds, 150 at 120, 196 at 300, and 220 at 600,
approaching 252. This visibly reduces your lead even while climbing steadily:
the old fixed 32-unit camera clamp masked timed acceleration during fast play.
The actual boundary is whichever is higher, the integrated timed ascent or
this tightening camera floor; it never moves down. Later avoidance windows
are shorter, so use the warnings to commit promptly rather than wait a full cycle.

Consumed platforms, their stars and solar pads, and stale rider/contact
references are removed together before physics. Objects are also pruned below
the view. Restart resets the edge, difficulty clock, and all sparkle bursts.

Every higher level has at least **two platforms**, with a third at every third
level when both sides have room. Side folds are **76-90 units wide**, stationary
or moving with **14-22-unit amplitude** and either **0.3-0.65** or **1.8-2.8
radians/s** frequency (about 9.7-20.9 or 2.2-3.5 seconds/cycle). Their
full movement envelopes never overlap platforms on the same level. Side folds
are placed within 97% of a normal same-height jump's horizontal reach from the
normal-route platform on that level, minus both motion envelopes and 12 extra
units, so they are optional but accessible.
The first side fold on every fourth level is a stationary solar fold when it
can sit clear of the normal jump corridor. Otherwise it is a normal side fold,
so choosing the normal route never forces an automatic boost.
Solar-fold launch speed is **1,040 * sqrt(1.2 * 1.05)** (about **1,167.40 units/s**),
for about **401 units** of rise: **5% higher than the previous 382-unit boost**.
To skip three rows, approach the gold frame from above, then steer toward the
normal-route platform on the third row above the pad. Its three gaps are capped
at **140 units each**. The first stays over the normal route to preserve the
approach; the following two converge toward the pad's lane.
Top contact launches with your feet 32 units above the pad, leaving at least
12.8 units of apex clearance over the third row even at the largest gaps.
The motion envelopes remain inside normal-jump steering reach. Ink can cross
the boost lane, so watch its phase before contact. Contact from the side or underside still boosts
automatically, but starting lower can reduce how many rows you skip. Normal
Space jumps and platform speeds are unchanged.

There is **one collectible star per four higher levels**, on the normal-route
platform, down from one on every platform in the original game. Stars follow
their host platforms. Height and star point values are unchanged. Best scores use the existing save
slot for the rising-unraveling ruleset; older records are kept untouched but
are not shown.

Keyboard and multi-touch play. No audio, accounts, network requests, runtime
dependencies, or desktop packaging.

The unobtrusive game-footer version label is **v1.2**. The display version does
not change the existing best-score storage key.

## License

Paper Cosmos is released under the [MIT License](LICENSE).
Copyright (c) 2026 Scot Rumery.
