(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Shared modal + loop controller                                      */
  /* ------------------------------------------------------------------ */
  var modal = document.getElementById('gameModal');
  var modalTitle = document.getElementById('gameModalTitle');
  var overlay = document.getElementById('gameOverlay');
  var overlayText = document.getElementById('gameOverlayText');
  var startBtn = document.getElementById('gameStartBtn');
  var closeBtn = document.getElementById('gameClose');
  var scoreEl = document.getElementById('gameScore');
  var bestEl = document.getElementById('gameBest');
  var controlsHint = document.getElementById('gameControlsHint');
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');

  var W = canvas.width, H = canvas.height;

  var META = {
    'volt-invaders': { title: 'VOLT INVADERS', controls: 'Arrow keys move · Space shoots' },
    'circuit-smash': { title: 'CIRCUIT SMASH', controls: 'Arrow keys or mouse move the paddle' },
    'grid-runner': { title: 'GRID RUNNER', controls: 'Left / Right switch lanes' },
    'signal-breaker': { title: 'SIGNAL BREAKER', controls: 'Left/Right move · Down drop · Space hard-drop' }
  };

  var keys = Object.create(null);
  document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (modal.classList.contains('is-open') && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', function (e) { keys[e.key] = false; });

  var pointerX = null;
  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    pointerX = (e.clientX - rect.left) * (W / rect.width);
  });

  var currentGameKey = null;
  var currentGame = null;
  var rafId = null;
  var lastTime = 0;
  var running = false;

  function bestKey(gameKey) { return 'quarterbin-best-' + gameKey; }

  function getBest(gameKey) {
    var v = localStorage.getItem(bestKey(gameKey));
    return v ? parseInt(v, 10) : 0;
  }

  function setBest(gameKey, score) {
    var best = getBest(gameKey);
    if (score > best) {
      localStorage.setItem(bestKey(gameKey), String(score));
      best = score;
    }
    return best;
  }

  function openModal(gameKey) {
    var meta = META[gameKey];
    if (!meta) return;
    currentGameKey = gameKey;
    modalTitle.textContent = meta.title;
    controlsHint.textContent = meta.controls;
    scoreEl.textContent = '0';
    bestEl.textContent = String(getBest(gameKey));
    overlay.classList.remove('is-hidden');
    overlayText.textContent = 'Ready when you are.';
    startBtn.textContent = 'Insert coin';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    ctx.clearRect(0, 0, W, H);
  }

  function closeModal() {
    stopLoop();
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    currentGame = null;
    currentGameKey = null;
  }

  function stopLoop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function endGame(finalScore) {
    stopLoop();
    var best = setBest(currentGameKey, finalScore);
    bestEl.textContent = String(best);
    overlay.classList.remove('is-hidden');
    overlayText.textContent = 'Game over — score ' + finalScore + (finalScore >= best ? ' — new house best!' : '.');
    startBtn.textContent = 'Play again';
  }

  function loop(ts) {
    if (!running) return;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    currentGame.update(dt, keys, pointerX);
    scoreEl.textContent = String(currentGame.score | 0);
    ctx.clearRect(0, 0, W, H);
    currentGame.draw(ctx);
    if (currentGame.over) {
      endGame(currentGame.score | 0);
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  startBtn.addEventListener('click', function () {
    if (!currentGameKey || !GAMES[currentGameKey]) return;
    currentGame = GAMES[currentGameKey].create(W, H);
    overlay.classList.add('is-hidden');
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  document.querySelectorAll('.cabinet-play').forEach(function (btn) {
    if (btn.disabled) return;
    btn.addEventListener('click', function () {
      openModal(btn.dataset.game);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Palette                                                             */
  /* ------------------------------------------------------------------ */
  var CYAN = '#04f7e0', MAGENTA = '#ff2fb0', AMBER = '#ffcc33', VIOLET = '#7c3aed', TEXT = '#ece7f7';

  /* ------------------------------------------------------------------ */
  /* VOLT INVADERS                                                       */
  /* ------------------------------------------------------------------ */
  function createVoltInvaders(W, H) {
    var g = {
      score: 0, over: false, lives: 3,
      player: { x: W / 2, y: H - 24, w: 30, h: 10, speed: 240 },
      bullets: [], enemyBullets: [],
      invaders: [], dir: 1, invSpeed: 40, dropAt: false,
      shootTimer: 0, spawnTimer: 0, hitFlash: 0
    };

    function spawnWave() {
      g.invaders = [];
      var rows = 4, cols = 8, spacingX = 40, spacingY = 30, startX = 60, startY = 40;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          g.invaders.push({
            x: startX + c * spacingX, y: startY + r * spacingY,
            w: 22, h: 14, alive: true, row: r,
            value: (rows - r) * 10 + 10
          });
        }
      }
      g.dir = 1;
    }
    spawnWave();

    g.update = function (dt, keys) {
      if (g.over) return;
      g.hitFlash = Math.max(0, g.hitFlash - dt);

      if (keys['ArrowLeft'] || keys['a']) g.player.x -= g.player.speed * dt;
      if (keys['ArrowRight'] || keys['d']) g.player.x += g.player.speed * dt;
      g.player.x = Math.max(16, Math.min(W - 16, g.player.x));

      g.shootTimer -= dt;
      if ((keys[' '] || keys['Spacebar']) && g.shootTimer <= 0) {
        g.bullets.push({ x: g.player.x, y: g.player.y - 8 });
        g.shootTimer = 0.28;
      }
      g.bullets.forEach(function (b) { b.y -= 340 * dt; });
      g.bullets = g.bullets.filter(function (b) { return b.y > -10; });

      var edge = false;
      g.invaders.forEach(function (inv) {
        if (!inv.alive) return;
        inv.x += g.dir * g.invSpeed * dt;
        if (inv.x < 20 || inv.x > W - 20) edge = true;
      });
      if (edge) {
        g.dir *= -1;
        g.invaders.forEach(function (inv) { if (inv.alive) inv.y += 12; });
      }

      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) {
        var alive = g.invaders.filter(function (i) { return i.alive; });
        if (alive.length) {
          var shooter = alive[Math.floor(Math.random() * alive.length)];
          g.enemyBullets.push({ x: shooter.x, y: shooter.y + 8 });
        }
        g.spawnTimer = Math.max(0.35, 1.1 - g.score / 900);
      }
      g.enemyBullets.forEach(function (b) { b.y += 200 * dt; });
      g.enemyBullets = g.enemyBullets.filter(function (b) { return b.y < H + 10; });

      g.bullets.forEach(function (b) {
        g.invaders.forEach(function (inv) {
          if (!inv.alive) return;
          if (Math.abs(b.x - inv.x) < inv.w / 2 && Math.abs(b.y - inv.y) < inv.h / 2) {
            inv.alive = false;
            b.y = -100;
            g.score += inv.value;
          }
        });
      });

      var pRect = { x: g.player.x - 15, y: g.player.y - 5, w: 30, h: 10 };
      g.enemyBullets.forEach(function (b) {
        if (b.x > pRect.x && b.x < pRect.x + pRect.w && b.y > pRect.y && b.y < pRect.y + pRect.h) {
          b.y = H + 100;
          g.lives -= 1;
          g.hitFlash = 0.3;
          if (g.lives <= 0) g.over = true;
        }
      });

      g.invaders.forEach(function (inv) {
        if (inv.alive && inv.y > g.player.y - 20) g.over = true;
      });

      if (g.invaders.every(function (i) { return !i.alive; })) {
        g.invSpeed += 12;
        spawnWave();
      }
    };

    g.draw = function (ctx) {
      ctx.fillStyle = '#050208';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = g.hitFlash > 0 ? MAGENTA : AMBER;
      ctx.beginPath();
      ctx.moveTo(g.player.x, g.player.y - 8);
      ctx.lineTo(g.player.x - 15, g.player.y + 6);
      ctx.lineTo(g.player.x + 15, g.player.y + 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = CYAN;
      g.bullets.forEach(function (b) { ctx.fillRect(b.x - 2, b.y - 6, 4, 10); });

      ctx.fillStyle = MAGENTA;
      g.enemyBullets.forEach(function (b) { ctx.fillRect(b.x - 2, b.y - 5, 4, 9); });

      ctx.fillStyle = AMBER;
      g.invaders.forEach(function (inv) {
        if (!inv.alive) return;
        ctx.fillRect(inv.x - inv.w / 2, inv.y - inv.h / 2, inv.w, inv.h);
      });

      ctx.fillStyle = TEXT;
      ctx.font = '11px monospace';
      ctx.fillText('Lives: ' + g.lives, 10, 16);
    };

    return g;
  }

  /* ------------------------------------------------------------------ */
  /* CIRCUIT SMASH                                                       */
  /* ------------------------------------------------------------------ */
  function createCircuitSmash(W, H) {
    var g = { score: 0, over: false, lives: 3, level: 1 };
    g.paddle = { w: 70, h: 10, x: W / 2, y: H - 22, speed: 300 };
    g.ball = { x: W / 2, y: H - 40, r: 6, vx: 140, vy: -220 };
    g.bricks = [];

    var colors = [CYAN, MAGENTA, AMBER, VIOLET];

    function buildBricks() {
      g.bricks = [];
      var rows = Math.min(3 + g.level, 7);
      var cols = 8, gap = 4, bw = (W - 40 - gap * (cols - 1)) / cols, bh = 14, startY = 34;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          g.bricks.push({
            x: 20 + c * (bw + gap), y: startY + r * (bh + gap),
            w: bw, h: bh, alive: true, color: colors[r % colors.length]
          });
        }
      }
    }
    buildBricks();

    function resetBall() {
      g.ball.x = g.paddle.x;
      g.ball.y = g.paddle.y - 14;
      g.ball.vx = 140 * (Math.random() < 0.5 ? -1 : 1);
      g.ball.vy = -220 - g.level * 10;
    }

    g.update = function (dt, keys, pointerX) {
      if (g.over) return;
      if (keys['ArrowLeft'] || keys['a']) g.paddle.x -= g.paddle.speed * dt;
      if (keys['ArrowRight'] || keys['d']) g.paddle.x += g.paddle.speed * dt;
      if (pointerX !== null) g.paddle.x = pointerX;
      g.paddle.x = Math.max(g.paddle.w / 2, Math.min(W - g.paddle.w / 2, g.paddle.x));

      var b = g.ball;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x < b.r || b.x > W - b.r) b.vx *= -1;
      if (b.y < b.r) b.vy *= -1;

      var p = g.paddle;
      if (b.y + b.r > p.y - p.h / 2 && b.y - b.r < p.y + p.h / 2 && b.x > p.x - p.w / 2 && b.x < p.x + p.w / 2 && b.vy > 0) {
        var offset = (b.x - p.x) / (p.w / 2);
        b.vx = offset * 220;
        b.vy = -Math.abs(b.vy);
      }

      g.bricks.forEach(function (brick) {
        if (!brick.alive) return;
        if (b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w && b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {
          brick.alive = false;
          b.vy *= -1;
          g.score += 10;
        }
      });

      if (b.y > H + 10) {
        g.lives -= 1;
        if (g.lives <= 0) { g.over = true; }
        else resetBall();
      }

      if (g.bricks.every(function (br) { return !br.alive; })) {
        g.level += 1;
        g.paddle.w = Math.max(34, g.paddle.w - 6);
        buildBricks();
        resetBall();
      }
    };

    g.draw = function (ctx) {
      ctx.fillStyle = '#050208';
      ctx.fillRect(0, 0, W, H);

      g.bricks.forEach(function (brick) {
        if (!brick.alive) return;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      });

      ctx.fillStyle = CYAN;
      ctx.fillRect(g.paddle.x - g.paddle.w / 2, g.paddle.y - g.paddle.h / 2, g.paddle.w, g.paddle.h);

      ctx.beginPath();
      ctx.fillStyle = AMBER;
      ctx.arc(g.ball.x, g.ball.y, g.ball.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = TEXT;
      ctx.font = '11px monospace';
      ctx.fillText('Lives: ' + g.lives + '   Level: ' + g.level, 10, 16);
    };

    return g;
  }

  /* ------------------------------------------------------------------ */
  /* GRID RUNNER                                                         */
  /* ------------------------------------------------------------------ */
  function createGridRunner(W, H) {
    var lanes = 3, laneW = W / lanes;
    var g = {
      score: 0, over: false, lane: 1, targetX: laneW * 1.5,
      speed: 200, elapsed: 0, obstacles: [], spawnTimer: 0
    };
    g.player = { x: laneW * 1.5, y: H - 60, w: 28, h: 38 };
    g.laneW = laneW;

    function laneX(i) { return laneW * (i + 0.5); }

    g.update = function (dt, keys) {
      if (g.over) return;
      g.elapsed += dt;
      g.speed = 200 + g.elapsed * 8;
      g.score += dt * 12;

      if ((keys['ArrowLeft'] || keys['a']) && !g._leftHeld) {
        g.lane = Math.max(0, g.lane - 1);
        g._leftHeld = true;
      }
      if (!keys['ArrowLeft'] && !keys['a']) g._leftHeld = false;

      if ((keys['ArrowRight'] || keys['d']) && !g._rightHeld) {
        g.lane = Math.min(lanes - 1, g.lane + 1);
        g._rightHeld = true;
      }
      if (!keys['ArrowRight'] && !keys['d']) g._rightHeld = false;

      g.targetX = laneX(g.lane);
      g.player.x += (g.targetX - g.player.x) * Math.min(1, dt * 12);

      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) {
        var lane = Math.floor(Math.random() * lanes);
        g.obstacles.push({ lane: lane, y: -30, w: 30, h: 26, passed: false });
        g.spawnTimer = Math.max(0.45, 1.1 - g.elapsed / 40);
      }

      g.obstacles.forEach(function (o) {
        o.y += g.speed * dt;
        if (!o.passed && o.y > g.player.y) {
          o.passed = true;
          g.score += 5;
        }
      });
      g.obstacles = g.obstacles.filter(function (o) { return o.y < H + 40; });

      g.obstacles.forEach(function (o) {
        if (o.lane === g.lane) {
          var oy = o.y, py = g.player.y;
          if (Math.abs(oy - py) < (o.h + g.player.h) / 2 - 6) g.over = true;
        }
      });
    };

    g.draw = function (ctx) {
      ctx.fillStyle = '#050208';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,47,176,0.35)';
      ctx.lineWidth = 2;
      for (var i = 1; i < lanes; i++) {
        ctx.beginPath();
        ctx.moveTo(laneW * i, 0);
        ctx.lineTo(laneW * i, H);
        ctx.stroke();
      }

      var tickOffset = (g.elapsed * g.speed) % 40;
      ctx.strokeStyle = 'rgba(124,58,237,0.25)';
      ctx.lineWidth = 1;
      for (var y = -40 + tickOffset; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      ctx.fillStyle = AMBER;
      g.obstacles.forEach(function (o) {
        var ox = laneX(o.lane);
        ctx.fillRect(ox - o.w / 2, o.y - o.h / 2, o.w, o.h);
      });

      ctx.fillStyle = CYAN;
      ctx.beginPath();
      ctx.moveTo(g.player.x, g.player.y - g.player.h / 2);
      ctx.lineTo(g.player.x - g.player.w / 2, g.player.y + g.player.h / 2);
      ctx.lineTo(g.player.x + g.player.w / 2, g.player.y + g.player.h / 2);
      ctx.closePath();
      ctx.fill();
    };

    return g;
  }

  /* ------------------------------------------------------------------ */
  /* SIGNAL BREAKER (falling colour-match puzzle)                        */
  /* ------------------------------------------------------------------ */
  function createSignalBreaker(W, H) {
    var cols = 10, rows = 8, cell = 45, offsetX = (W - cols * cell) / 2, offsetY = 0;
    var colors = [CYAN, MAGENTA, AMBER, VIOLET];

    var g = { score: 0, over: false, fallTimer: 0, fallInterval: 0.6, chain: 0 };
    g.grid = [];
    for (var r = 0; r < rows; r++) { g.grid.push(new Array(cols).fill(null)); }

    function randomColor() { return colors[Math.floor(Math.random() * colors.length)]; }

    function newPiece() { return { col: Math.floor(cols / 2), row: 0, color: randomColor() }; }
    g.piece = newPiece();

    function collides(col, row) {
      if (col < 0 || col >= cols || row >= rows) return true;
      if (row >= 0 && g.grid[row][col]) return true;
      return false;
    }

    function clearMatches() {
      var visited = Array.from({ length: rows }, function () { return new Array(cols).fill(false); });
      var cleared = false;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          if (visited[r][c] || !g.grid[r][c]) continue;
          var color = g.grid[r][c];
          var stack = [[r, c]];
          var group = [];
          visited[r][c] = true;
          while (stack.length) {
            var cur = stack.pop();
            group.push(cur);
            var nbrs = [[cur[0]-1,cur[1]],[cur[0]+1,cur[1]],[cur[0],cur[1]-1],[cur[0],cur[1]+1]];
            nbrs.forEach(function (n) {
              var nr = n[0], nc = n[1];
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && g.grid[nr][nc] === color) {
                visited[nr][nc] = true;
                stack.push([nr, nc]);
              }
            });
          }
          if (group.length >= 3) {
            cleared = true;
            group.forEach(function (cell2) { g.grid[cell2[0]][cell2[1]] = null; });
            g.score += group.length * 10 * (g.chain + 1);
          }
        }
      }
      if (cleared) {
        for (var c2 = 0; c2 < cols; c2++) {
          var stackVals = [];
          for (var r2 = 0; r2 < rows; r2++) {
            if (g.grid[r2][c2]) stackVals.push(g.grid[r2][c2]);
          }
          for (var r3 = rows - 1, k = stackVals.length - 1; r3 >= 0; r3--, k--) {
            g.grid[r3][c2] = k >= 0 ? stackVals[k] : null;
          }
        }
        g.chain += 1;
      } else {
        g.chain = 0;
      }
      return cleared;
    }

    function lockPiece() {
      var row = g.piece.row;
      if (row < 0) { g.over = true; return; }
      g.grid[row][g.piece.col] = g.piece.color;
      g.chain = 0;
      var again = true;
      while (again) { again = clearMatches(); }
      if (g.grid[0].some(function (v) { return v; }) && collides(Math.floor(cols / 2), 0)) {
        g.over = true;
      }
      g.piece = newPiece();
      if (collides(g.piece.col, g.piece.row)) g.over = true;
    }

    g.update = function (dt, keys) {
      if (g.over) return;

      if (keys['ArrowLeft'] && !g._leftHeld) {
        if (!collides(g.piece.col - 1, g.piece.row)) g.piece.col -= 1;
        g._leftHeld = true;
      }
      if (!keys['ArrowLeft']) g._leftHeld = false;

      if (keys['ArrowRight'] && !g._rightHeld) {
        if (!collides(g.piece.col + 1, g.piece.row)) g.piece.col += 1;
        g._rightHeld = true;
      }
      if (!keys['ArrowRight']) g._rightHeld = false;

      if (keys[' '] && !g._spaceHeld) {
        while (!collides(g.piece.col, g.piece.row + 1)) g.piece.row += 1;
        lockPiece();
        g._spaceHeld = true;
        g.fallTimer = 0;
        return;
      }
      if (!keys[' ']) g._spaceHeld = false;

      var interval = keys['ArrowDown'] ? g.fallInterval / 6 : g.fallInterval;
      g.fallTimer += dt;
      if (g.fallTimer >= interval) {
        g.fallTimer = 0;
        if (!collides(g.piece.col, g.piece.row + 1)) {
          g.piece.row += 1;
        } else {
          lockPiece();
        }
      }
      g.fallInterval = Math.max(0.18, 0.6 - g.score / 4000);
    };

    g.draw = function (ctx) {
      ctx.fillStyle = '#050208';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(155,123,255,0.12)';
      for (var c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + c * cell, offsetY);
        ctx.lineTo(offsetX + c * cell, offsetY + rows * cell);
        ctx.stroke();
      }
      for (var r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + r * cell);
        ctx.lineTo(offsetX + cols * cell, offsetY + r * cell);
        ctx.stroke();
      }

      for (var rr = 0; rr < rows; rr++) {
        for (var cc = 0; cc < cols; cc++) {
          var v = g.grid[rr][cc];
          if (!v) continue;
          ctx.fillStyle = v;
          ctx.fillRect(offsetX + cc * cell + 2, offsetY + rr * cell + 2, cell - 4, cell - 4);
        }
      }

      if (!g.over) {
        ctx.fillStyle = g.piece.color;
        ctx.fillRect(offsetX + g.piece.col * cell + 2, offsetY + g.piece.row * cell + 2, cell - 4, cell - 4);
      }
    };

    return g;
  }

  /* ------------------------------------------------------------------ */
  /* Registry                                                            */
  /* ------------------------------------------------------------------ */
  var GAMES = {
    'volt-invaders': { create: createVoltInvaders },
    'circuit-smash': { create: createCircuitSmash },
    'grid-runner': { create: createGridRunner },
    'signal-breaker': { create: createSignalBreaker }
  };
})();
