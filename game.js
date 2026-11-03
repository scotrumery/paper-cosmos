"use strict";

const W = 960;
const H = 720;
const GRAVITY = 1700;
const JUMP = 760;
const BOOST_JUMP = 1040 * Math.sqrt(1.2 * 1.05);
const SPEED = 300;
const STEP = 1 / 120;
const PLAYER_W = 28;
const PLAYER_H = 36;
const FRONTIER_GRACE = 4;
const FRONTIER_START = H - 32;
const SPARKLE_LIFE = .9;
const BEST_KEY = "paper-cosmos.best.v3";
const canvas = document.getElementById("cosmos");
const ctx = canvas.getContext("2d");
const ui = {
  score: document.getElementById("score"),
  best: document.getElementById("best"),
  pause: document.getElementById("pause"),
  overlay: document.getElementById("overlay"),
  kicker: document.getElementById("overlay-kicker"),
  title: document.getElementById("overlay-title"),
  copy: document.getElementById("overlay-copy"),
  primary: document.getElementById("primary"),
  hint: document.getElementById("overlay-hint"),
  status: document.getElementById("status"),
  storage: document.getElementById("storage-note"),
  pressure: document.getElementById("pressure"),
  focus: document.getElementById("focus"),
  footerHint: document.getElementById("footer-hint")
};
const keys = new Set();
const boostContacts = new Set();
let spaceHeld = false;
let best = 0;
let persistence = true;
let mode = "ready";
let player;
let platforms;
let stars;
let clouds;
let camera;
let highest;
let collected;
let score;
let nextId;
let accumulator = 0;
let lastTime = null;
let sceneTime = 0;
let frontier;
let sparkles;

function storageUnavailable() {
  persistence = false;
  ui.storage.hidden = false;
  ui.storage.textContent = "Best score is kept for this visit only. Browser storage is unavailable; you can still play normally.";
}

try {
  const saved = localStorage.getItem(BEST_KEY);
  if (saved !== null) {
    const value = Number(saved);
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid saved best score");
    best = value;
  }
  localStorage.setItem(BEST_KEY, String(best));
} catch (error) {
  console.warn("Paper Cosmos: best-score persistence unavailable.", error);
  storageUnavailable();
}
ui.best.textContent = String(best);

