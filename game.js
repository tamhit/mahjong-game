// 麻雀点数計算クイズ ゲームロジック

const TILE_EMOJI = {
  '1m':'🀇','2m':'🀈','3m':'🀉','4m':'🀊','5m':'🀋','6m':'🀌','7m':'🀍','8m':'🀎','9m':'🀏',
  '1p':'🀙','2p':'🀚','3p':'🀛','4p':'🀜','5p':'🀝','6p':'🀞','7p':'🀟','8p':'🀠','9p':'🀡',
  '1s':'🀐','2s':'🀑','3s':'🀒','4s':'🀓','5s':'🀔','6s':'🀕','7s':'🀖','8s':'🀗','9s':'🀘',
  '1z':'🀀','2z':'🀁','3z':'🀂','4z':'🀃',
  '5z':'🀆','6z':'🀅','7z':'🀄'
};

const WIND_NAME = { '1z':'東','2z':'南','3z':'西','4z':'北' };
const TILE_NAME = {
  '1m':'1萬','2m':'2萬','3m':'3萬','4m':'4萬','5m':'5萬','6m':'6萬','7m':'7萬','8m':'8萬','9m':'9萬',
  '1p':'1筒','2p':'2筒','3p':'3筒','4p':'4筒','5p':'5筒','6p':'6筒','7p':'7筒','8p':'8筒','9p':'9筒',
  '1s':'1索','2s':'2索','3s':'3索','4s':'4索','5s':'5索','6s':'6索','7s':'7索','8s':'8索','9s':'9索',
  '1z':'東','2z':'南','3z':'西','4z':'北','5z':'白','6z':'発','7z':'中'
};

// ドラ表示牌→実際のドラ牌を返す
function doraFromIndicator(ind) {
  const suit = ind.slice(-1);
  const num = parseInt(ind);
  if (suit === 'z') {
    // 字牌: 1→2→3→4→1 (風牌), 5→6→7→5 (三元牌)
    if (num <= 4) return ((num % 4) + 1) + 'z';
    return ((num - 5) % 3 + 5) + 'z';
  }
  return (num % 9 + 1) + suit;
}

function tileToEmoji(tile) {
  return TILE_EMOJI[tile] || tile;
}

function tilesToEmoji(tiles) {
  return tiles.map(tileToEmoji).join('');
}

// ゲーム状態
let state = {
  problemIndex: 0,
  score: 0,
  answered: [],
  showingResult: false
};

function getCurrentProblem() {
  return PROBLEMS[state.problemIndex];
}

