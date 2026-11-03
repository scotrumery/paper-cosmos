# Paper Cosmos

An original, offline canvas game: an origami explorer climbs folded constellations,
collects stars, and avoids ink clouds. All artwork is drawn procedurally, with no
external assets or copied Copilot artwork or code.

## Launch

Double-click `index.html` in `C:\Users\scot\Code\Games\PaperCosmos`, or open it
from your browser's File > Open menu. Use a current Edge, Chrome, Firefox, or
Safari browser with JavaScript enabled. Keep `index.html`, `styles.css`, and
`game.js` together. No server, installation, build step, or internet is required.

## Play

- Click **Begin exploring**, or press **Space / Enter**.
- Steer with **Left / Right** or **A / D**.
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
  Its HUD countdown changes to an ascent-speed indicator. Touching the edge
  with your feet ends the run, even if you were standing on a platform.
  You cannot wait indefinitely. Jump early and keep climbing.
- Avoid the dark ink clouds. Hitting one or falling below the view ends your run.
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
physics at every size, so it is scaled to fit. Windows that are wider or taller
than 4:3 show dark margins beside or above and below the playfield instead of
stretching it. For edge-to-edge play, combine focus mode with your browser's
own full screen (usually **F11**).

Best score is saved in this browser where local storage is permitted. File-based
storage policies vary between browsers. If reading or writing storage fails, a
visible notice explains that best score lasts only for this visit; play still works.
Scores are saved on pause, game over, and page departure.

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
cannot be skipped without a boost. Clouds stay outside the normal route's full
movement envelopes and normal-height side hops, including overlapping jump
overshoots from earlier platforms.

The unraveling starts at world y=688 (32 units above the initial bottom).
After four active seconds, its timed speed rises continuously from zero using
`24 * (1 - exp(-u / 3)) + 86 * (1 - exp(-u / 90))` units/s, where `u` is
active time after the grace period. Speed is about 26 units/s at 10 seconds,
46 at 30, 64 at 60, 86 at 120, and approaches 110. Its analytically integrated
distance is independent of frame rate. Jump, gravity, steering, and platform
motion speeds do not accelerate. Climbing quickly also brings the edge up to
32 units above the screen bottom, so you cannot build an unlimited safety lead;
it never moves back down. This camera catch-up is separate from the smoothly
increasing timed speed shown in the HUD.

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
The motion envelopes remain inside normal-jump steering reach, and ink stays
outside the boost landing lane. Contact from the side or underside still boosts
automatically, but starting lower can reduce how many rows you skip. Normal
Space jumps, platform speeds and the unraveling's acceleration are unchanged.

There is **one collectible star per four higher levels**, on the normal-route
platform, down from one on every platform in the original game. Stars follow
their host platforms. Ink placement is attempted every second higher level
after the first two, but only where safe clearance
exists. Height and star point values are unchanged. Best scores use a new save
slot for the rising-unraveling ruleset; older records are kept untouched but
are not shown.

Keyboard play only. No audio, touch controls, accounts, network requests, runtime
dependencies, or desktop packaging.

## License

Paper Cosmos is released under the [MIT License](LICENSE).
Copyright (c) 2026 Scot Rumery.