function random(min, max) { return min + Math.random() * (max - min); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function platformXAt(platform, time) {
  return platform.baseX + Math.sin(time * platform.frequency + platform.phase) * platform.amplitude;
}

function resetWorld() {
  player = { x: W / 2, y: 620 - PLAYER_H, vy: 0, lean: 0, groundId: 0 };
  platforms = [{ id: 0, level: 0, route: true, x: W / 2 - 65, baseX: W / 2 - 65, y: 620, w: 130, amplitude: 0, phase: 0, frequency: 0 }];
  stars = [];
  clouds = [];
  camera = 0;
  highest = 0;
  collected = 0;
  score = 0;
  nextId = 1;
  accumulator = 0;
  sceneTime = 0;
  frontier = FRONTIER_START;
  sparkles = [];
  keys.clear();
  boostContacts.clear();
  generatePlatforms();
  updateScore();
  updatePressure();
}

function pressureSpeed(time) {
  const active = Math.max(0, time - FRONTIER_GRACE);
  return -24 * Math.expm1(-active / 3) - 86 * Math.expm1(-active / 90);
}

function pressureDistance(time) {
  const active = Math.max(0, time - FRONTIER_GRACE);
  return 24 * (active + 3 * Math.expm1(-active / 3)) +
    86 * (active + 90 * Math.expm1(-active / 90));
}

function updatePressure() {
  ui.pressure.textContent = sceneTime < FRONTIER_GRACE ?
    "UNRAVELING IN " + Math.ceil(FRONTIER_GRACE - sceneTime) + "s - KEEP CLIMBING" :
    "UNRAVELING " + Math.round(pressureSpeed(sceneTime)) + " /s - STAY ABOVE THE CORAL EDGE";
}

function pruneWorld() {
  platforms = platforms.filter(p => p.y < frontier && p.y < camera + H + 80);
  const liveIds = new Set(platforms.map(p => p.id));
  stars = stars.filter(s => liveIds.has(s.platform.id));
  clouds = clouds.filter(c => c.y - c.r < frontier && c.y < camera + H + 80);
  if (!liveIds.has(player.groundId)) player.groundId = null;
  for (const id of boostContacts) {
    if (!liveIds.has(id)) boostContacts.delete(id);
  }
}

function generatePlatforms() {
  while (platforms[platforms.length - 1].y > camera - 220) {
    const previous = platforms[platforms.length - 1];
    // Use the descending intersection of the jump arc, not its full flight time.
    const jumpHeight = JUMP * JUMP / (2 * GRAVITY);
    const solar = platforms.find(p => p.boost && nextId > p.level && nextId <= p.level + 3);
    const gap = random(jumpHeight * .73, solar ? 140 : jumpHeight * .87);
    const landingTime = (JUMP + Math.sqrt(JUMP * JUMP - 2 * GRAVITY * gap)) / GRAVITY;
    const width = random(72, 94);
    const amplitude = nextId % 3 === 0 ? 0 : random(24, 42);
    // Reserve both motion envelopes: even opposite extremes remain within steering range.
    const maxShift = SPEED * landingTime * .86 - previous.amplitude - amplitude - 12;
    const oldCenter = previous.baseX + previous.w / 2;
    const shift = random(maxShift * .65, maxShift) * (Math.random() < .5 ? -1 : 1);
    // Keep the entry row over the normal route; the next two converge toward the pad.
    const solarCenter = solar && solar.baseX + solar.w / 2;
    const nextCenter = solar ?
      oldCenter + (nextId === solar.level + 1 ? 0 :
        clamp(solarCenter - oldCenter, -maxShift, maxShift)) : oldCenter + shift;
    const center = clamp(nextCenter, width / 2 + amplitude + 24, W - width / 2 - amplitude - 24);
    const level = nextId++;
    const platform = {
      id: level, level, route: true, x: center - width / 2, baseX: center - width / 2,
      y: previous.y - gap, w: width, amplitude,
      phase: random(0, Math.PI * 2),
      frequency: level % 2 === 0 ? random(2.2, 3.2) : random(.2, .5)
    };
    platform.x = platformXAt(platform, sceneTime);
    addBranches(platform);
    platforms.push(platform);
    if (platform.id % 4 === 0) stars.push({ platform, taken: false });
    const radius = 27;
    const cloudY = platform.y + gap * .48;
    let corridorLeft = Math.min(oldCenter, center);
    let corridorRight = Math.max(oldCenter, center);
    // Earlier jumps can overshoot into this gap. Clear every overlapping jump arc.
    const route = platforms.filter(p => p.route);
    for (let i = route.length - 1; i > 0; i--) {
      const launch = route[i - 1];
      if (launch.y - jumpHeight - PLAYER_H > cloudY + radius) break;
      if (launch.y < cloudY - radius) continue;
      const destination = route[i];
      corridorLeft = Math.min(corridorLeft, launch.baseX + launch.w / 2 - launch.amplitude, destination.baseX + destination.w / 2 - destination.amplitude);
      corridorRight = Math.max(corridorRight, launch.baseX + launch.w / 2 + launch.amplitude, destination.baseX + destination.w / 2 + destination.amplitude);
    }
    // Keep normal-height hops between a level's side folds clear too.
    for (const p of platforms) {
      if (p.y - jumpHeight - PLAYER_H > cloudY + radius || p.y < cloudY - radius) continue;
      corridorLeft = Math.min(corridorLeft, p.baseX + p.w / 2 - p.amplitude);
      corridorRight = Math.max(corridorRight, p.baseX + p.w / 2 + p.amplitude);
    }
    for (const p of platforms) {
      if (!p.boost || cloudY + radius < p.y - 32 - BOOST_JUMP * BOOST_JUMP / (2 * GRAVITY) - PLAYER_H ||
          cloudY - radius > p.y) continue;
      corridorLeft = Math.min(corridorLeft, p.baseX - PLAYER_W / 2);
      corridorRight = Math.max(corridorRight, p.baseX + p.w + PLAYER_W / 2);
    }
    const left = corridorLeft - 65;
    const right = corridorRight + 65;
    const safeSides = [];
    if (left > radius * 2 + 20) safeSides.push([radius + 12, left - radius - 8]);
    if (right < W - radius * 2 - 20) safeSides.push([right + radius + 8, W - radius - 12]);
    if (platform.id > 2 && platform.id % 2 === 0 && safeSides.length) {
      const side = safeSides[Math.floor(Math.random() * safeSides.length)];
      clouds.push({ x: random(side[0], side[1]), y: cloudY, r: radius, phase: random(0, Math.PI * 2) });
    }
  }
}

function addBranches(route) {
  const count = route.level % 3 === 0 ? 2 : 1;
  let firstDirection = Math.random() < .5 ? -1 : 1;
  for (let index = 0; index < count; index++) {
    const boost = index === 0 && route.level % 4 === 0;
    const width = random(76, 90);
    const amplitude = !boost && (route.level + index) % 2 === 0 ? random(14, 22) : 0;
    const envelope = route.amplitude + amplitude;
    const minDistance = (route.w + width) / 2 + envelope + 16;
    const maxDistance = SPEED * (2 * JUMP / GRAVITY) * .97 - envelope - 12;
    const distance = random(minDistance, maxDistance);
    const routeCenter = route.baseX + route.w / 2;
    const directions = index ? [-firstDirection] : [firstDirection, -firstDirection];
    const candidates = [];
    for (const direction of directions) {
      const center = clamp(routeCenter + direction * distance, width / 2 + amplitude + 24, W - width / 2 - amplitude - 24);
      if (Math.abs(center - routeCenter) < minDistance) continue;
      let safeBoost = boost;
      if (boost) {
        let left = routeCenter - route.amplitude;
        let right = routeCenter + route.amplitude;
        for (const p of platforms) {
          if (!p.route || p.y - JUMP * JUMP / (2 * GRAVITY) - PLAYER_H > route.y + 13) continue;
          left = Math.min(left, p.baseX + p.w / 2 - p.amplitude);
          right = Math.max(right, p.baseX + p.w / 2 + p.amplitude);
        }
        safeBoost = center + width / 2 < left - PLAYER_W / 2 - 8 ||
          center - width / 2 > right + PLAYER_W / 2 + 8;
      }
      candidates.push({ center, direction, boost: safeBoost });
    }
    const chosen = candidates.find(candidate => candidate.boost) || candidates[0];
    if (!chosen) continue;
    const branch = {
      id: "side-" + route.level + "-" + index, level: route.level, route: false, boost: chosen.boost,
      x: chosen.center - width / 2, baseX: chosen.center - width / 2, y: route.y,
      w: width, amplitude, phase: random(0, Math.PI * 2),
      frequency: (route.level + index) % 4 === 0 ? random(.3, .65) : random(1.8, 2.8)
    };
    branch.x = platformXAt(branch, sceneTime);
    platforms.push(branch);
    if (index === 0) firstDirection = chosen.direction;
  }
}

function updateScore() {
  score = Math.floor(highest / 10) + collected * 25;
  ui.score.textContent = String(score);
  if (score > best) {
    best = score;
    ui.best.textContent = String(best);
  }
}

function saveBest() {
  if (!persistence) return;
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch (error) {
    console.warn("Paper Cosmos: could not save best score.", error);
    storageUnavailable();
  }
}

function start() {
  resetWorld();
  mode = "playing";
  lastTime = null;
  ui.overlay.hidden = true;
  ui.pause.disabled = false;
  ui.pause.textContent = "Pause";
  ui.pause.setAttribute("aria-label", "Pause game");
  ui.status.textContent = "Space to jump. Time your next landing.";
}

function pause(reason = "Your universe can wait.") {
  if (mode !== "playing") return;
  mode = "paused";
  keys.clear();
  accumulator = 0;
  saveBest();
  showOverlay("A MOMENT OF STILLNESS", "Catch your breath.", reason, "Resume exploring", "P / ESC TO RESUME");
  ui.pause.textContent = "Resume";
  ui.pause.setAttribute("aria-label", "Resume game");
  ui.status.textContent = "Paused";
}

function resume() {
  if (mode !== "paused") return;
  mode = "playing";
  keys.clear();
  lastTime = null;
  accumulator = 0;
  ui.overlay.hidden = true;
  ui.pause.textContent = "Pause";
  ui.pause.setAttribute("aria-label", "Pause game");
  ui.status.textContent = "Space to jump. Time your next landing.";
}

function showOverlay(kicker, title, copy, button, hint) {
  ui.kicker.textContent = kicker;
  ui.title.textContent = title;
  ui.copy.textContent = copy;
  ui.primary.textContent = button + " \u2192";
  ui.hint.textContent = hint;
  ui.overlay.hidden = false;
}

function endRun(reason) {
  mode = "over";
  keys.clear();
  saveBest();
  ui.pause.disabled = true;
  ui.status.textContent = reason;
  showOverlay("EVERY FOLD IS A NEW BEGINNING", "A lovely little journey.", reason + " You gathered " + score + " stardust (" + collected + " stars).", "Explore again", "SPACE / ENTER TO RESTART");
}

function jump() {
  if (mode !== "playing" || player.groundId === null) return;
  player.groundId = null;
  player.vy = -JUMP;
  ui.status.textContent = "Space to jump. Time your next landing.";
}

function solarContactTime(p, oldX, oldY, dt) {
  // Sweep the explorer against the gold-framed pad, relative to its movement.
  const startX = oldX - p.oldX;
  const moveX = player.x - p.x - startX;
  const moveY = player.y - oldY;
  let enter = 0;
  let exit = 1;
  for (const [position, movement, min, max] of [
    [startX, moveX, -PLAYER_W / 2, p.w + PLAYER_W / 2],
    [oldY, moveY, p.y - 32 - PLAYER_H, p.y + 13]
  ]) {
    if (movement === 0) {
      if (position < min || position > max) return null;
    } else {
      const a = (min - position) / movement;
      const b = (max - position) / movement;
      enter = Math.max(enter, Math.min(a, b));
      exit = Math.min(exit, Math.max(a, b));
      if (enter > exit) return null;
    }
  }
  return enter * dt;
}

function step(dt) {
  if (mode !== "playing") return;
  const previousTime = sceneTime;
  sceneTime += dt;
  frontier -= pressureDistance(sceneTime) - pressureDistance(previousTime);
  sparkles = sparkles.filter(burst => {
    burst.age += dt;
    return burst.age < SPARKLE_LIFE;
  });
  pruneWorld();
  updatePressure();
  if (player.y + PLAYER_H >= frontier) {
    endRun("The unraveling caught up with you. Stay above the coral edge.");
    return;
  }
  const oldX = player.x;
  const oldY = player.y;
  const support = platforms.find(p => p.id === player.groundId);
  for (const p of platforms) {
    p.oldX = p.x;
    p.x = platformXAt(p, sceneTime);
  }
  if (support) player.x += support.x - support.oldX;
  const direction = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
  player.x = clamp(player.x + direction * SPEED * dt, PLAYER_W / 2, W - PLAYER_W / 2);
  player.lean += (direction * .18 - player.lean) * Math.min(1, dt * 12);
  if (support && player.x + PLAYER_W / 2 > support.x && player.x - PLAYER_W / 2 < support.x + support.w) {
    player.y = support.y - PLAYER_H;
    player.vy = 0;
  } else {
    player.groundId = null;
  }
  const oldBottom = player.y + PLAYER_H;
  const oldVelocity = player.vy;
  if (player.groundId === null) {
    player.y += player.vy * dt + .5 * GRAVITY * dt * dt;
    player.vy += GRAVITY * dt;
  }
  const bottom = player.y + PLAYER_H;
  let boostTime = null;
  for (const p of platforms) {
    if (!p.boost) continue;
    const contactTime = solarContactTime(p, oldX, oldY, dt);
    if (contactTime === null) continue;
    if (!boostContacts.has(p.id) && (boostTime === null || contactTime < boostTime)) boostTime = contactTime;
  }
  if (boostTime !== null) {
    const contactY = oldY + (player.y - oldY) * (boostTime / dt);
    const remaining = dt - boostTime;
    player.y = contactY - BOOST_JUMP * remaining + .5 * GRAVITY * remaining * remaining;
    player.vy = -BOOST_JUMP + GRAVITY * remaining;
    player.groundId = null;
    ui.status.textContent = "Solar fold boost! Aim for a higher level.";
  } else if (player.vy > 0) {
    // Test highest surfaces first when crossing more than one in a time step.
    for (let i = platforms.length - 1; i >= 0; i--) {
      const p = platforms[i];
      if (p === support) continue;
      if (oldBottom > p.y || bottom < p.y) continue;
      const contactTime = (Math.sqrt(oldVelocity * oldVelocity + 2 * GRAVITY * (p.y - oldBottom)) - oldVelocity) / GRAVITY;
      const crossing = clamp(contactTime / dt, 0, 1);
      const crossingX = oldX + (player.x - oldX) * crossing;
      const platformX = platformXAt(p, sceneTime - dt + contactTime);
      if (crossingX + PLAYER_W / 2 > platformX && crossingX - PLAYER_W / 2 < platformX + p.w) {
        // Carry only the remaining platform motion after the contact instant.
        player.x = clamp(player.x + (p.x - platformX), PLAYER_W / 2, W - PLAYER_W / 2);
        player.y = p.y - PLAYER_H;
        player.vy = 0;
        player.groundId = p.id;
        if (player.x + PLAYER_W / 2 <= p.x || player.x - PLAYER_W / 2 >= p.x + p.w) player.groundId = null;
        break;
      }
    }
  }
  boostContacts.clear();
  for (const p of platforms) {
    if (p.boost && player.x + PLAYER_W / 2 >= p.x && player.x - PLAYER_W / 2 <= p.x + p.w &&
        player.y + PLAYER_H >= p.y - 32 && player.y <= p.y + 13) boostContacts.add(p.id);
  }
  for (const star of stars) {
    const starX = star.platform.x + star.platform.w / 2;
    const starY = star.platform.y - 32;
    if (!star.taken && Math.hypot(player.x - starX, player.y + PLAYER_H / 2 - starY) < 29) {
      star.taken = true;
      collected++;
      sparkles.push({ x: starX, y: starY, age: 0 });
    }
  }
  highest = Math.max(highest, 620 - (player.y + PLAYER_H));
  camera = Math.min(camera, player.y - H * .42);
  // Keep the threat visible below a fast climber without slowing its timed ascent.
  frontier = Math.min(frontier, camera + H - 32);
  pruneWorld();
  updateScore();
  if (player.y + PLAYER_H >= frontier) {
    endRun("The unraveling caught up with you. Stay above the coral edge.");
    return;
  }
  for (const cloud of clouds) {
    const closestX = clamp(cloud.x, player.x - PLAYER_W / 2, player.x + PLAYER_W / 2);
    const closestY = clamp(cloud.y, player.y, player.y + PLAYER_H);
    if (Math.hypot(cloud.x - closestX, cloud.y - closestY) < cloud.r) {
      endRun("An ink cloud blurred your path.");
      return;
    }
  }
  if (player.y > camera + H + 20) {
    endRun("You drifted beyond the last fold.");
    return;
  }
  generatePlatforms();
}

function polygon(points, fill, stroke) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function drawStar(x, y, radius, fill) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI / 5 - Math.PI / 2;
    const r = i % 2 ? radius * .42 : radius;
    points.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r]);
  }
  polygon(points, fill);
}

