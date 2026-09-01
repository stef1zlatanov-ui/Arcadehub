(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Mobile nav toggle                                                   */
  /* ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  navToggle.addEventListener('click', function () {
    var isOpen = primaryNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  primaryNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      primaryNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------------------ */
  /* Leaderboard data                                                    */
  /* ------------------------------------------------------------------ */
  var boards = {
    'neon-striker': {
      title: 'NEON STRIKER — TOP SCORES',
      scores: [
        ['1', 'VXN', '284,900', 'Aug 22'],
        ['2', 'RGE', '271,150', 'Aug 14'],
        ['3', 'KIP', '260,300', 'Jul 30'],
        ['4', 'ZUL', '248,700', 'Aug 3'],
        ['5', 'MDX', '239,050', 'Jul 19'],
        ['6', 'TAO', '221,400', 'Jul 11']
      ]
    },
    'grid-runner': {
      title: 'GRID RUNNER — TOP SCORES',
      scores: [
        ['1', 'FNX', '198,220', 'Aug 27'],
        ['2', 'BRK', '190,010', 'Aug 20'],
        ['3', 'JLO', '184,660', 'Aug 9'],
        ['4', 'SVN', '176,300', 'Jul 28'],
        ['5', 'PXL', '169,900', 'Jul 22'],
        ['6', 'DYN', '158,450', 'Jul 6']
      ]
    },
    'volt-invaders': {
      title: 'VOLT INVADERS — TOP SCORES',
      scores: [
        ['1', 'OCT', '312,600', 'Aug 30'],
        ['2', 'WRN', '301,150', 'Aug 25'],
        ['3', 'GEC', '295,020', 'Aug 12'],
        ['4', 'LUM', '280,770', 'Aug 1'],
        ['5', 'HXL', '266,300', 'Jul 24'],
        ['6', 'ANT', '250,900', 'Jul 15']
      ]
    },
    'crypt-raiders': {
      title: 'CRYPT RAIDERS — TOP SCORES',
      scores: [
        ['1', 'MRV', '145,800', 'Aug 29'],
        ['2', 'KOA', '139,220', 'Aug 18'],
        ['3', 'ZED', '132,400', 'Aug 6'],
        ['4', 'NVA', '126,950', 'Jul 27'],
        ['5', 'TRX', '118,300', 'Jul 17'],
        ['6', 'BLU', '109,700', 'Jul 2']
      ]
    },
    'signal-breaker': {
      title: 'SIGNAL BREAKER — TOP SCORES',
      scores: [
        ['1', 'QRT', '88,410', 'Aug 31'],
        ['2', 'IVY', '84,900', 'Aug 21'],
        ['3', 'SKN', '81,225', 'Aug 10'],
        ['4', 'ROV', '77,660', 'Jul 31'],
        ['5', 'DEC', '73,050', 'Jul 21'],
        ['6', 'NOX', '68,900', 'Jul 9']
      ]
    },
    'rust-bucket-derby': {
      title: 'RUST BUCKET DERBY — TOP SCORES',
      scores: [
        ['1', 'CRW', '61,300', 'Aug 28'],
        ['2', 'FLT', '58,900', 'Aug 16'],
        ['3', 'GRZ', '55,420', 'Aug 4'],
        ['4', 'YLW', '51,880', 'Jul 26'],
        ['5', 'SND', '48,100', 'Jul 14'],
        ['6', 'PIP', '44,750', 'Jul 4']
      ]
    }
  };

  var boardTabs = document.getElementById('boardTabs');
  var boardTitle = document.getElementById('boardTitle');
  var scoreBody = document.getElementById('scoreBody');

  function renderBoard(key) {
    var data = boards[key];
    if (!data) return;
    boardTitle.textContent = data.title;
    scoreBody.innerHTML = data.scores.map(function (row) {
      return '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td><td>' + row[2] + '</td><td>' + row[3] + '</td></tr>';
    }).join('');
  }

  boardTabs.addEventListener('click', function (e) {
    var btn = e.target.closest('.board-tab');
    if (!btn) return;
    boardTabs.querySelectorAll('.board-tab').forEach(function (tab) {
      tab.classList.remove('is-active');
      tab.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');
    renderBoard(btn.dataset.game);
  });

  renderBoard('neon-striker');

  /* ------------------------------------------------------------------ */
  /* Tournaments                                                         */
  /* ------------------------------------------------------------------ */
  var tournaments = [
    {
      name: 'Neon Striker Championship',
      date: new Date('2026-09-20T18:00:00'),
      format: 'Single elimination · 32 players',
      prize: '$500 pot',
      entry: '$15 entry'
    },
    {
      name: 'Grid Runner Grand Prix',
      date: new Date('2026-10-04T17:00:00'),
      format: 'Time trial league · open entry',
      prize: '$300 pot',
      entry: '$10 entry'
    },
    {
      name: 'Retro Rumble (all-cabinet relay)',
      date: new Date('2026-10-18T16:00:00'),
      format: 'Team relay · teams of 4',
      prize: '$750 pot',
      entry: '$20 per team'
    }
  ];

  var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  var tourneyList = document.getElementById('tourneyList');
  tourneyList.innerHTML = tournaments.map(function (t) {
    return (
      '<article class="tourney-card">' +
        '<div class="tourney-date">' +
          '<span class="day">' + t.date.getDate() + '</span>' +
          '<span class="month">' + months[t.date.getMonth()] + '</span>' +
        '</div>' +
        '<div class="tourney-body">' +
          '<p class="tourney-name">' + t.name + '</p>' +
          '<div class="tourney-meta">' +
            '<span>' + t.format + '</span>' +
            '<span>' + t.prize + '</span>' +
            '<span>' + t.entry + '</span>' +
          '</div>' +
        '</div>' +
        '<a class="btn btn-ghost tourney-cta" href="#visit">Reserve a slot</a>' +
      '</article>'
    );
  }).join('');

  /* ------------------------------------------------------------------ */
  /* Countdown to next tournament                                       */
  /* ------------------------------------------------------------------ */
  var countdownLabel = document.getElementById('countdownLabel');
  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMins = document.getElementById('cd-mins');
  var elSecs = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function nextTournament() {
    var now = new Date();
    var upcoming = tournaments
      .filter(function (t) { return t.date > now; })
      .sort(function (a, b) { return a.date - b.date; });
    return upcoming[0] || null;
  }

  function tickCountdown() {
    var next = nextTournament();
    if (!next) {
      countdownLabel.textContent = 'No tournaments scheduled right now';
      elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = '00';
      return;
    }
    countdownLabel.textContent = 'Next event — ' + next.name + ' — in';
    var diff = next.date - new Date();
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);
})();
