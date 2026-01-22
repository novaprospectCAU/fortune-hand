/**
 * 포커 핸드 판정 로직
 *
 * 모든 포커 핸드 타입을 판정하고 HandResult를 반환합니다.
 * 와일드 카드 지원 포함.
 */

import type { Card, HandResult, HandType, Rank, Suit } from '@/types/interfaces';
import {
  getBaseHandValue,
  getHandRanking,
  rankToNumber,
  rankToNumberLow,
} from './handRanks';

// ============================================================
// Helper Types
// ============================================================

interface RankGroup {
  rank: Rank;
  cards: Card[];
  count: number;
}

interface SuitGroup {
  suit: Suit;
  cards: Card[];
  count: number;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * 카드를 랭크별로 그룹핑
 */
export function groupByRank(cards: Card[]): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>();
  for (const card of cards) {
    const existing = groups.get(card.rank) || [];
    existing.push(card);
    groups.set(card.rank, existing);
  }
  return groups;
}

/**
 * 카드를 수트별로 그룹핑
 */
export function groupBySuit(cards: Card[]): Map<Suit, Card[]> {
  const groups = new Map<Suit, Card[]>();
  for (const card of cards) {
    const existing = groups.get(card.suit) || [];
    existing.push(card);
    groups.set(card.suit, existing);
  }
  return groups;
}

/**
 * 랭크 그룹 배열 생성 (카운트 내림차순 정렬)
 */
function getRankGroups(cards: Card[]): RankGroup[] {
  const groups = groupByRank(cards);
  const result: RankGroup[] = [];
  for (const [rank, groupCards] of groups) {
    result.push({ rank, cards: groupCards, count: groupCards.length });
  }
  // 카운트 내림차순, 같으면 랭크 내림차순
  return result.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return rankToNumber(b.rank) - rankToNumber(a.rank);
  });
}

/**
 * 수트 그룹 배열 생성 (카운트 내림차순 정렬)
 */
function getSuitGroups(cards: Card[]): SuitGroup[] {
  const groups = groupBySuit(cards);
  const result: SuitGroup[] = [];
  for (const [suit, groupCards] of groups) {
    result.push({ suit, cards: groupCards, count: groupCards.length });
  }
  return result.sort((a, b) => b.count - a.count);
}

/**
 * 카드를 숫자 값 기준으로 정렬 (내림차순)
 */
function sortByRankDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankToNumber(b.rank) - rankToNumber(a.rank));
}

/**
 * 5장의 연속 카드인지 확인 (일반 스트레이트)
 */
function isSequentialHigh(cards: Card[]): boolean {
  if (cards.length < 5) return false;
  const values = cards.map(c => rankToNumber(c.rank)).sort((a, b) => a - b);
  const unique = [...new Set(values)];
  if (unique.length < 5) return false;

  // 연속 5장 찾기
  for (let i = 0; i <= unique.length - 5; i++) {
    let isSeq = true;
    for (let j = 0; j < 4; j++) {
      const curr = unique[i + j];
      const next = unique[i + j + 1];
      if (curr === undefined || next === undefined || next - curr !== 1) {
        isSeq = false;
        break;
      }
    }
    if (isSeq) return true;
  }
  return false;
}

/**
 * A-2-3-4-5 로우 스트레이트인지 확인
 */
function isWheelStraight(cards: Card[]): boolean {
  if (cards.length < 5) return false;
  const values = cards.map(c => rankToNumberLow(c.rank));
  const unique = new Set(values);
  // A(1), 2, 3, 4, 5가 모두 있어야 함
  return unique.has(1) && unique.has(2) && unique.has(3) && unique.has(4) && unique.has(5);
}

/**
 * 카드 배열에서 연속인 카드들만 추출 (스트레이트 구성 카드)
 */
