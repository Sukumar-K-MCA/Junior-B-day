/**
 * Junior's Birthday Website — main.js
 * Mobile-First Frontend & Touch Interaction Controller
 * Handles: Section navigation, Secret Gift Box, Confetti/Stars bursts,
 *          Candle blowing, Music toggle, Keyboard & Swipe gestures.
 */

/* ── Section Order & Navigation State ───────────────────────────── */
const SECTIONS = [
  'section-welcome',
  'section-reveal',
  'section-timeline',
  'section-letter',
  'section-reasons',
  'section-cake',
  'section-final',
];

let current = 0;
let isNavigating = false; // Prevents rapid double-tap glitches
let candlesBlown = false; // Guard: Final Surprise stays locked until candles are blown
let lockHintTimer = null;

function showCandleLockHint() {
  const hintEl = document.getElementById('cake-lock-hint');
  const btnCakeNext = document.getElementById('btn-cake-next');
  if (btnCakeNext) {
    btnCakeNext.classList.remove('shake');
    void btnCakeNext.offsetWidth; // Trigger reflow to restart animation
    btnCakeNext.classList.add('shake');
  }
  if (hintEl) {
    hintEl.removeAttribute('hidden');
    clearTimeout(lockHintTimer);
    lockHintTimer = setTimeout(() => {
      hintEl.setAttribute('hidden', '');
    }, 3800);
  }
}

function unlockFinalSurprise() {
  candlesBlown = true;
  const hintEl = document.getElementById('cake-lock-hint');
  if (hintEl) hintEl.setAttribute('hidden', '');

  const unlockedMsg = document.getElementById('cake-unlocked-msg');
  if (unlockedMsg) unlockedMsg.removeAttribute('hidden');

  const btnCakeNext = document.getElementById('btn-cake-next');
  if (btnCakeNext) {
    btnCakeNext.classList.remove('btn-next--locked', 'shake');
    btnCakeNext.classList.add('btn-next--unlocked');
    btnCakeNext.removeAttribute('aria-disabled');
    btnCakeNext.removeAttribute('title');
    const lockIcon = btnCakeNext.querySelector('.btn-lock-icon');
    if (lockIcon) lockIcon.style.display = 'none';
  }
}

function relockFinalSurprise() {
  candlesBlown = false;
  const hintEl = document.getElementById('cake-lock-hint');
  if (hintEl) hintEl.setAttribute('hidden', '');

  const unlockedMsg = document.getElementById('cake-unlocked-msg');
  if (unlockedMsg) unlockedMsg.setAttribute('hidden', '');

  const btnCakeNext = document.getElementById('btn-cake-next');
  if (btnCakeNext) {
    btnCakeNext.classList.remove('btn-next--unlocked', 'shake');
    btnCakeNext.classList.add('btn-next--locked');
    btnCakeNext.setAttribute('aria-disabled', 'true');
    btnCakeNext.setAttribute('title', 'First blow out the candles!');
    const lockIcon = btnCakeNext.querySelector('.btn-lock-icon');
    if (lockIcon) lockIcon.style.display = '';
  }
}

function getSection(id) {
  return document.getElementById(id);
}

function activateSection(id) {
  // CRITICAL GUARD: Final Surprise cannot be accessed until candles are blown!
  if (id === 'section-final' && !candlesBlown) {
    showCandleLockHint();
    return;
  }

  const idx = SECTIONS.indexOf(id);
  if (idx < 0 || isNavigating) return;

  isNavigating = true;

  // Fade out and hide current section
  const prevEl = getSection(SECTIONS[current]);
  if (prevEl) {
    prevEl.classList.remove('active');
    setTimeout(() => {
      if (!prevEl.classList.contains('active')) {
        prevEl.classList.add('hidden');
      }
    }, 600);
  }

  // Show next section from top
  const nextEl = getSection(id);
  if (nextEl) {
    nextEl.scrollTop = 0; // CRITICAL: Reset scroll position to top so headings are never cut off
    nextEl.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nextEl.classList.add('active');
      });
    });
  }

  current = idx;
  updateProgressDots(idx);

  // Fire celebratory confetti on birthday reveal
  if (id === 'section-reveal') {
    fireConfetti();
  }

  setTimeout(() => {
    isNavigating = false;
  }, 450);
}

