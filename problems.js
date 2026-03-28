// 麻雀点数計算クイズ 問題集
// 牌記法: 1m-9m=萬子, 1p-9p=筒子, 1s-9s=索子
//         1z=東 2z=南 3z=西 4z=北 5z=白 6z=発 7z=中
// dora: 実際のドラ牌（表示牌の次）を手牌の中のドラをリスト
// hand: 13枚, winTile: 和了牌(14枚目)
// score.ron: ロンの場合の支払い点数
// score.ko: ツモの場合 子の支払い, score.oya: 親の支払い
// score.each: 親ツモの場合 各自の支払い

const PROBLEMS = [
  // ────────────────────────────
  // 初級
  // ────────────────────────────
  {
    id: 1,
    difficulty: '初級',
    title: 'タンヤオ＋ピンフ',
    hand: ['2m','3m','4m','5m','6m','7m','3p','4p','5p','4s','5s','8s','8s'],
    winTile: '3s',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '2z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    answer: { fu: 30, han: 2, score: { ron: 2000 } },
    explanation: {
      yaku: ['タンヤオ: 1翻', 'ピンフ: 1翻'],
      fuBreakdown: [
        '副底: 30',
        '面子（全て順子）: 0',
        '雀頭（8索、役牌なし）: 0',
        '待ち（両面: 4索5索→3索or6索）: 0',
        '→ ピンフロンは固定30符'
      ]
    }
  },
  {
    id: 2,
    difficulty: '初級',
    title: '役牌（中）',
    hand: ['5m','6m','7m','2p','3p','4p','4s','5s','7z','7z','7z','9m','9m'],
    winTile: '3s',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '4z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    // 完成形: [5m6m7m][2p3p4p][3s4s5s][7z7z7z][9m9m]
    // 待ち: 4索5索→両面（3索or6索）→3索でロン
    answer: { fu: 40, han: 1, score: { ron: 1300 } },
    explanation: {
      yaku: ['役牌（中）: 1翻'],
      fuBreakdown: [
        '副底（ロン）: 30',
        '暗刻（7z=中、字牌）: 8',
        '雀頭（9萬、役牌なし）: 0',
        '待ち（両面）: 0',
        '合計: 38 → 切り上げ40符'
      ]
    }
  },
  {
    id: 3,
    difficulty: '初級',
    title: 'リーチ（カンチャン待ち）',
    hand: ['7m','8m','9m','1p','2p','3p','4p','5p','6p','1s','3s','5s','5s'],
    winTile: '2s',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '3z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: true,
    ippatsu: false,
    // 完成形: [7m8m9m][1p2p3p][4p5p6p][1s2s3s][5s5s]
    // 待ち: 1索3索→カンチャン（2索）
    answer: { fu: 40, han: 1, score: { ron: 1300 } },
    explanation: {
      yaku: ['リーチ: 1翻'],
      fuBreakdown: [
        '副底（ロン）: 30',
        '面子（全て順子）: 0',
        '雀頭（5索、役牌なし）: 0',
        '待ち（カンチャン: 1索3索→2索）: 2',
        '合計: 32 → 切り上げ40符'
      ]
    }
  },
  {
    id: 4,
    difficulty: '初級',
    title: 'タンヤオ（ツモ）',
    hand: ['2m','3m','4m','5m','6m','7m','3p','4p','5p','6s','7s','8s','8s'],
    winTile: '5s',
    winType: 'tsumo',
    isDealer: false,
    roundWind: '1z',
    seatWind: '3z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    // 完成形: [2m3m4m][5m6m7m][3p4p5p][5s6s7s][8s8s]
    // 待ち: 6索7索→両面（5索or8索）→5索をツモ
    answer: { fu: 40, han: 2, score: { ko: 700, oya: 1300 } },
    explanation: {
      yaku: ['タンヤオ: 1翻', '門前清自摸和: 1翻'],
      fuBreakdown: [
        '副底: 30',
        '面子（全て順子）: 0',
        '雀頭（8索、役牌なし）: 0',
        '待ち（両面）: 0',
        'ツモ符: 2',
        '合計: 32 → 切り上げ40符',
        '子ツモ 2翻40符: 子から700点、親から1300点'
      ]
    }
  },
  {
    id: 5,
    difficulty: '初級',
    title: '役牌（中）・親ロン',
    hand: ['5m','6m','7m','3p','4p','5p','7s','8s','9s','7z','7z','7z','5p'],
    winTile: '5p',
    winType: 'ron',
    isDealer: true,
    roundWind: '1z',
    seatWind: '1z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    // 完成形: [5m6m7m][3p4p5p][7s8s9s][7z7z7z][5p5p]
    // 待ち: 5筒→単騎
    // ※ 5p in hand (×1 tanki) + win 5p = pair [5p5p]
    //   [3p4p5p] uses different 3p,4p,5p tiles
    answer: { fu: 40, han: 1, score: { ron: 2000 } },
    explanation: {
      yaku: ['役牌（中）: 1翻'],
      fuBreakdown: [
        '副底（ロン）: 30',
        '暗刻（7z=中、字牌）: 8',
        '雀頭（5筒、役牌なし）: 0',
        '待ち（単騎: 5筒）: 2',
        '合計: 40符',
        '親ロン 1翻40符: 2000点'
      ]
    }
  },

  // ────────────────────────────
  // 中級
  // ────────────────────────────
  {
    id: 6,
    difficulty: '中級',
    title: 'リーチ＋タンヤオ＋ドラ1',
    hand: ['3m','4m','5m','6m','7m','8m','3p','4p','5p','5s','7s','8s','8s'],
    winTile: '6s',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '2z',
    doraIndicators: ['5m'],  // ドラ表示牌5萬→ドラ6萬(手牌に1枚)
    uraDoraIndicators: [],
    riichi: true,
    ippatsu: false,
    // 完成形: [3m4m5m][6m7m8m][3p4p5p][5s6s7s][8s8s]
    // 待ち: 5索7索→カンチャン（6索）
    // ドラ: 6萬（表示牌5萬の次）×1
    answer: { fu: 40, han: 3, score: { ron: 5200 } },
    explanation: {
      yaku: ['リーチ: 1翻', 'タンヤオ: 1翻', 'ドラ1: 1翻'],
      fuBreakdown: [
        '副底（ロン）: 30',
        '面子（全て順子）: 0',
        '雀頭（8索、役牌なし）: 0',
        '待ち（カンチャン: 5索7索→6索）: 2',
        '合計: 32 → 切り上げ40符',
        '※ ドラ表示牌5萬→ドラ6萬（手牌に1枚）'
      ]
    }
  },
  {
    id: 7,
    difficulty: '中級',
    title: 'リーチ＋ツモ＋ピンフ',
    hand: ['1p','2p','3p','4p','5p','6p','7p','8p','9p','3m','4m','5s','5s'],
    winTile: '2m',
    winType: 'tsumo',
    isDealer: false,
    roundWind: '1z',
    seatWind: '2z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: true,
    ippatsu: false,
    // 完成形: [1p2p3p][4p5p6p][7p8p9p][2m3m4m][5s5s]
    // 待ち: 3萬4萬→両面（2萬or5萬）→2萬をツモ
    answer: { fu: 20, han: 3, score: { ko: 700, oya: 1300 } },
    explanation: {
      yaku: ['リーチ: 1翻', '門前清自摸和: 1翻', 'ピンフ: 1翻'],
      fuBreakdown: [
        '→ ピンフツモは特例で固定20符',
        '（通常: 副底30+ツモ2+両面0=32→40符 だが、',
        '　ピンフツモは常に20符と定められている）',
        '子ツモ 3翻20符: 子から700点、親から1300点'
      ]
    }
  },
  {
    id: 8,
    difficulty: '中級',
    title: '役牌（白＋発）',
    hand: ['5m','6m','7m','1p','2p','3p','5z','5z','5z','6z','6z','6z','9s'],
    winTile: '9s',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '3z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    // 完成形: [5m6m7m][1p2p3p][5z5z5z][6z6z6z][9s9s]
    // 待ち: 9索→単騎
    answer: { fu: 50, han: 2, score: { ron: 3200 } },
    explanation: {
      yaku: ['役牌（白）: 1翻', '役牌（発）: 1翻'],
      fuBreakdown: [
        '副底（ロン）: 30',
        '暗刻（5z=白、字牌）: 8',
        '暗刻（6z=発、字牌）: 8',
        '雀頭（9索、役牌なし）: 0',
        '待ち（単騎: 9索）: 2',
        '合計: 48 → 切り上げ50符'
      ]
    }
  },
  {
    id: 9,
    difficulty: '中級',
    title: 'リーチ＋タンヤオ＋ピンフ＋ドラ1・親ロン',
    hand: ['2p','3p','4p','5p','6p','7p','3s','4s','5s','6s','7s','4m','4m'],
    winTile: '8s',
    winType: 'ron',
    isDealer: true,
    roundWind: '1z',
    seatWind: '1z',
    doraIndicators: ['5p'],  // ドラ表示牌5筒→ドラ6筒(手牌に1枚)
    uraDoraIndicators: [],
    riichi: true,
    ippatsu: false,
    // 完成形: [2p3p4p][5p6p7p][3s4s5s][6s7s8s][4m4m]
    // 待ち: 6索7索→両面（5索or8索）→8索でロン
    // ドラ: 6筒（表示牌5筒の次）×1
    answer: { fu: 30, han: 4, score: { ron: 11600 } },
    explanation: {
      yaku: ['リーチ: 1翻', 'タンヤオ: 1翻', 'ピンフ: 1翻', 'ドラ1: 1翻'],
      fuBreakdown: [
        '→ ピンフロン: 固定30符',
        '（全て順子、両面待ち、非役牌雀頭）',
        '※ ドラ表示牌5筒→ドラ6筒（手牌に1枚）',
        '4翻30符 親ロン: 11600点'
      ]
    }
  },
  {
    id: 10,
    difficulty: '中級',
    title: 'リーチ＋裏ドラ1（ペンチャン待ち）',
    hand: ['1m','2m','3m','4m','5m','6m','7m','8m','9m','2p','3p','5s','5s'],
    winTile: '1p',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '4z',
    doraIndicators: [],
    uraDoraIndicators: ['4m'],  // 裏ドラ表示牌4萬→裏ドラ5萬(手牌に1枚)
    riichi: true,
    ippatsu: false,
    // 完成形: [1m2m3m][4m5m6m][7m8m9m][1p2p3p][5s5s]
    // 待ち: 2筒3筒→ペンチャン（1筒のみ）
    // 裏ドラ: 5萬（裏表示牌4萬の次）×1
    answer: { fu: 40, han: 2, score: { ron: 2600 } },
    explanation: {
      yaku: ['リーチ: 1翻', '裏ドラ1: 1翻'],
      fuBreakdown: [
        '副底（ロン）: 30',
        '面子（全て順子）: 0',
        '雀頭（5索、役牌なし）: 0',
        '待ち（ペンチャン: 2筒3筒→1筒のみ）: 2',
        '合計: 32 → 切り上げ40符',
        '※ 裏ドラ表示牌4萬→裏ドラ5萬（手牌に1枚）'
      ]
    }
  },

  // ────────────────────────────
  // 上級
  // ────────────────────────────
  {
    id: 11,
    difficulty: '上級',
    title: 'リーチ＋タンヤオ＋ドラ3（満貫）',
    hand: ['3m','4m','5m','6m','7m','8m','3p','4p','5p','5s','7s','4s','4s'],
    winTile: '6s',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '3z',
    doraIndicators: ['5m', '3s'],  // 5萬→6萬(1枚), 3索→4索(2枚=雀頭)
    uraDoraIndicators: [],
    riichi: true,
    ippatsu: false,
    // 完成形: [3m4m5m][6m7m8m][3p4p5p][5s6s7s][4s4s]
    // 待ち: 5索7索→カンチャン（6索）
    // ドラ: 6萬×1 + 4索×2（表示牌3索→4索、雀頭が全部ドラ）
    answer: { fu: 40, han: 5, score: { ron: 8000 } },
    explanation: {
      yaku: ['リーチ: 1翻', 'タンヤオ: 1翻', 'ドラ1: 1翻', 'ドラ2: 1翻', 'ドラ3: 1翻'],
      fuBreakdown: [
        '副底（ロン）: 30',
        '面子（全て順子）: 0',
        '雀頭（4索、役牌なし）: 0',
        '待ち（カンチャン: 5索7索→6索）: 2',
        '合計: 32 → 切り上げ40符',
        '5翻以上 → 満貫: 8000点',
        '※ ドラ: 6萬×1（表示牌5萬）＋ 4索×2（表示牌3索、雀頭）'
      ]
    }
  },
  {
    id: 12,
    difficulty: '上級',
    title: '役牌（中）＋ツモ・親ツモ',
    hand: ['4m','5m','6m','3p','4p','5p','5s','6s','7s','7z','7z','7z','9m'],
    winTile: '9m',
    winType: 'tsumo',
    isDealer: true,
    roundWind: '1z',
    seatWind: '1z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    // 完成形: [4m5m6m][3p4p5p][5s6s7s][7z7z7z][9m9m]
    // 待ち: 9萬→単騎（ツモ）
    answer: { fu: 50, han: 2, score: { each: 1600 } },
    explanation: {
      yaku: ['役牌（中）: 1翻', '門前清自摸和: 1翻'],
      fuBreakdown: [
        '副底: 30',
        '暗刻（7z=中、字牌）: 8',
        '面子（順子×3）: 0',
        '雀頭（9萬、役牌なし）: 0',
        '待ち（単騎: 9萬）: 2',
        'ツモ符: 2',
        '合計: 42 → 切り上げ50符',
        '親ツモ 2翻50符: 各自1600点（合計4800点）'
      ]
    }
  },
  {
    id: 13,
    difficulty: '上級',
    title: 'リーチ＋一発＋ツモ（カンチャン）',
    hand: ['2m','3m','4m','5m','6m','7m','3p','4p','5p','6s','8s','5s','5s'],
    winTile: '7s',
    winType: 'tsumo',
    isDealer: false,
    roundWind: '2z',
    seatWind: '3z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: true,
    ippatsu: true,
    // 完成形: [2m3m4m][5m6m7m][3p4p5p][6s7s8s][5s5s]
    // 待ち: 6索8索→カンチャン（7索）→ツモ
    answer: { fu: 40, han: 3, score: { ko: 1300, oya: 2600 } },
    explanation: {
      yaku: ['リーチ: 1翻', '一発: 1翻', '門前清自摸和: 1翻'],
      fuBreakdown: [
        '副底: 30',
        '面子（全て順子）: 0',
        '雀頭（5索、役牌なし）: 0',
        '待ち（カンチャン: 6索8索→7索）: 2',
        'ツモ符: 2',
        '合計: 34 → 切り上げ40符',
        '子ツモ 3翻40符: 子から1300点、親から2600点'
      ]
    }
  },
  {
    id: 14,
    difficulty: '上級',
    title: 'タンヤオ＋一盃口＋ピンフ',
    hand: ['3m','4m','5m','3m','4m','5m','3p','4p','5p','4s','5s','7p','7p'],
    winTile: '3s',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '2z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    // 完成形: [3m4m5m][3m4m5m][3p4p5p][3s4s5s][7p7p]
    // 待ち: 4索5索→両面（3索or6索）→3索でロン
    // 一盃口: [3m4m5m]×2（同じ順子2組）
    answer: { fu: 30, han: 3, score: { ron: 3900 } },
    explanation: {
      yaku: ['タンヤオ: 1翻', '一盃口: 1翻', 'ピンフ: 1翻'],
      fuBreakdown: [
        '→ ピンフロン: 固定30符',
        '（全て順子、両面待ち、非役牌雀頭）',
        '一盃口: 同じ順子2組 [3萬4萬5萬]×2',
        '3翻30符 子ロン: 3900点'
      ]
    }
  },
  {
    id: 15,
    difficulty: '上級',
    title: '七対子',
    hand: ['1m','1m','3m','3m','5p','5p','7p','7p','2s','2s','4s','4s','6z'],
    winTile: '6z',
    winType: 'ron',
    isDealer: false,
    roundWind: '1z',
    seatWind: '4z',
    doraIndicators: [],
    uraDoraIndicators: [],
    riichi: false,
    ippatsu: false,
    // 完成形: [1m1m][3m3m][5p5p][7p7p][2s2s][4s4s][6z6z]
    // 待ち: 6z→単騎
    answer: { fu: 25, han: 2, score: { ron: 1600 } },
    explanation: {
      yaku: ['七対子: 2翻'],
      fuBreakdown: [
        '七対子は固定25符',
        '（通常の符計算は適用しない）',
        '2翻25符 子ロン: 1600点'
      ]
    }
  }
];