function getStraightCards(cards: Card[]): Card[] {
  const sorted = sortByRankDesc(cards);

  // 10-J-Q-K-A (하이 스트레이트) 체크
  const highStraightRanks: Rank[] = ['A', 'K', 'Q', 'J', '10'];
  const hasHighStraight = highStraightRanks.every(r =>
    sorted.some(c => c.rank === r)
  );
  if (hasHighStraight) {
    const result: Card[] = [];
    for (const r of highStraightRanks) {
      const card = sorted.find(c => c.rank === r);
      if (card) result.push(card);
    }
    return result;
  }

  // 일반 연속 스트레이트
  const values = sorted.map(c => rankToNumber(c.rank));
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    const startVal = uniqueValues[i];
    if (startVal === undefined) continue;

    const v1 = uniqueValues[i + 1];
    const v2 = uniqueValues[i + 2];
    const v3 = uniqueValues[i + 3];
    const v4 = uniqueValues[i + 4];

    if (v1 === undefined || v2 === undefined || v3 === undefined || v4 === undefined) continue;

    const isSeq = v1 === startVal - 1 && v2 === startVal - 2 && v3 === startVal - 3 && v4 === startVal - 4;
    if (isSeq) {
      const result: Card[] = [];
      for (let j = 0; j < 5; j++) {
        const targetVal = startVal - j;
        const card = sorted.find(
          c => rankToNumber(c.rank) === targetVal && !result.includes(c)
        );
        if (card) result.push(card);
      }
      return result;
    }
  }

  // A-2-3-4-5 휠 스트레이트
  if (isWheelStraight(cards)) {
    const wheelRanks: Rank[] = ['5', '4', '3', '2', 'A'];
    const result: Card[] = [];
    for (const r of wheelRanks) {
      const card = sorted.find(c => c.rank === r);
      if (card) result.push(card);
    }
    return result;
  }

  return [];
}

/**
 * 플러시 카드들만 추출 (같은 수트 5장 이상인 경우)
 */
function getFlushCards(cards: Card[]): Card[] {
  const suitGroups = getSuitGroups(cards);
  const flushSuit = suitGroups.find(g => g.count >= 5);
  if (!flushSuit) return [];
  return sortByRankDesc(flushSuit.cards).slice(0, 5);
}

// ============================================================
// Hand Detection Functions
// ============================================================

/**
 * 펜타곤 판정 (5장이 모두 스페이드 A)
 */
function detectPentagon(cards: Card[]): Card[] | null {
  if (cards.length !== 5) return null;
  const spadeAces = cards.filter(c => c.rank === 'A' && c.suit === 'spades');
  if (spadeAces.length === 5) {
    return spadeAces;
  }
  return null;
}

/**
 * 로열 퀸튜플 판정 (5장이 모두 동일한 무늬의 동일한 수)
 */
function detectRoyalQuintuple(cards: Card[]): Card[] | null {
  if (cards.length !== 5) return null;
  const firstCard = cards[0];
  if (!firstCard) return null;

  const allSameRankAndSuit = cards.every(
    c => c.rank === firstCard.rank && c.suit === firstCard.suit
  );
  if (allSameRankAndSuit) {
    return cards;
  }
  return null;
}

/**
 * 퀸튜플 판정 (5장이 모두 동일한 수)
 */
function detectQuintuple(cards: Card[]): Card[] | null {
  if (cards.length !== 5) return null;
  const firstCard = cards[0];
  if (!firstCard) return null;

  const allSameRank = cards.every(c => c.rank === firstCard.rank);
  if (allSameRank) {
    return cards;
  }
  return null;
}

/**
 * 로열 플러시 판정 (A-K-Q-J-10 같은 무늬)
 */
function detectRoyalFlush(cards: Card[]): Card[] | null {
  const flushCards = getFlushCards(cards);
  if (flushCards.length < 5) return null;

  const royalRanks: Rank[] = ['A', 'K', 'Q', 'J', '10'];
  const hasAllRoyal = royalRanks.every(r => flushCards.some(c => c.rank === r));
  if (!hasAllRoyal) return null;

  const result: Card[] = [];
  for (const r of royalRanks) {
    const card = flushCards.find(c => c.rank === r);
    if (card) result.push(card);
  }
  return result;
}

