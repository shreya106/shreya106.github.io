(function () {
  var root = document.getElementById('game-root');
  if (!root) return;

  var CASES = [
    {
      title: 'The 5-Million-Row Problem',
      symptom: 'A banking job takes 10 minutes every run. Worse, some valid records disappear afterwards.',
      logs: [
        ['', 'INFO  copy records -> temp_table    5,000,000 rows'],
        ['', 'INFO  drop table records'],
        ['', 'INFO  copy temp_table -> records    5,000,000 rows'],
        ['warn', 'WARN  job finished in 10m 04s'],
        ['err', 'ERROR valid records missing after reload']
      ],
      options: [
        'The server needs more memory',
        'The whole table is copied out and back in, when only old rows needed deleting',
        'Too many users were logged in',
        'The network dropped mid-job'
      ],
      answer: 1,
      source: 'FROM MY REAL CASE FILES · LTIMINDTREE',
      explain: 'Moving 5M rows twice is slow and risky. I replaced it with deleting only expired rows on an indexed date column: 10 min → 2 sec, and no valid records lost.'
    },
    {
      title: 'The Vanishing Readings',
      symptom: 'Sensor readings go missing from the dashboard, always right after a worker crashes.',
      logs: [
        ['', 'INFO  consumer-2 received reading #48211'],
        ['', 'INFO  consumer-2 ack sent'],
        ['err', 'ERROR consumer-2 crashed before saving to DB'],
        ['warn', 'WARN  reading #48211 not found; no retry configured']
      ],
      options: [
        'The sensors are faulty',
        'The dashboard chart has a rendering bug',
        'The message was acknowledged before it was saved, with no retry',
        'The database ran out of space'
      ],
      answer: 2,
      source: 'INSPIRED BY MY FERMI ENERGY PIPELINE',
      explain: 'Saying "got it" before saving means a crash loses the data. That is why I built consumers with retries, dead-letter queues and de-duplication.'
    },
    {
      title: 'The Missing Penny',
      symptom: 'After thousands of payments, the totals are off by one cent. Nobody stole it.',
      logs: [
        ['', '> 0.10 + 0.20'],
        ['warn', '0.30000000000000004'],
        ['warn', 'WARN  ledger total != bank total   diff: $0.01'],
        ['', 'INFO  amount column type: float']
      ],
      options: [
        'A hidden bank fee',
        'A timezone mismatch between systems',
        'A currency conversion error',
        'Money stored as floating-point numbers'
      ],
      answer: 3,
      source: 'INSPIRED BY PAYRECON AI',
      explain: 'Floats cannot store most decimals exactly, so tiny errors add up. PayRecon stores money as whole cents (integers), so every penny reconciles.'
    }
  ];

  var RANKS = [
    ['ROOKIE', 'Every detective starts somewhere. The real cases are one scroll up.'],
    ['CONSTABLE', 'A sharp eye. A few more clues and you would have cracked them all.'],
    ['DETECTIVE', 'Impressive work. We should compare notes sometime.'],
    ['CHIEF INSPECTOR', 'Three for three. Clearly we think alike. Let’s talk.']
  ];

  var state = { round: 0, picked: null, score: 0 };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderRound() {
    var c = CASES[state.round];
    var answered = state.picked !== null;
    root.innerHTML = '';
    var card = el('article', 'parchment game-card');

    var top = el('div', 'game-top');
    top.appendChild(el('div', 'tw small muted', 'CASE ' + (state.round + 1) + ' OF ' + CASES.length));
    var dots = el('div', 'dots');
    dots.setAttribute('aria-hidden', 'true');
    CASES.forEach(function (_, i) {
      dots.appendChild(el('span', i < state.round ? 'done' : (i === state.round ? 'now' : '')));
    });
    top.appendChild(dots);
    card.appendChild(top);

    var head = el('div');
    head.appendChild(el('h3', null, c.title));
    head.appendChild(el('p', 'symptom', c.symptom));
    card.appendChild(head);

    var log = el('div', 'log');
    log.appendChild(el('div', 'log-bar', 'evidence.log'));
    var body = el('div', 'log-body');
    c.logs.forEach(function (l) { body.appendChild(el('div', l[0], l[1])); });
    log.appendChild(body);
    card.appendChild(log);

    card.appendChild(el('div', 'who', 'WHO DID IT?'));
    var opts = el('div', 'options');
    c.options.forEach(function (text, i) {
      var b = el('button', 'opt');
      b.type = 'button';
      var mark = String.fromCharCode(65 + i);
      if (answered) {
        b.disabled = true;
        if (i === c.answer) { b.classList.add('right'); mark = '✓'; }
        else if (i === state.picked) { b.classList.add('wrong'); mark = '✗'; }
        else b.classList.add('dim');
      }
      b.appendChild(el('span', 'k', mark));
      b.appendChild(el('span', null, text));
      b.addEventListener('click', function () {
        if (state.picked !== null) return;
        state.picked = i;
        if (i === c.answer) state.score++;
        renderRound();
      });
      opts.appendChild(b);
    });
    card.appendChild(opts);

    if (answered) {
      var correct = state.picked === c.answer;
      var v = el('div', 'verdict');
      var row = el('div', 'verdict-row');
      row.appendChild(el('div', 'stamp' + (correct ? ' ok' : ''), correct ? 'SOLVED' : 'NOT QUITE'));
      row.appendChild(el('div', 'tw small muted', c.source));
      v.appendChild(row);
      v.appendChild(el('p', null, c.explain));
      var last = state.round === CASES.length - 1;
      var next = el('button', 'next', last ? 'SEE MY RANK →' : 'NEXT CASE →');
      next.type = 'button';
      next.addEventListener('click', function () {
        if (last) renderFinal();
        else { state.round++; state.picked = null; renderRound(); }
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      v.appendChild(next);
      card.appendChild(v);
    }
    root.appendChild(card);
    if (answered) {
      var btn = card.querySelector('.next');
      if (btn) btn.focus({ preventScroll: true });
    }
  }

  function renderFinal() {
    root.innerHTML = '';
    var r = RANKS[state.score];
    var card = el('article', 'parchment final-card');
    card.appendChild(el('div', 'tw small muted', 'INVESTIGATION COMPLETE'));
    card.appendChild(el('div', 'score', state.score + ' / ' + CASES.length));
    card.appendChild(el('div', 'tw small muted', 'CASES SOLVED'));
    card.appendChild(el('div', 'stamp', r[0]));
    card.appendChild(el('p', null, r[1]));
    var btns = el('div', 'btns center');
    var again = el('button', 'btn ghost', 'PLAY AGAIN');
    again.type = 'button';
    again.addEventListener('click', function () {
      state = { round: 0, picked: null, score: 0 };
      renderRound();
    });
    var real = el('a', 'btn solid', 'SEE MY REAL CASES');
    real.href = '#cases';
    btns.appendChild(again);
    btns.appendChild(real);
    card.appendChild(btns);
    root.appendChild(card);
  }

  renderRound();
})();