/* ── Navigation Buttons ─────────────────────────────────────────── */
document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = btn.dataset.target;
    if (target) activateSection(target);
  });
});

/* ── Surprise Button (Section 1) ────────────────────────────────── */
const btnSurprise = document.getElementById('btn-surprise');
if (btnSurprise) {
  btnSurprise.addEventListener('click', (e) => {
    e.preventDefault();
    activateSection('section-reveal');
  });
}

/* ── Secret Gift Box Interaction (Section 7) ────────────────────── */
const giftBox = document.getElementById('gift-box');
const btnOpenGift = document.getElementById('btn-open-gift');
const giftBoxWrapper = document.getElementById('gift-box-wrapper');
const finalRevealedCard = document.getElementById('final-revealed-card');

function openSecretGift() {
  if (!giftBox || giftBox.classList.contains('gift-box--opened')) return;

  giftBox.classList.add('gift-box--opened');
  spawnWishStars('section-final');
  fireConfetti();

  // Reveal the romantic final message card with smooth transition
  setTimeout(() => {
    if (finalRevealedCard) {
      finalRevealedCard.classList.remove('hidden');
      requestAnimationFrame(() => {
        finalRevealedCard.classList.add('revealed');
      });
    }
    if (giftBoxWrapper) {
      giftBoxWrapper.classList.add('gift-box-wrapper--opened');
    }
  }, 350);
}

if (btnOpenGift) {
  btnOpenGift.addEventListener('click', (e) => {
    e.preventDefault();
    openSecretGift();
  });
}

if (giftBox) {
  giftBox.addEventListener('click', openSecretGift);
  giftBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSecretGift();
    }
  });
}

/* ── Restart Button (Full Surprise Reset) ───────────────────────── */
const btnRestart = document.getElementById('btn-restart');
if (btnRestart) {
  btnRestart.addEventListener('click', (e) => {
    e.preventDefault();

    // Reset candles in cake section
    document.querySelectorAll('.cake__flame').forEach(f => {
      f.style.display = '';
      f.style.opacity = '';
      f.style.transform = '';
    });
    const blowBtn = document.getElementById('btn-blow');
    if (blowBtn) {
      blowBtn.classList.remove('blown');
      blowBtn.textContent = 'Blow Out the Candles 🎂';
    }

    // Reset wish overlay
    const wishMsg = document.getElementById('cake-wish-msg');
    if (wishMsg) {
      wishMsg.classList.remove('visible');
      wishMsg.setAttribute('aria-hidden', 'true');
    }

    // Reset celebration card
    const celebration = document.getElementById('cake-celebration');
    if (celebration) {
      celebration.setAttribute('hidden', '');
      celebration.setAttribute('aria-hidden', 'true');
    }

    // Reset music notice
    const musicNotice = document.getElementById('cake-music-notice');
    if (musicNotice) musicNotice.setAttribute('hidden', '');

    // Stop HBD music if playing
    const hbd = document.getElementById('hbd-music');
    if (hbd && !hbd.paused) {
      hbd.pause();
      hbd.currentTime = 0;
      syncMusicBtn(false, false);
    }

    // Reset Secret Gift Box
    if (giftBox) giftBox.classList.remove('gift-box--opened');
    if (giftBoxWrapper) giftBoxWrapper.classList.remove('gift-box-wrapper--opened');
    if (finalRevealedCard) {
      finalRevealedCard.classList.remove('revealed');
      finalRevealedCard.classList.add('hidden');
    }

    // Reset Final Surprise button lock state
    relockFinalSurprise();

    // Return to Section 1
    activateSection('section-welcome');
  });
}

/* ── Progress Navigation Dots ───────────────────────────────────── */
function updateProgressDots(idx) {
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
    dot.setAttribute('aria-current', i === idx ? 'step' : 'false');
  });
}