/**
 * 스트레이트 플러시 판정 (연속 5장 + 같은 무늬)
 */
function detectStraightFlush(cards: Card[]): Card[] | null {
  const suitGroups = getSuitGroups(cards);

  for (const group of suitGroups) {
    if (group.count >= 5) {
      // 해당 수트 카드들로만 스트레이트 체크
      if (isSequentialHigh(group.cards) || isWheelStraight(group.cards)) {
        const straightCards = getStraightCards(group.cards);
        if (straightCards.length === 5) {
          return straightCards;
        }
      }
    }
  }
  return null;
}

/**
 * 포카드 판정 (같은 숫자 4장)
 */
function detectFourOfAKind(cards: Card[]): Card[] | null {
  const rankGroups = getRankGroups(cards);
  const fourGroup = rankGroups.find(g => g.count >= 4);
  if (!fourGroup) return null;

  const fourCards = fourGroup.cards.slice(0, 4);
  // 킥커 추가 (가장 높은 다른 카드)
  const remaining = cards.filter(c => c.rank !== fourGroup.rank);
  if (remaining.length > 0) {
    const sorted = sortByRankDesc(remaining);
    const kicker = sorted[0];
    if (kicker) {
      return [...fourCards, kicker];
    }
  }
  return fourCards;
}

/**
 * 풀하우스 판정 (3장 + 2장)
 */
function detectFullHouse(cards: Card[]): Card[] | null {
  const rankGroups = getRankGroups(cards);
  const threeGroup = rankGroups.find(g => g.count >= 3);
  if (!threeGroup) return null;

  const remainingGroups = rankGroups.filter(g => g.rank !== threeGroup.rank);
  const pairGroup = remainingGroups.find(g => g.count >= 2);
  if (!pairGroup) return null;

  return [...threeGroup.cards.slice(0, 3), ...pairGroup.cards.slice(0, 2)];
}

/**
 * 플러시 판정 (같은 무늬 5장)
 */
function detectFlush(cards: Card[]): Card[] | null {
  const flushCards = getFlushCards(cards);
  return flushCards.length >= 5 ? flushCards : null;
}

/**
 * 스트레이트 판정 (연속 5장)
 */
function detectStraight(cards: Card[]): Card[] | null {
  if (!isSequentialHigh(cards) && !isWheelStraight(cards)) return null;
  const straightCards = getStraightCards(cards);
  return straightCards.length === 5 ? straightCards : null;
}

/**
 * 트리플 판정 (같은 숫자 3장)
 */
function detectThreeOfAKind(cards: Card[]): Card[] | null {
  const rankGroups = getRankGroups(cards);
  const threeGroup = rankGroups.find(g => g.count >= 3);
  if (!threeGroup) return null;

  const threeCards = threeGroup.cards.slice(0, 3);
  // 킥커 추가
  const remaining = sortByRankDesc(cards.filter(c => c.rank !== threeGroup.rank));
  const kickers = remaining.slice(0, 2);
  return [...threeCards, ...kickers];
}

/**
 * 투페어 판정 (페어 2개)
 */
function detectTwoPair(cards: Card[]): Card[] | null {
  const rankGroups = getRankGroups(cards);
  const pairs = rankGroups.filter(g => g.count >= 2);
  if (pairs.length < 2) return null;

  // 가장 높은 2개의 페어
  const topPairs = pairs.slice(0, 2);
  const pair0 = topPairs[0];
  const pair1 = topPairs[1];

  if (!pair0 || !pair1) return null;

  const pairCards: Card[] = [
    ...pair0.cards.slice(0, 2),
    ...pair1.cards.slice(0, 2),
  ];

  // 킥커
  const pairRanks = new Set(topPairs.map(p => p.rank));
  const remaining = sortByRankDesc(cards.filter(c => !pairRanks.has(c.rank)));
  const kicker = remaining[0];
  if (kicker) {
    pairCards.push(kicker);
  }
  return pairCards;
}

