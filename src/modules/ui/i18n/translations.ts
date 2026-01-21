/**
 * Translation strings for Fortune's Hand
 */

export type Language = 'en' | 'ko';

export const translations = {
  en: {
    // Game title
    gameTitle: "Fortune's Hand",
    gameSubtitle: "Card x Slot x Roulette Deckbuilder",
    gameDescription: "Spin the slot, play your cards, and risk it all on the roulette.",
    gameChallenge: "Can you beat all 8 rounds?",

    // Phases
    slotPhase: "Slot Phase",
    drawPhase: "Draw Phase",
    playPhase: "Play Phase",
    scorePhase: "Score Phase",
    roulettePhase: "Roulette Phase",
    rewardPhase: "Reward Phase",
    shopPhase: "Shop Phase",
    gameOver: "Game Over",

    // Common actions
    continue: "Continue",
    skip: "Skip",
    confirm: "Confirm",
    cancel: "Cancel",
    play: "Play",
    discard: "Discard",
    buy: "Buy",
    reroll: "Reroll",
    leave: "Leave",
    remove: "Remove",
    accept: "Accept",
    retry: "Retry",

    // Slot phase
    roundTurn: "Round {round} - Turn {turn}",
    spinToBegin: "Spin the slot to begin your turn!",
    slotResult: "Slot Result",
    jackpot: "JACKPOT!",
    clickContinueToDraw: "Click Continue to draw cards",

    // Draw phase
    drawingCards: "Drawing Cards...",
    preparingHand: "Preparing your hand",

    // Play phase
    selectUpTo5: "Select up to 5 cards to play",

    // Score phase
    chips: "Chips",
    mult: "Mult",

    // Roulette phase
    riskTheRoulette: "Risk the Roulette?",
    retrySpin: "Retry Spin!",
    baseScore: "Base Score",
    penaltyApplied: "(-25% penalty applied)",
    retryWithPenalty: "Retry (-25%)",

    // Reward phase
    turnComplete: "Turn Complete!",
    keptScore: "You kept your score",
    roulette: "Roulette",

    // Shop
    shop: "Shop",
    continueShipping: "Continue Shopping",
    sold: "SOLD",
    gold: "Gold",

    // Game over
    youReachedRound: "You reached Round {round}",
    finalScore: "Final Score",
    betterLuckNextTime: "Better luck next time!",

    // Round clear
    roundCleared: "Round {round} Cleared!",
    congratulations: "Congratulations!",

    // Hand types
    highCard: "High Card",
    pair: "Pair",
    twoPair: "Two Pair",
    threeOfAKind: "Three of a Kind",
    straight: "Straight",
    flush: "Flush",
    fullHouse: "Full House",
    fourOfAKind: "Four of a Kind",
    straightFlush: "Straight Flush",
    royalFlush: "Royal Flush",

    // Card effects
    wildEffect: "Wild: Can be any rank or suit",
    goldEffect: "Gold: Earn gold instead of score",
    slotEffect: "Slot: Triggers mini slot when played",
    rouletteEffect: "Roulette: Extra roulette chance",
    multEffect: "Mult +{value}: Adds +{value} mult",
    chipsEffect: "Chips +{value}: Adds +{value} chips",
    goldBonusEffect: "Gold +{value}: Earns +{value} gold on score",
    retriggerEffect: "Retrigger: This card triggers {count} times",

    // Slot effects
    extraDraw: "+{n} extra draw",
    handSize: "+{n} hand size",
    scoreMultiplier: "x{n} score",
    safeZone: "+{n}% safe zone",
    maxMult: "+{n}x max mult",
    freeSpin: "{n} free spin",
    instantGold: "+{n} gold",
    instantChips: "+{n} chips",
    cardsDiscarded: "-{n} cards discarded",
    rouletteSkipped: "roulette skipped",
    loseGold: "-{n} gold",
    noEffects: "No effects",

    // Deck viewer
    viewDeck: "View Deck",
    deck: "Deck",
    cardsInDeck: "Cards in Deck",
    discardPile: "Discard Pile",
    close: "Close",

    // Joker
    joker: "Joker",
    removeJoker: "Remove Joker?",
    jokerWillBeRemoved: "This joker will be permanently removed.",

    // Pack
    cardAcquired: "Card Acquired!",
    packOpened: "Pack Opened!",
    cardAddedToDeck: "1 card added to your deck",
    cardsAddedToDeck: "{n} cards added to your deck",

    // Resources
    hands: "Hands",
    discards: "Discards",

    // Settings
    language: "Language",
    english: "English",
    korean: "한국어",
  },

  ko: {
    // Game title
    gameTitle: "Fortune's Hand",
    gameSubtitle: "카드 x 슬롯 x 룰렛 덱빌더",
    gameDescription: "슬롯을 돌리고, 카드를 플레이하고, 룰렛에 모든 것을 걸어보세요.",
    gameChallenge: "8라운드를 모두 클리어할 수 있을까요?",

    // Phases
    slotPhase: "슬롯 단계",
    drawPhase: "드로우 단계",
    playPhase: "플레이 단계",
    scorePhase: "점수 단계",
    roulettePhase: "룰렛 단계",
    rewardPhase: "보상 단계",
    shopPhase: "상점",
    gameOver: "게임 오버",

    // Common actions
    continue: "계속",
    skip: "스킵",
    confirm: "확인",
    cancel: "취소",
    play: "플레이",
    discard: "버리기",
    buy: "구매",
    reroll: "리롤",
    leave: "나가기",
    remove: "제거",
    accept: "수락",
    retry: "재도전",

    // Slot phase
    roundTurn: "라운드 {round} - 턴 {turn}",
    spinToBegin: "슬롯을 돌려 턴을 시작하세요!",
    slotResult: "슬롯 결과",
    jackpot: "잭팟!",
    clickContinueToDraw: "계속을 눌러 카드를 드로우하세요",

    // Draw phase
    drawingCards: "카드 드로우 중...",
    preparingHand: "패 준비 중",

    // Play phase
    selectUpTo5: "플레이할 카드를 최대 5장 선택하세요",

    // Score phase
    chips: "칩",
    mult: "배수",

    // Roulette phase
    riskTheRoulette: "룰렛에 도전하시겠습니까?",
    retrySpin: "재도전!",
    baseScore: "기본 점수",
    penaltyApplied: "(-25% 페널티 적용됨)",
    retryWithPenalty: "재도전 (-25%)",

    // Reward phase
    turnComplete: "턴 완료!",
    keptScore: "점수를 유지했습니다",
    roulette: "룰렛",

    // Shop
    shop: "상점",
    continueShipping: "쇼핑 계속하기",
    sold: "품절",
    gold: "골드",

    // Game over
    youReachedRound: "라운드 {round}까지 도달했습니다",
    finalScore: "최종 점수",
    betterLuckNextTime: "다음엔 더 잘할 수 있을 거예요!",

    // Round clear
    roundCleared: "라운드 {round} 클리어!",
    congratulations: "축하합니다!",

    // Hand types
    highCard: "하이 카드",
    pair: "원 페어",
    twoPair: "투 페어",
    threeOfAKind: "트리플",
    straight: "스트레이트",
    flush: "플러시",
    fullHouse: "풀 하우스",
    fourOfAKind: "포카드",
    straightFlush: "스트레이트 플러시",
    royalFlush: "로열 플러시",

    // Card effects
    wildEffect: "와일드: 어떤 랭크/무늬로도 사용 가능",
    goldEffect: "골드: 점수 대신 골드 획득",
    slotEffect: "슬롯: 플레이 시 미니 슬롯 발동",
    rouletteEffect: "룰렛: 추가 룰렛 기회",
    multEffect: "배수 +{value}: 배수 +{value} 추가",
    chipsEffect: "칩 +{value}: 칩 +{value} 추가",
    goldBonusEffect: "골드 +{value}: 점수 시 골드 +{value}",
    retriggerEffect: "재발동: 이 카드 {count}번 발동",

    // Slot effects
    extraDraw: "+{n} 추가 드로우",
    handSize: "+{n} 패 크기",
    scoreMultiplier: "x{n} 점수",
    safeZone: "+{n}% 안전 구역",
    maxMult: "+{n}x 최대 배수",
    freeSpin: "{n} 무료 스핀",
    instantGold: "+{n} 골드",
    instantChips: "+{n} 칩",
    cardsDiscarded: "-{n}장 버림",
    rouletteSkipped: "룰렛 스킵됨",
    loseGold: "-{n} 골드",
    noEffects: "효과 없음",

    // Deck viewer
    viewDeck: "덱 보기",
    deck: "덱",
    cardsInDeck: "덱의 카드",
    discardPile: "버린 카드 더미",
    close: "닫기",

    // Joker
    joker: "조커",
    removeJoker: "조커를 제거하시겠습니까?",
    jokerWillBeRemoved: "이 조커는 영구적으로 제거됩니다.",

    // Pack
    cardAcquired: "카드 획득!",
    packOpened: "팩 오픈!",
    cardAddedToDeck: "1장의 카드가 덱에 추가되었습니다",
    cardsAddedToDeck: "{n}장의 카드가 덱에 추가되었습니다",

    // Resources
    hands: "핸드",
    discards: "버리기",

    // Settings
    language: "언어",
    english: "English",
    korean: "한국어",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