function render() {
  const background = ctx.createLinearGradient(0, 0, 0, H);
  background.addColorStop(0, "#142b3b");
  background.addColorStop(1, "#244653");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 1;
  // A deterministic paper-grain sky; it never needs image files.
  for (let i = 0; i < 95; i++) {
    const x = (i * 137.51 + 17) % W;
    const y = ((i * 91.73 - camera * .18) % H + H) % H;
    ctx.fillStyle = i % 4 ? "#dbe5d04b" : "#e9bd84a0";
    ctx.beginPath();
    ctx.arc(x, y, i % 4 ? .8 : 1.6, 0, Math.PI * 2);
    ctx.fill();
    if (i % 9 === 0) {
      ctx.strokeStyle = "#a1c3ba16";
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 45, y - 27); ctx.lineTo(x + 76, y + 15); ctx.stroke();
    }
  }
  ctx.save();
  ctx.translate(0, -camera);
  ctx.setLineDash([3, 8]);
  ctx.strokeStyle = "#c0d9ce28";
  ctx.beginPath();
  platforms.forEach((p, i) => i ? ctx.lineTo(p.x + p.w / 2, p.y + 4) : ctx.moveTo(p.x + p.w / 2, p.y + 4));
  ctx.stroke();
  ctx.setLineDash([]);
  for (const p of platforms) {
    const { x, y, w } = p;
    if (p.amplitude) {
      ctx.strokeStyle = "#b5d1c238";
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(p.baseX - p.amplitude, y + 22);
      ctx.lineTo(p.baseX + p.w + p.amplitude, y + 22);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    polygon([[x, y], [x + w, y], [x + w - 15, y + 13], [x + 12, y + 13]], "#8bb5aa");
    polygon([[x, y], [x + w * .56, y], [x + w * .38, y + 13], [x + 12, y + 13]], "#c5d8be");
    polygon([[x + w * .56, y], [x + w, y], [x + w - 15, y + 13]], "#5e928e");
    ctx.strokeStyle = "#ebedc5"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    if (p.boost) {
      const center = x + w / 2;
      ctx.fillStyle = "#f4ce871a";
      ctx.fillRect(x, y - 32, w, 45);
      ctx.strokeStyle = "#f4ce8780";
      ctx.strokeRect(x, y - 32, w, 45);
      polygon([[center - 24, y - 3], [center - 17, y - 22], [center, y - 10], [center + 17, y - 22], [center + 24, y - 3]], "#e9a373");
      polygon([[center - 17, y - 22], [center, y - 10], [center + 17, y - 22], [center, y - 31]], "#f4ce87");
      ctx.strokeStyle = "#fff3bd";
      ctx.beginPath(); ctx.moveTo(center - 8, y - 15); ctx.lineTo(center, y - 23); ctx.lineTo(center + 8, y - 15); ctx.stroke();
      ctx.fillStyle = "#f4ce87";
      ctx.font = "9px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SOLAR FOLD", center, y + 34);
    }
  }
  for (const s of stars) {
    if (s.taken) continue;
    const x = s.platform.x + s.platform.w / 2;
    const y = s.platform.y - 32;
    ctx.fillStyle = "#f2cd8720";
    ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2); ctx.fill();
    drawStar(x, y, 10, "#f4ce87");
    polygon([[x, y - 10], [x, y + 4], [x + 4, y]], "#fff3bd");
  }
  for (const burst of sparkles) {
    const progress = burst.age / SPARKLE_LIFE;
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = "#fff3bd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, 10 + progress * 45, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI * 2 / 16;
      const distance = 10 + progress * (i % 2 ? 72 : 48);
      const x = burst.x + Math.cos(angle) * distance;
      const y = burst.y + Math.sin(angle) * distance - progress * 18;
      drawStar(x, y, (i % 2 ? 4 : 6) * (1 - progress * .6), i % 2 ? "#bfe5cd" : "#ffdf89");
    }
    ctx.fillStyle = "#fff3bd";
    ctx.textAlign = "center";
    ctx.font = "bold 18px 'Segoe UI', sans-serif";
    ctx.fillText("+25", burst.x, burst.y - 24 - progress * 35);
    ctx.restore();
  }
  for (const c of clouds) {
    ctx.save(); ctx.translate(c.x, c.y);
    // Only the ink's interior moves; its collision footprint stays on the safe side.
    ctx.fillStyle = "#101b2a";
    ctx.beginPath(); ctx.arc(0, 0, c.r, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 7; i++) {
      const a = i * Math.PI * 2 / 7 + c.phase;
      ctx.fillStyle = i % 2 ? "#273047" : "#182236";
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 12, Math.sin(a) * 12, 10 + Math.sin(sceneTime + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#87909855";
    ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-3, -7); ctx.moveTo(5, -7); ctx.lineTo(12, -4); ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.translate(player.x, player.y + 18);
  ctx.rotate(player.lean);
  polygon([[-15, 0], [0, -22], [15, 0], [8, 17], [-9, 17]], "#f2e4bd");
  polygon([[0, -22], [15, 0], [0, -3]], "#fff3d1");
  polygon([[-15, 0], [0, -3], [-9, 17]], "#d7b58f");
  polygon([[0, -3], [15, 0], [8, 17], [0, 11]], "#e8ca9d");
  polygon([[-9, 3], [0, -3], [10, 3], [0, 9]], "#33636b");
  ctx.fillStyle = "#fbefd1"; ctx.fillRect(-3, 1, 2, 2); ctx.fillRect(3, 1, 2, 2);
  polygon([[-10, 10], [-22, 3], [-16, 17]], "#e9a373");
  ctx.restore();
  ctx.restore();
  const edge = frontier - camera;
  const border = [];
  for (let x = 0; x <= W; x += 16) border.push([x, edge + (x % 32 ? 3 : 0)]);
  polygon([...border, [W, H], [0, H]], "#b96e5e");
  ctx.strokeStyle = "#ffc59b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  border.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke();
  ctx.fillStyle = "#ffe4c5";
  ctx.font = "bold 11px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  if (edge < H - 12) ctx.fillText("THE UNRAVELING  /  KEEP CLIMBING", 16, edge + 20);
  ctx.fillStyle = "#ecedd41c";
  ctx.font = "10px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("THE FOLDED FRONTIER", 20, H - 20);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  render();
}

function frame(timestamp) {
  const dt = lastTime === null ? 0 : clamp((timestamp - lastTime) / 1000, 0, .05);
  lastTime = timestamp;
  if (mode === "playing") {
    accumulator += dt;
    while (accumulator >= STEP && mode === "playing") {
      step(STEP);
      accumulator -= STEP;
    }
  }
  render();
  requestAnimationFrame(frame);
}

function setFocusMode(on) {
  document.body.classList.toggle("focus-mode", on);
  ui.focus.textContent = on ? "Exit focus" : "Focus mode";
  ui.focus.setAttribute("aria-pressed", String(on));
  ui.footerHint.textContent = on ? "Esc exits focus \u00b7 P pauses" : "Touch gold = auto boost";
  resize();
}

const steeringKeys = ["ArrowLeft", "ArrowRight", "KeyA", "KeyD"];
document.addEventListener("keydown", event => {
  if (![...steeringKeys, "Space", "Enter", "KeyP", "Escape", "KeyF"].includes(event.code)) return;
  if (event.code === "Space" && mode === "playing") {
    event.preventDefault();
    if (!event.repeat && !spaceHeld) jump();
    spaceHeld = true;
    return;
  }
  // Outside play, retain native accessible button activation.
  if ((event.code === "Space" || event.code === "Enter") && event.target instanceof HTMLButtonElement) return;
  event.preventDefault();
  if (event.repeat) return;
  if (steeringKeys.includes(event.code)) {
    if (mode === "playing") keys.add(event.code);
  } else if (event.code === "KeyF") {
    setFocusMode(!document.body.classList.contains("focus-mode"));
  } else if (event.code === "Escape" && document.body.classList.contains("focus-mode")) {
    // In focus mode Esc leaves focus; a running game pauses so the layout change is safe.
    pause("Focus mode closed. Resume when you are ready.");
    setFocusMode(false);
  } else if (event.code === "KeyP" || event.code === "Escape") {
    if (mode === "playing") pause();
    else if (mode === "paused") resume();
  } else if (mode === "ready" || mode === "over") {
    if (event.code === "Space") spaceHeld = true;
    start();
  }
});
document.addEventListener("keyup", event => {
  keys.delete(event.code);
  if (event.code === "Space") spaceHeld = false;
});
window.addEventListener("blur", () => {
  keys.clear();
  spaceHeld = false;
  pause("The window lost focus. Resume when you are ready.");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    keys.clear();
    spaceHeld = false;
    pause("Your expedition paused while you were away.");
  }
});
window.addEventListener("pagehide", saveBest);
window.addEventListener("resize", resize);
ui.primary.addEventListener("click", () => {
  if (mode === "paused") resume();
  else start();
  ui.primary.blur();
});
ui.pause.addEventListener("click", () => {
  if (mode === "playing") pause();
  else resume();
  ui.pause.blur();
});
ui.focus.addEventListener("click", () => {
  setFocusMode(!document.body.classList.contains("focus-mode"));
  ui.focus.blur();
});

resetWorld();
resize();
requestAnimationFrame(frame);