/**
 * 원페어 판정 (같은 숫자 2장)
 */
function detectPair(cards: Card[]): Card[] | null {
  const rankGroups = getRankGroups(cards);
  const pairGroup = rankGroups.find(g => g.count >= 2);
  if (!pairGroup) return null;

  const pairCards = pairGroup.cards.slice(0, 2);
  // 킥커 추가
  const remaining = sortByRankDesc(cards.filter(c => c.rank !== pairGroup.rank));
  const kickers = remaining.slice(0, 3);
  return [...pairCards, ...kickers];
}

/**
 * 하이카드 (위 모두 아님)
 */
function detectHighCard(cards: Card[]): Card[] {
  return sortByRankDesc(cards).slice(0, 5);
}

// ============================================================
// Hand Ranking Calculation
// ============================================================

/**
 * 핸드의 세부 순위 계산 (같은 핸드 타입 내에서의 순위)
 * 높을수록 강함
 */
function calculateHandRank(handType: HandType, scoringCards: Card[]): number {
  if (scoringCards.length === 0) return 0;

  // 기본: 가장 높은 카드 기준
  const values = scoringCards.map(c => rankToNumber(c.rank)).sort((a, b) => b - a);

  // 핸드 타입별 순위 계산
  switch (handType) {
    case 'royal_flush':
      return 10000; // 항상 최고

    case 'straight_flush':
    case 'straight': {
      // A-2-3-4-5는 가장 낮은 스트레이트
      if (values.includes(14) && values.includes(2)) {
        return 5; // 휠 스트레이트
      }
      return values[0] ?? 0; // 가장 높은 카드 기준
    }

    case 'four_of_a_kind': {
      const rankGroups = getRankGroups(scoringCards);
      const fourGroup = rankGroups.find(g => g.count >= 4);
      if (fourGroup) {
        const fourRankValue = rankToNumber(fourGroup.rank);
        const kickerValue = values.find(v =>
          scoringCards.find(c => rankToNumber(c.rank) === v && c.rank !== fourGroup.rank)
        ) ?? 0;
        return fourRankValue * 100 + kickerValue;
      }
      return values[0] ?? 0;
    }

    case 'full_house': {
      const rankGroups = getRankGroups(scoringCards);
      const threeGroup = rankGroups.find(g => g.count >= 3);
      const pairGroup = rankGroups.find(g => g.count === 2);
      if (threeGroup && pairGroup) {
        return rankToNumber(threeGroup.rank) * 100 + rankToNumber(pairGroup.rank);
      }
      return values[0] ?? 0;
    }

    case 'flush': {
      // 가장 높은 카드부터 비교
      const v0 = values[0] ?? 0;
      const v1 = values[1] ?? 0;
      const v2 = values[2] ?? 0;
      const v3 = values[3] ?? 0;
      const v4 = values[4] ?? 0;
      return v0 * 10000 + v1 * 1000 + v2 * 100 + v3 * 10 + v4;
    }

    case 'three_of_a_kind': {
      const rankGroups = getRankGroups(scoringCards);
      const threeGroup = rankGroups.find(g => g.count >= 3);
      return threeGroup ? rankToNumber(threeGroup.rank) : (values[0] ?? 0);
    }

    case 'two_pair': {
      const rankGroups = getRankGroups(scoringCards);
      const pairs = rankGroups.filter(g => g.count >= 2).sort(
        (a, b) => rankToNumber(b.rank) - rankToNumber(a.rank)
      );
      const pair0 = pairs[0];
      const pair1 = pairs[1];
      if (pair0 && pair1) {
        const kickerValue = values.find(v => !pairs.some(p => rankToNumber(p.rank) === v)) ?? 0;
        return rankToNumber(pair0.rank) * 1000 + rankToNumber(pair1.rank) * 10 + kickerValue;
      }
      return values[0] ?? 0;
    }

    case 'pair': {
      const rankGroups = getRankGroups(scoringCards);
      const pairGroup = rankGroups.find(g => g.count >= 2);
      return pairGroup ? rankToNumber(pairGroup.rank) : (values[0] ?? 0);
    }

    case 'pentagon':
      return 100000; // 최고 핸드

    case 'royal_quintuple':
      return 50000 + (values[0] ?? 0); // 같은 무늬 같은 수

    case 'quintuple':
      return 40000 + (values[0] ?? 0); // 5장 같은 수

    case 'high_card':
    default: {
      const v0 = values[0] ?? 0;
      const v1 = values[1] ?? 0;
      const v2 = values[2] ?? 0;
      const v3 = values[3] ?? 0;
      const v4 = values[4] ?? 0;
      return v0 * 10000 + v1 * 1000 + v2 * 100 + v3 * 10 + v4;
    }
  }
}

