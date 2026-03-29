// 麻雀点数計算クイズ - 問題データ検証テスト
// 実行: node test.js

const fs = require('fs');
eval(fs.readFileSync('problems.js', 'utf-8'));

let passed = 0;
let failed = 0;
const errors = [];

// ========== ユーティリティ ==========

function roundUp100(n) {
  return Math.ceil(n / 100) * 100;
}

// 符・翻から期待点数を計算
function calcExpectedScore(fu, han, isDealer, winType) {
  // 満貫（5翻以上）
  if (han >= 5 && han < 8) {
    if (isDealer) return winType === 'ron' ? { ron: 12000 } : { each: 4000 };
    return winType === 'ron' ? { ron: 8000 } : { ko: 2000, oya: 4000 };
  }
  // 跳満（8翻以上）などは省略

  const bp = fu * Math.pow(2, han + 2);

  if (winType === 'ron') {
    return isDealer ? { ron: roundUp100(bp * 6) } : { ron: roundUp100(bp * 4) };
  } else {
    return isDealer
      ? { each: roundUp100(bp * 2) }
      : { ko: roundUp100(bp), oya: roundUp100(bp * 2) };
  }
}

// ドラ表示牌→実際のドラ牌
function doraFromIndicator(ind) {
  const suit = ind.slice(-1);
  const num = parseInt(ind);
  if (suit === 'z') {
    if (num <= 4) return ((num % 4) + 1) + 'z';
    return ((num - 5) % 3 + 5) + 'z';
  }
  return (num % 9 + 1) + suit;
}

// ========== テスト関数 ==========

function check(id, title, condition, message) {
  if (!condition) {
    errors.push(`❌ #${id} 「${title}」: ${message}`);
    failed++;
    return false;
  }
  return true;
}

function ok(id, title) {
  console.log(`✅ #${id} 「${title}」`);
  passed++;
}

// ========== 各問題を検証 ==========

for (const p of PROBLEMS) {
  let problemOk = true;

  // --- 1. 手牌枚数 ---
  if (!check(p.id, p.title, p.hand.length === 13,
    `手牌が ${p.hand.length} 枚（13枚必要）`)) {
    problemOk = false;
  }

  // --- 2. 点数計算の数値的整合性 ---
  // （fu × 2^(han+2) × 倍率 = score が成立するか）
  const expected = calcExpectedScore(p.answer.fu, p.answer.han, p.isDealer, p.winType);

  if (p.winType === 'ron') {
    if (!check(p.id, p.title, expected.ron === p.answer.score.ron,
      `ロン点数不整合: ${p.answer.fu}符${p.answer.han}翻→期待${expected.ron}点, 設定${p.answer.score.ron}点`)) {
      problemOk = false;
    }
  } else if (p.isDealer) {
    if (!check(p.id, p.title, expected.each === p.answer.score.each,
      `親ツモ各自不整合: ${p.answer.fu}符${p.answer.han}翻→期待${expected.each}点, 設定${p.answer.score.each}点`)) {
      problemOk = false;
    }
  } else {
    const koOk = expected.ko === p.answer.score.ko;
    const oyaOk = expected.oya === p.answer.score.oya;
    if (!check(p.id, p.title, koOk && oyaOk,
      `子ツモ点数不整合: ${p.answer.fu}符${p.answer.han}翻→` +
      `子:期待${expected.ko}実際${p.answer.score.ko}, 親:期待${expected.oya}実際${p.answer.score.oya}`)) {
      problemOk = false;
    }
  }

  // --- 3. 七対子は25符固定 ---
  const isChiitoitsu = p.explanation.yaku.some(y => y.includes('七対子'));
  if (isChiitoitsu) {
    if (!check(p.id, p.title, p.answer.fu === 25,
      `七対子は25符固定（設定: ${p.answer.fu}符）`)) {
      problemOk = false;
    }
  }

  // --- 4. ピンフの符チェック ---
  const hasPinfu = p.explanation.yaku.some(y => y.includes('ピンフ'));
  if (hasPinfu) {
    if (p.winType === 'ron') {
      if (!check(p.id, p.title, p.answer.fu === 30,
        `ピンフロンは30符固定（設定: ${p.answer.fu}符）`)) {
        problemOk = false;
      }
    } else {
      if (!check(p.id, p.title, p.answer.fu === 20,
        `ピンフツモは20符固定（設定: ${p.answer.fu}符）`)) {
        problemOk = false;
      }
    }
  }

  // --- 5. ドラ表示牌→手牌にドラが存在するか ---
  const allTiles = [...p.hand, p.winTile];
  for (const ind of p.doraIndicators) {
    const dora = doraFromIndicator(ind);
    const count = allTiles.filter(t => t === dora).length;
    if (!check(p.id, p.title, count > 0,
      `ドラ表示牌 ${ind} → ドラ ${dora} が手牌+和了牌に存在しない`)) {
      problemOk = false;
    }
  }

  // --- 6. 裏ドラ表示牌→手牌に裏ドラが存在するか ---
  for (const ind of p.uraDoraIndicators) {
    const dora = doraFromIndicator(ind);
    const count = allTiles.filter(t => t === dora).length;
    if (!check(p.id, p.title, count > 0,
      `裏ドラ表示牌 ${ind} → 裏ドラ ${dora} が手牌+和了牌に存在しない`)) {
      problemOk = false;
    }
  }

  // --- 7. リーチなしの手で裏ドラが設定されていないか ---
  if (!p.riichi && p.uraDoraIndicators.length > 0) {
    if (!check(p.id, p.title, false,
      `リーチなしなのに裏ドラが設定されている`)) {
      problemOk = false;
    }
  }

  // --- 8. ツモ手でロン点数、ロン手でツモ点数が設定されていないか ---
  if (p.winType === 'tsumo' && p.answer.score.ron !== undefined) {
    if (!check(p.id, p.title, false, `ツモ手なのにron点数が設定されている`)) {
      problemOk = false;
    }
  }
  if (p.winType === 'ron' && (p.answer.score.ko !== undefined || p.answer.score.each !== undefined)) {
    if (!check(p.id, p.title, false, `ロン手なのにツモ点数が設定されている`)) {
      problemOk = false;
    }
  }

  // --- 9. ハン数の翻数と役の整合性（簡易チェック） ---
  let yakuHan = 0;
  for (const y of p.explanation.yaku) {
    const m = y.match(/(\d+)翻/);
    if (m) yakuHan += parseInt(m[1]);
  }
  if (!check(p.id, p.title, yakuHan === p.answer.han,
    `役の合計翻数(${yakuHan})と answer.han(${p.answer.han})が不一致`)) {
    problemOk = false;
  }

  if (problemOk) ok(p.id, p.title);
}

// ========== 結果 ==========
console.log('\n' + '='.repeat(50));
console.log(`テスト結果: ${passed} 問OK / ${failed} 問NG`);

if (errors.length > 0) {
  console.log('\n--- エラー詳細 ---');
  errors.forEach(e => console.log(e));
}