function renderProblem() {
  const p = getCurrentProblem();
  const container = document.getElementById('quiz-area');

  // ドラ計算
  const doraList = p.doraIndicators.map(doraFromIndicator);
  const uraDoraList = p.uraDoraIndicators.map(doraFromIndicator);

  // 待ちタイプ判定
  const winTypeLabel = p.winType === 'ron' ? 'ロン' : 'ツモ';
  const dealerLabel = p.isDealer ? '親' : '子';

  container.innerHTML = `
    <div class="problem-header">
      <span class="difficulty ${p.difficulty}">${p.difficulty}</span>
      <span class="problem-num">問題 ${state.problemIndex + 1} / ${PROBLEMS.length}</span>
    </div>
    <h2 class="problem-title">${p.title}</h2>

    <div class="info-grid">
      <div class="info-item"><span class="info-label">場風</span><span>${tileToEmoji(p.roundWind)} ${WIND_NAME[p.roundWind]}</span></div>
      <div class="info-item"><span class="info-label">自風</span><span>${tileToEmoji(p.seatWind)} ${WIND_NAME[p.seatWind]}</span></div>
      <div class="info-item"><span class="info-label">親子</span><span class="${p.isDealer ? 'dealer' : 'ko'}">${dealerLabel}</span></div>
      <div class="info-item"><span class="info-label">和了</span><span class="win-type">${winTypeLabel}</span></div>
      ${p.riichi ? `<div class="info-item full-width"><span class="info-label">リーチ</span><span class="riichi-badge">${p.ippatsu ? 'あり（一発）' : 'あり'}</span></div>` : ''}
    </div>

    <div class="hand-area">
      <div class="hand-label">手牌</div>
      <div class="tiles hand-tiles">${tilesToEmoji(p.hand)}</div>
      <div class="win-tile-area">
        <span class="win-label">${winTypeLabel}</span>
        <span class="tiles win-tile">${tileToEmoji(p.winTile)}</span>
      </div>
    </div>

    ${doraList.length > 0 ? `
    <div class="dora-area">
      <span class="dora-label">ドラ表示牌</span>
      <span class="tiles">${tilesToEmoji(p.doraIndicators)}</span>
      <span class="dora-arrow">→ ドラ: ${tilesToEmoji(doraList)}</span>
    </div>` : ''}

    ${uraDoraList.length > 0 ? `
    <div class="dora-area ura">
      <span class="dora-label">裏ドラ表示牌</span>
      <span class="tiles">${tilesToEmoji(p.uraDoraIndicators)}</span>
      <span class="dora-arrow">→ 裏ドラ: ${tilesToEmoji(uraDoraList)}</span>
    </div>` : ''}

    <div class="answer-form">
      <h3>あなたの答えを入力してください</h3>
      <div class="input-row">
        <label>符<input type="number" id="inp-fu" min="0" max="130" step="10" inputmode="numeric"></label>
        <label>翻<input type="number" id="inp-han" min="0" max="13" inputmode="numeric"></label>
      </div>
      ${renderScoreInputs(p)}
      <button id="btn-submit" class="btn-primary" onclick="submitAnswer()">答える</button>
    </div>
  `;

  document.getElementById('progress-bar').style.width =
    ((state.problemIndex) / PROBLEMS.length * 100) + '%';
}

function renderScoreInputs(p) {
  if (p.winType === 'ron') {
    return `
    <div class="input-row">
      <label>点数（ロン払い）<input type="number" id="inp-score" min="0" step="100" inputmode="numeric"></label>
    </div>`;
  } else if (p.isDealer) {
    return `
    <div class="input-row">
      <label>各自から（親ツモ）<input type="number" id="inp-each" min="0" step="100" inputmode="numeric"></label>
    </div>`;
  } else {
    return `
    <div class="input-row two-col">
      <label>子から<input type="number" id="inp-ko" min="0" step="100" inputmode="numeric"></label>
      <label>親から<input type="number" id="inp-oya" min="0" step="100" inputmode="numeric"></label>
    </div>`;
  }
}

function submitAnswer() {
  if (state.showingResult) return;
  const p = getCurrentProblem();

  const fuInput = parseInt(document.getElementById('inp-fu').value) || 0;
  const hanInput = parseInt(document.getElementById('inp-han').value) || 0;

  let scoreInput = {};
  let scoreCorrect = false;

  if (p.winType === 'ron') {
    scoreInput.ron = parseInt(document.getElementById('inp-score').value) || 0;
    scoreCorrect = scoreInput.ron === p.answer.score.ron;
  } else if (p.isDealer) {
    scoreInput.each = parseInt(document.getElementById('inp-each').value) || 0;
    scoreCorrect = scoreInput.each === p.answer.score.each;
  } else {
    scoreInput.ko = parseInt(document.getElementById('inp-ko').value) || 0;
    scoreInput.oya = parseInt(document.getElementById('inp-oya').value) || 0;
    scoreCorrect = scoreInput.ko === p.answer.score.ko && scoreInput.oya === p.answer.score.oya;
  }

  const fuCorrect = fuInput === p.answer.fu;
  const hanCorrect = hanInput === p.answer.han;
  const allCorrect = fuCorrect && hanCorrect && scoreCorrect;

  if (allCorrect) state.score++;
  state.showingResult = true;

  renderResult(p, fuInput, hanInput, scoreInput, fuCorrect, hanCorrect, scoreCorrect, allCorrect);
}