// ============================================================
// Wild Card Support
// ============================================================

/**
 * 와일드 카드 없이 일반 카드만으로 핸드 판정
 */
function evaluateNonWildCards(cards: Card[]): {
  handType: HandType;
  scoringCards: Card[];
} {
  // 높은 핸드부터 순서대로 체크 (새로운 순서)
  const detectors: Array<[HandType, (cards: Card[]) => Card[] | null]> = [
    ['pentagon', detectPentagon],           // 5장 스페이드 A
    ['royal_quintuple', detectRoyalQuintuple], // 5장 같은 무늬 같은 수
    ['quintuple', detectQuintuple],         // 5장 같은 수
    ['royal_flush', detectRoyalFlush],      // 로열 플러시
    ['four_of_a_kind', detectFourOfAKind],  // 포카드
    ['straight_flush', detectStraightFlush], // 스트레이트 플러시
    ['full_house', detectFullHouse],        // 풀하우스
    ['flush', detectFlush],                 // 플러시
    ['straight', detectStraight],           // 스트레이트
    ['three_of_a_kind', detectThreeOfAKind], // 트리플
    ['two_pair', detectTwoPair],            // 투페어
    ['pair', detectPair],                   // 원페어
  ];

  for (const [handType, detector] of detectors) {
    const result = detector(cards);
    if (result) {
      return { handType, scoringCards: result };
    }
  }

  // 하이카드
  return {
    handType: 'high_card',
    scoringCards: detectHighCard(cards),
  };
}

/**
 * 와일드 카드를 최적의 카드로 대체하여 가능한 가장 높은 핸드를 찾습니다.
 */