document.querySelectorAll('.progress-dot').forEach((dot, i) => {
  dot.addEventListener('click', (e) => {
    e.preventDefault();
    activateSection(SECTIONS[i]);
  });
});



function spawnWishStars(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const isMobile = window.innerWidth < 600;
  const count = isMobile ? 12 : 20;
  const symbols = ['⭐', '✨', '🌟', '💫', '💖'];

  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    star.style.cssText = `
      position: absolute;
      font-size: ${0.75 + Math.random() * 0.75}rem;
      left: ${10 + Math.random() * 80}%;
      top:  ${25 + Math.random() * 50}%;
      opacity: 1;
      pointer-events: none;
      animation: star-drift ${1.4 + Math.random() * 0.8}s ease-out forwards;
      animation-delay: ${Math.random() * 0.4}s;
      z-index: 25;
    `;
    container.appendChild(star);
    setTimeout(() => star.remove(), 2500);
  }
}

// Keyframes for particles injected once
(function injectKeyframes() {
  if (document.getElementById('mobile-party-style')) return;
  const style = document.createElement('style');
  style.id = 'mobile-party-style';
  style.textContent = `
    @keyframes star-drift {
      0%   { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-70px) scale(0.4); opacity: 0; }
    }
    @keyframes confetti-fall {
      0%   { transform: translateY(-10px) rotateZ(0deg) rotateX(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotateZ(720deg) rotateX(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ── Confetti Burst (Adaptive Particle Count for Mobile) ────────── */
const CONFETTI_COLORS = ['#c9a84c', '#e8a0af', '#6b1e2e', '#fff5f5', '#e6cc82', '#f7d3dc'];

/**
 * Fire confetti into a container element.
 * @param {Element|null} containerEl - target container; defaults to .confetti-container
 */
function fireConfetti(containerEl) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const container = containerEl || document.querySelector('.confetti-container');
  if (!container) return;

  // Mobile optimization: generate fewer particles to guarantee 60fps on mobile CPUs
  const isMobile = window.innerWidth < 600;
  const particleCount = isMobile ? 28 : 70;

  for (let i = 0; i < particleCount; i++) {
    const piece = document.createElement('div');
    const isCircle = Math.random() > 0.5;
    const size = 5 + Math.random() * 7;
    piece.style.cssText = `
      position: absolute;
      width:  ${size}px;
      height: ${isCircle ? size : size * 0.4}px;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      border-radius: ${isCircle ? '50%' : '2px'};
      left:   ${Math.random() * 100}%;
      top:    -10px;
      opacity: 1;
      animation: confetti-fall ${1.5 + Math.random() * 2}s ease-in forwards;
      animation-delay: ${Math.random() * 1.2}s;
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}



/* ================================================================
   MUSIC MANAGER — Handles background music + birthday music
   Single source of truth; no duplicate players; graceful fallback.
   ================================================================ */

const btnMusic   = document.getElementById('btn-music');
const bgMusic    = document.getElementById('bg-music');
const hbdMusic   = document.getElementById('hbd-music');

/**
 * Returns true if the given <audio> element has at least one
 * loadable source (i.e. currentSrc was resolved by the browser).
 * We check networkState: 3 = NETWORK_NO_SOURCE.
 */
function audioHasSource(audioEl) {
  if (!audioEl) return false;
  // If networkState is NETWORK_NO_SOURCE the browser found nothing to load
  return audioEl.networkState !== 3;
}

/**
 * Attempt to play an audio element.
 * Returns a Promise that resolves true on success, false on failure.
 */
function tryPlay(audioEl) {
  if (!audioEl) return Promise.resolve(false);
  if (!audioHasSource(audioEl)) return Promise.resolve(false);

  return audioEl.play().then(() => true).catch(() => false);
}

/** Update the floating music button UI to reflect current state. */
function syncMusicBtn(playing, noSource) {
  if (!btnMusic) return;
  btnMusic.textContent = playing ? '🎶' : '🎵';
  btnMusic.classList.toggle('playing', playing);
  btnMusic.classList.toggle('no-source', !!noSource);
  btnMusic.setAttribute(
    'aria-label',
    playing ? 'Pause background music' : 'Play background music'
  );
}

/* Track which audio element is currently "active" for the bg button */
let activeBgAudio = bgMusic;

/* ── Floating Music Button ──────────────────────────────────────── */
if (btnMusic) {
  btnMusic.addEventListener('click', async () => {
    /* If HBD music is playing, the btn controls it temporarily */
    const target = (hbdMusic && !hbdMusic.paused) ? hbdMusic : bgMusic;
    if (!target) return;

    if (target.paused) {
      const ok = await tryPlay(target);
      if (ok) {
        syncMusicBtn(true, false);
      } else {
        /* No source or blocked — show the ? badge for 3 s then restore */
        syncMusicBtn(false, true);
        setTimeout(() => {
          if (target.paused) syncMusicBtn(false, false);
        }, 3000);
      }
    } else {
      target.pause();
      syncMusicBtn(false, false);
    }
  });

  /* Keep button in sync if audio ends or errors */
  [bgMusic, hbdMusic].forEach(a => {
    if (!a) return;
    a.addEventListener('ended', () => {
      if (a.paused) syncMusicBtn(false, false);
    });
    a.addEventListener('error', () => syncMusicBtn(false, false));
  });
}

/* ================================================================
   BLOW-CANDLES INTERACTION — 5-step birthday sequence
   Step 1: Show "make a wish" overlay
   Step 2: Animate candles out + puff smoke
   Step 3: Play Happy Birthday music (in the click handler for mobile)
   Step 4: Show celebration card + confetti
   Step 5: Guard against replay
   ================================================================ */

const btnBlow           = document.getElementById('btn-blow');
const cakeWishMsg       = document.getElementById('cake-wish-msg');
const cakeCelebration   = document.getElementById('cake-celebration');
const cakePuffContainer = document.getElementById('cake-puff-container');
const cakeMusicNotice   = document.getElementById('cake-music-notice');

/** Spawn small puff clouds above the candles */
function spawnCakePuffs() {
  if (!cakePuffContainer) return;
  cakePuffContainer.innerHTML = '';
  const puffData = [
    { left: '15%', size: 22, delay: 0,    dur: 1.1 },
    { left: '40%', size: 28, delay: 0.12, dur: 1.3 },
    { left: '65%', size: 22, delay: 0.06, dur: 1.15 },
    { left: '50%', size: 18, delay: 0.22, dur: 0.9 },
    { left: '30%', size: 20, delay: 0.18, dur: 1.0 },
  ];
  puffData.forEach(({ left, size, delay, dur }) => {
    const puff = document.createElement('div');
    puff.className = 'cake__puff';
    puff.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}; bottom: 0;
      animation-delay: ${delay}s;
      --dur: ${dur}s;
    `;
    cakePuffContainer.appendChild(puff);
    setTimeout(() => puff.remove(), (delay + dur) * 1000 + 200);
  });
}

if (btnBlow) {
  btnBlow.addEventListener('click', async (e) => {
    e.preventDefault();

    /* ── Guard: prevent replay ───────────────────────────────── */
    if (btnBlow.classList.contains('blown')) return;
    btnBlow.classList.add('blown');

    /* ── STEP 3 (start music NOW — must be inside click handler for mobile) ── */
    let musicPlaying = false;
    if (hbdMusic) {
      hbdMusic.currentTime = 0;
      /* Pause background if it was playing */
      if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        syncMusicBtn(false, false);
      }
      musicPlaying = await tryPlay(hbdMusic);
      if (musicPlaying) {
        /* Keep the float button in sync with HBD music */
        syncMusicBtn(true, false);
        hbdMusic.addEventListener('ended', () => {
          syncMusicBtn(false, false);
          /* Optionally resume background after HBD finishes */
          /* tryPlay(bgMusic).then(ok => syncMusicBtn(ok, false)); */
        }, { once: true });
      }
    }

    /* ── STEP 1: Show wish overlay ───────────────────────────── */
    if (cakeWishMsg) {
      cakeWishMsg.removeAttribute('aria-hidden');
      cakeWishMsg.classList.add('visible');
    }

    /* Change button text */
    btnBlow.textContent = '✨ Wishing...';

    /* ── STEP 2: Animate candles disappearing + puff smoke ────── */
    const flames = document.querySelectorAll('.cake__flame');
    flames.forEach((f, i) => {
      setTimeout(() => {
        f.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        f.style.opacity = '0';
        f.style.transform = 'translateY(-8px) scaleY(0.1)';
        setTimeout(() => { f.style.display = 'none'; }, 320);
      }, i * 130);
    });

    /* Spawn puff smoke after all flames start going out */
    setTimeout(() => spawnCakePuffs(), flames.length * 130);

    /* ── STEP 4: Show celebration card after wish display ────── */
    const celebrationDelay = 1200; // ms — enough for wish to read
    setTimeout(() => {
      /* Hide wish, show celebration */
      if (cakeWishMsg) {
        cakeWishMsg.classList.remove('visible');
        cakeWishMsg.setAttribute('aria-hidden', 'true');
      }

      if (cakeCelebration) {
        cakeCelebration.removeAttribute('hidden');
        cakeCelebration.removeAttribute('aria-hidden');
      }

      /* Show music notice if HBD music didn't play */
      if (!musicPlaying && cakeMusicNotice) {
        cakeMusicNotice.removeAttribute('hidden');
      }

      /* Update button text */
      btnBlow.textContent = '🌠 Wish made! 🌠';

      /* Fire confetti + wish stars (target section-cake so it's visible) */
      fireConfetti(document.getElementById('section-cake'));
      spawnWishStars('section-cake');

      /* Spawn extra hearts for the birthday */
      spawnBirthdayHearts('section-cake');

      /* ── STEP 5: Unlock the Final Surprise button & announce ── */
      unlockFinalSurprise();
    }, celebrationDelay);
  });
}

/** Spawn floating pink hearts & golden stars around the cake section */
function spawnBirthdayHearts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isMobile = window.innerWidth < 600;
  const symbols = ['💗', '💖', '✨', '🌟', '💕', '🎀'];
  const count = isMobile ? 14 : 22;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.cssText = `
      position: absolute;
      font-size: ${0.8 + Math.random() * 0.9}rem;
      left: ${5 + Math.random() * 90}%;
      top:  ${10 + Math.random() * 75}%;
      opacity: 1;
      pointer-events: none;
      animation: star-drift ${1.6 + Math.random() * 1}s ease-out forwards;
      animation-delay: ${Math.random() * 0.5}s;
      z-index: 25;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
}

/* ── Keyboard Navigation (Arrow Keys) ───────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    const next = Math.min(current + 1, SECTIONS.length - 1);
    if (next !== current) activateSection(SECTIONS[next]);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    const prev = Math.max(current - 1, 0);
    if (prev !== current) activateSection(SECTIONS[prev]);
  }
});

/* ── Mobile Touch Swipe Navigation ──────────────────────────────── */
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Swipe threshold: ≥ 48px horizontal dominance
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
    if (dx < 0) {
      // Swipe left -> next
      const next = Math.min(current + 1, SECTIONS.length - 1);
      if (next !== current) activateSection(SECTIONS[next]);
    } else {
      // Swipe right -> prev
      const prev = Math.max(current - 1, 0);
      if (prev !== current) activateSection(SECTIONS[prev]);
    }
  }
}, { passive: true });

/* ── Initial State Setup ────────────────────────────────────────── */
(function init() {
  const hash = window.location.hash.replace('#', '');
  let startId = (hash && SECTIONS.includes(hash)) ? hash : SECTIONS[0];
  if (startId === 'section-final' && !candlesBlown) {
    startId = 'section-welcome';
  }
  const startIdx = SECTIONS.indexOf(startId);

  SECTIONS.forEach((id, i) => {
    const el = getSection(id);
    if (!el) return;
    if (i === startIdx) {
      el.classList.add('active');
      el.classList.remove('hidden');
    } else {
      el.classList.remove('active');
      el.classList.add('hidden');
    }
  });
  current = startIdx;
  updateProgressDots(startIdx);
})();