function renderResult(p, fuInput, hanInput, scoreInput, fuCorrect, hanCorrect, scoreCorrect, allCorrect) {
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result-area ' + (allCorrect ? 'correct' : 'incorrect');

  let scoreResultHTML = '';
  if (p.winType === 'ron') {
    scoreResultHTML = resultItem('点数（ロン）', scoreInput.ron + '点', p.answer.score.ron + '点', scoreCorrect);
  } else if (p.isDealer) {
    scoreResultHTML = resultItem('各自（親ツモ）', scoreInput.each + '点', p.answer.score.each + '点', scoreCorrect);
  } else {
    const inputStr = `子${scoreInput.ko}点 / 親${scoreInput.oya}点`;
    const answerStr = `子${p.answer.score.ko}点 / 親${p.answer.score.oya}点`;
    scoreResultHTML = resultItem('点数（ツモ）', inputStr, answerStr, scoreCorrect);
  }

  resultDiv.innerHTML = `
    <div class="result-banner">${allCorrect ? '✓ 正解！' : '✗ 不正解'}</div>
    <div class="result-items">
      ${resultItem('符', fuInput + '符', p.answer.fu + '符', fuCorrect)}
      ${resultItem('翻', hanInput + '翻', p.answer.han + '翻', hanCorrect)}
      ${scoreResultHTML}
    </div>
    <div class="explanation">
      <div class="exp-section">
        <strong>役</strong>
        <ul>${p.explanation.yaku.map(y => `<li>${y}</li>`).join('')}</ul>
      </div>
      <div class="exp-section">
        <strong>符計算</strong>
        <ul>${p.explanation.fuBreakdown.map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
    </div>
    <button class="btn-primary" onclick="nextProblem()">${state.problemIndex < PROBLEMS.length - 1 ? '次の問題 →' : '結果を見る'}</button>
  `;

  document.querySelector('.answer-form').replaceWith(resultDiv);
  document.querySelector('#btn-submit')?.remove();

  // スコア更新
  document.getElementById('score-display').textContent =
    `${state.score} / ${state.problemIndex + 1}`;
}

function resultItem(label, input, correct, isCorrect) {
  return `
    <div class="result-item ${isCorrect ? 'ok' : 'ng'}">
      <span class="ri-label">${label}</span>
      <span class="ri-input">${input}</span>
      <span class="ri-mark">${isCorrect ? '✓' : '✗'}</span>
      ${!isCorrect ? `<span class="ri-correct">正解: ${correct}</span>` : ''}
    </div>`;
}

function nextProblem() {
  state.showingResult = false;
  if (state.problemIndex < PROBLEMS.length - 1) {
    state.problemIndex++;
    renderProblem();
  } else {
    renderFinalScore();
  }
}

function renderFinalScore() {
  const pct = Math.round(state.score / PROBLEMS.length * 100);
  let rank = '';
  if (pct === 100) rank = '🏆 パーフェクト！';
  else if (pct >= 80) rank = '⭐ 優秀！';
  else if (pct >= 60) rank = '👍 合格！';
  else rank = '📖 もう少し練習しよう';

  document.getElementById('quiz-area').innerHTML = `
    <div class="final-score">
      <h2>クイズ終了！</h2>
      <div class="big-score">${state.score} / ${PROBLEMS.length}</div>
      <div class="percent">${pct}%</div>
      <div class="rank">${rank}</div>
      <button class="btn-primary" onclick="restartGame()">もう一度挑戦</button>
    </div>
  `;
  document.getElementById('progress-bar').style.width = '100%';
  document.getElementById('score-display').textContent =
    `${state.score} / ${PROBLEMS.length}`;
}

function restartGame() {
  state = { problemIndex: 0, score: 0, answered: [], showingResult: false };
  document.getElementById('score-display').textContent = '0 / 0';
  renderProblem();
}

// 初期化
window.addEventListener('DOMContentLoaded', () => {
  renderProblem();
});