function evaluateWithWildCards(
  normalCards: Card[],
  wildCards: Card[]
): { handType: HandType; scoringCards: Card[] } {
  if (wildCards.length === 0) {
    return evaluateNonWildCards(normalCards);
  }

  const allRanks: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const allSuits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  let bestResult: { handType: HandType; scoringCards: Card[] } = {
    handType: 'high_card',
    scoringCards: detectHighCard(normalCards),
  };
  let bestRank = -1;

  // 와일드 카드가 1장인 경우 모든 가능한 카드로 대체 시도
  // 와일드 카드가 여러 장인 경우 조합이 너무 많으므로 휴리스틱 사용
  const generateWildReplacements = (
    wildIndex: number,
    currentCards: Card[]
  ): void => {
    if (wildIndex >= wildCards.length) {
      // 모든 와일드 카드가 대체됨
      const result = evaluateNonWildCards(currentCards);
      const rank = getHandRanking(result.handType);
      if (rank > bestRank || (rank === bestRank && calculateHandRank(result.handType, result.scoringCards) > calculateHandRank(bestResult.handType, bestResult.scoringCards))) {
        bestRank = rank;
        bestResult = result;
      }
      return;
    }

    const wild = wildCards[wildIndex];
    if (!wild) return;

    // 와일드 카드가 많으면 모든 조합을 시도하기 어려우므로
    // 2장 이상이면 스마트 휴리스틱 사용
    if (wildCards.length > 1) {
      // 가장 유리한 카드들만 시도
      const existingRanks = new Set(currentCards.map(c => c.rank));
      const existingSuits = new Set(currentCards.map(c => c.suit));

      // 기존 카드와 같은 랭크 시도 (페어, 트리플 등)
      const priorityCards: Array<{ rank: Rank; suit: Suit }> = [];

      // 이미 있는 랭크 우선
      for (const rank of existingRanks) {
        for (const suit of allSuits) {
          priorityCards.push({ rank, suit });
        }
      }

      // 스트레이트/플러시 완성을 위한 카드
      for (const suit of existingSuits) {
        for (const rank of allRanks) {
          if (!priorityCards.some(p => p.rank === rank && p.suit === suit)) {
            priorityCards.push({ rank, suit });
          }
        }
      }

      for (const { rank, suit } of priorityCards.slice(0, 20)) {
        const replacedCard: Card = {
          id: wild.id,
          rank,
          suit,
          isWild: true,
        };
        generateWildReplacements(wildIndex + 1, [...currentCards, replacedCard]);
      }
    } else {
      // 와일드 1장이면 모든 조합 시도
      for (const rank of allRanks) {
        for (const suit of allSuits) {
          const replacedCard: Card = {
            id: wild.id,
            rank,
            suit,
            isWild: true,
          };
          generateWildReplacements(wildIndex + 1, [...currentCards, replacedCard]);
        }
      }
    }
  };

  generateWildReplacements(0, normalCards);

  // 결과의 scoringCards에서 실제 와일드 카드 정보 복원
  // (와일드 카드는 원래 ID를 유지)
  return bestResult;
}

// ============================================================
// Main Export Functions
// ============================================================

/**
 * 카드 배열을 받아 최적의 포커 핸드를 판정합니다.
 * 와일드 카드(isWild=true)가 있으면 가장 높은 핸드가 되도록 자동 판정합니다.
 *
 * @param cards 판정할 카드 배열 (1-5장)
 * @returns HandResult - 핸드 타입, 순위, 점수 카드, 기본 칩/배수
 */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length === 0) {
    return {
      handType: 'high_card',
      rank: 0,
      scoringCards: [],
      baseChips: 5,
      baseMult: 1,
    };
  }

  // 와일드 카드 분리
  const normalCards = cards.filter(c => !c.isWild);
  const wildCards = cards.filter(c => c.isWild);

  let result: { handType: HandType; scoringCards: Card[] };

  if (wildCards.length > 0) {
    result = evaluateWithWildCards(normalCards, wildCards);
    // 와일드 카드를 scoringCards에 포함
    // 실제 와일드 카드 객체를 사용하되, 대체된 정보는 내부 처리용
    const scoringWithWilds: Card[] = result.scoringCards.map(c => {
      if (c.isWild) {
        // 원래 와일드 카드 찾기
        const originalWild = wildCards.find(w => !result.scoringCards.includes(w)) ?? wildCards[0];
        return originalWild ?? c;
      }
      return c;
    });
    result.scoringCards = scoringWithWilds;
  } else {
    result = evaluateNonWildCards(cards);
  }

  const { chips, mult } = getBaseHandValue(result.handType);
  const rank = calculateHandRank(result.handType, result.scoringCards);

  return {
    handType: result.handType,
    rank,
    scoringCards: result.scoringCards,
    baseChips: chips,
    baseMult: mult,
  };
}

/**
 * 두 핸드 결과를 비교합니다.
 *
 * @returns 양수: a가 강함, 음수: b가 강함, 0: 동등
 */
export function compareHands(a: HandResult, b: HandResult): number {
  const typeCompare = getHandRanking(a.handType) - getHandRanking(b.handType);
  if (typeCompare !== 0) return typeCompare;

  // 같은 핸드 타입이면 세부 순위로 비교
  return a.rank - b.rank;
}
