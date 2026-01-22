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
    quintuple: "Quintuple",
    royalQuintuple: "Royal Quintuple",
    pentagon: "Pentagon",

    // Hand descriptions
    highCardDesc: "No matching cards. Score is based on your highest card only.",
    pairDesc: "Two cards of the same rank. Score is the sum of the pair multiplied by 2.",
    twoPairDesc: "Two different pairs. Score is the sum of all four paired cards multiplied by 4.",
    threeOfAKindDesc: "Three cards of the same rank. Score is the sum of the three cards multiplied by 6.",
    straightDesc: "Five cards in sequence (e.g., 5-6-7-8-9). Ace can be high or low. Score is the sum of all cards multiplied by 8.",
    flushDesc: "Five cards of the same suit. Score is the sum of all cards multiplied by 10.",
    fullHouseDesc: "Three of a kind plus a pair. Score is the sum of all five cards multiplied by 13.",
    straightFlushDesc: "Five cards in sequence, all of the same suit. Score is the sum of all cards multiplied by 16.",
    fourOfAKindDesc: "Four cards of the same rank. Score is the sum of the four cards multiplied by 20.",
    quintupleDesc: "Five cards of the same rank (requires wild cards). Score is the sum of all cards multiplied by 25.",
    royalFlushDesc: "10, J, Q, K, A all of the same suit. The highest standard poker hand. Score is the sum of all cards multiplied by 30.",
    royalQuintupleDesc: "Five cards of the same rank AND same suit (requires wild cards). Score is the sum of all cards multiplied by 30.",
    pentagonDesc: "Five Ace of Spades (requires wild cards). The ultimate hand. Score is the sum of all cards multiplied by 100.",
    exampleHand: "Example Hand",

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

    // Consumables
    selectCardsToRemove: "Select Cards to Remove",
    selectCardsToTransform: "Select Cards to Transform",
    selectCardsToDuplicate: "Select Cards to Duplicate",
    selectCards: "Select Cards",
    removeCardDesc: "Remove up to {n} cards from your deck",
    transformCardDesc: "Transform up to {n} cards into random cards",
    duplicateCardDesc: "Duplicate up to {n} cards (copy to deck)",
    selectUpToN: "Select up to {n} cards",
    selected: "Selected",
    removeCards: "Remove {n} Card(s)",
    transformCards: "Transform {n} Card(s)",
    duplicateCards: "Duplicate {n} Card(s)",
    skipRemoval: "Skip",
    skipTransform: "Skip",
    skipDuplicate: "Skip",
    cardRemoved: "{n} card(s) removed from deck",
    cardTransformed: "{n} card(s) transformed",
    cardDuplicated: "{n} card(s) duplicated",
    glassEffect: "Glass: Counts as any suit",

    // Settings
    language: "Language",
    english: "English",
    korean: "한국어",

    // Joker names
    joker_mult_master: "Mult Master",
    joker_chip_lord: "Chip Lord",
    joker_gold_rush: "Gold Rush",
    joker_lucky_seven: "Lucky Seven",
    joker_ace_hunter: "Ace Hunter",
    joker_heart_breaker: "Heart Breaker",
    joker_spade_specialist: "Spade Specialist",
    joker_flush_master: "Flush Master",
    joker_straight_shooter: "Straight Shooter",
    joker_full_house_party: "Full House Party",
    joker_four_leaf: "Four Leaf",
    joker_high_roller: "High Roller",
    joker_safe_player: "Safe Player",
    joker_jackpot_hunter: "Jackpot Hunter",
    joker_skull_crusher: "Skull Crusher",
    joker_echo: "Echo",
    joker_fortune_teller: "Fortune Teller",
    joker_royal_master: "Royal Master",
    joker_all_in: "All In",
    joker_pair_power: "Pair Power",
    joker_gold_digger: "Gold Digger",
    joker_card_collector: "Card Collector",
    joker_chip_magnet: "Chip Magnet",
    joker_wild_master: "Wild Master",
    joker_target_seeker: "Target Seeker",
    joker_lucky_gambler: "Lucky Gambler",
    joker_risk_taker: "Risk Taker",
    joker_free_spinner: "Free Spinner",
    joker_double_or_nothing: "Double or Nothing",
    joker_slot_lord: "Slot Lord",

    // Joker descriptions
    joker_mult_master_desc: "×3 Mult",
    joker_chip_lord_desc: "+100 Chips",
    joker_gold_rush_desc: "+10 Gold per round",
    joker_lucky_seven_desc: "×7 Mult if hand has a 7",
    joker_ace_hunter_desc: "+200 Chips per Ace",
    joker_heart_breaker_desc: "×2 Mult per Heart card",
    joker_spade_specialist_desc: "+150 Chips per Spade",
    joker_flush_master_desc: "×5 Mult for Flush",
    joker_straight_shooter_desc: "×4 Mult for Straight",
    joker_full_house_party_desc: "×6 Mult for Full House",
    joker_four_leaf_desc: "×10 Mult for Four of a Kind",
    joker_high_roller_desc: "Roulette max ×2 higher",
    joker_safe_player_desc: "+40% safe zone",
    joker_jackpot_hunter_desc: "Star ⭐ 3x more often",
    joker_skull_crusher_desc: "No Skull penalties",
    joker_echo_desc: "All cards trigger twice",
    joker_fortune_teller_desc: "See Roulette result",
    joker_royal_master_desc: "×20 for Royal Flush",
    joker_all_in_desc: "×8 Mult, but ×0.5 more likely",
    joker_pair_power_desc: "×2 Mult for Pair",
    joker_gold_digger_desc: "Gold 💰 2x more often",
    joker_card_collector_desc: "Card 🃏 2x more often",
    joker_chip_magnet_desc: "Chip 🎰 2x more often",
    joker_wild_master_desc: "Wild 🌟 3x more often",
    joker_target_seeker_desc: "Target 🎯 2x more often",
    joker_lucky_gambler_desc: "×0.5 zone -10%",
    joker_risk_taker_desc: "High mult more likely",
    joker_free_spinner_desc: "+1 free roulette spin",
    joker_double_or_nothing_desc: "100x chance +1%",
    joker_slot_lord_desc: "All good symbols +50%",

    // Consumable names
    consumable_card_remover_1: "Card Eraser",
    consumable_card_remover_2: "Deck Cleaner",
    consumable_card_remover_3: "Mass Purge",
    consumable_card_transformer_1: "Card Morpher",
    consumable_card_transformer_2: "Chaos Alchemist",
    consumable_card_duplicator_1: "Card Cloner",
    consumable_card_duplicator_2: "Mirror Master",

    // Consumable descriptions
    consumable_card_remover_1_desc: "Remove 1 card from deck",
    consumable_card_remover_2_desc: "Remove up to 2 cards",
    consumable_card_remover_3_desc: "Remove up to 3 cards",
    consumable_card_transformer_1_desc: "Transform 1 card randomly",
    consumable_card_transformer_2_desc: "Transform up to 2 cards",
    consumable_card_duplicator_1_desc: "Duplicate 1 card",
    consumable_card_duplicator_2_desc: "Duplicate up to 2 cards",

    // Hand boost consumable names
    consumable_hand_boost_high_card: "High Card Boost",
    consumable_hand_boost_pair: "Pair Boost",
    consumable_hand_boost_two_pair: "Two Pair Boost",
    consumable_hand_boost_three_of_a_kind: "Triple Boost",
    consumable_hand_boost_straight: "Straight Boost",
    consumable_hand_boost_flush: "Flush Boost",
    consumable_hand_boost_full_house: "Full House Boost",
    consumable_hand_boost_straight_flush: "Straight Flush Boost",
    consumable_hand_boost_four_of_a_kind: "Four of a Kind Boost",
    consumable_hand_boost_quintuple: "Quintuple Boost",
    consumable_hand_boost_royal_flush: "Royal Flush Boost",
    consumable_hand_boost_royal_quintuple: "Royal Quintuple Boost",
    consumable_hand_boost_pentagon: "Pentagon Boost",

    // Hand boost consumable descriptions
    consumable_hand_boost_high_card_desc: "Permanently +1 to High Card multiplier",
    consumable_hand_boost_pair_desc: "Permanently +2 to Pair multiplier",
    consumable_hand_boost_two_pair_desc: "Permanently +2 to Two Pair multiplier",
    consumable_hand_boost_three_of_a_kind_desc: "Permanently +4 to Three of a Kind multiplier",
    consumable_hand_boost_straight_desc: "Permanently +4 to Straight multiplier",
    consumable_hand_boost_flush_desc: "Permanently +4 to Flush multiplier",
    consumable_hand_boost_full_house_desc: "Permanently +8 to Full House multiplier",
    consumable_hand_boost_straight_flush_desc: "Permanently +8 to Straight Flush multiplier",
    consumable_hand_boost_four_of_a_kind_desc: "Permanently +15 to Four of a Kind multiplier",
    consumable_hand_boost_quintuple_desc: "Permanently +15 to Quintuple multiplier",
    consumable_hand_boost_royal_flush_desc: "Permanently +30 to Royal Flush multiplier",
    consumable_hand_boost_royal_quintuple_desc: "Permanently +30 to Royal Quintuple multiplier",
    consumable_hand_boost_pentagon_desc: "Permanently +50 to Pentagon multiplier",

    // Shop UI
    leaveShop: "Leave Shop",
    noItemsAvailable: "No items available",

    // Pack names
    pack_standard: "Standard Pack",
    pack_jumbo: "Jumbo Pack",
    pack_mega: "Mega Pack",
    pack_hand_boost_pack_basic: "Basic Hand Boost Pack",
    pack_hand_boost_pack_advanced: "Advanced Hand Boost Pack",
    pack_hand_boost_pack_premium: "Premium Hand Boost Pack",
    pack_hand_boost_pack_legendary: "Legendary Hand Boost Pack",

    // Pack descriptions
    pack_standard_desc: "Contains 3 random cards",
    pack_jumbo_desc: "Contains 4 random cards",
    pack_mega_desc: "Contains 5 random cards",
    pack_hand_boost_pack_basic_desc: "Contains 2 random basic hand boost items",
    pack_hand_boost_pack_advanced_desc: "Contains 2 random advanced hand boost items",
    pack_hand_boost_pack_premium_desc: "Contains 2 random rare+ hand boost items",
    pack_hand_boost_pack_legendary_desc: "Contains 1 legendary hand boost item",

    // Voucher names
    voucher_extra_hand: "Extra Hand",
    voucher_extra_discard: "Extra Discard",
    voucher_shop_discount: "Shop Discount",
    voucher_luck_boost: "Luck Boost",

    // Voucher descriptions
    voucher_extra_hand_desc: "+1 hand per round permanently",
    voucher_extra_discard_desc: "+1 discard per round permanently",
    voucher_shop_discount_desc: "10% off all shop items",
    voucher_luck_boost_desc: "Better rarity chances in shop",

    // Rarity names
    rarity_common: "Common",
    rarity_uncommon: "Uncommon",
    rarity_rare: "Rare",
    rarity_legendary: "Legendary",

    // Hand guide
    handGuide: "Hand Guide",
    multiplier: "Multiplier",

    // Slot guide
    slotGuide: "Slot Guide",
    singleSymbol: "Single",
    tripleSymbol: "Triple",
    activeJokerBuffs: "Active Joker Buffs",
    jokerBuffsActive: "joker buffs active",
    slotSymbol_card: "Card",
    slotSymbol_card_desc: "Draw extra cards. More cards = more hand options!",
    slotSymbol_target: "Target",
    slotSymbol_target_desc: "Boost roulette safe zone and max multiplier.",
    slotSymbol_gold: "Gold",
    slotSymbol_gold_desc: "Get instant gold to spend in the shop.",
    slotSymbol_chip: "Chip",
    slotSymbol_chip_desc: "Get instant chip bonus added to your score.",
    slotSymbol_star: "Star",
    slotSymbol_star_desc: "The jackpot symbol! Three stars = massive bonus!",
    slotSymbol_wild: "Wild",
    slotSymbol_wild_desc: "Matches any symbol for combinations.",
    slotSymbol_skull: "Skull",
    slotSymbol_skull_desc: "Penalty! Discard cards or skip roulette.",
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
    highCard: "노 페어",
    pair: "원 페어",
    twoPair: "투 페어",
    threeOfAKind: "트리플",
    straight: "스트레이트",
    flush: "플러시",
    fullHouse: "풀 하우스",
    fourOfAKind: "포커",
    straightFlush: "스트레이트 플러시",
    royalFlush: "로열 스트레이트 플러시",
    quintuple: "퀸튜플",
    royalQuintuple: "로열 퀸튜플",
    pentagon: "펜타곤",

    // Hand descriptions
    highCardDesc: "일치하는 카드가 없습니다. 가장 높은 카드만으로 점수가 계산됩니다.",
    pairDesc: "같은 숫자 2장. 페어의 합 × 2로 점수가 계산됩니다.",
    twoPairDesc: "서로 다른 페어 2개. 4장의 합 × 4로 점수가 계산됩니다.",
    threeOfAKindDesc: "같은 숫자 3장. 3장의 합 × 6으로 점수가 계산됩니다.",
    straightDesc: "5장이 연속된 숫자 (예: 5-6-7-8-9). A는 높거나 낮을 수 있습니다. 모든 카드 합 × 8로 계산됩니다.",
    flushDesc: "같은 무늬 5장. 모든 카드 합 × 10으로 점수가 계산됩니다.",
    fullHouseDesc: "트리플 + 페어. 5장 전체 합 × 13으로 점수가 계산됩니다.",
    straightFlushDesc: "같은 무늬로 5장 연속. 모든 카드 합 × 16으로 점수가 계산됩니다.",
    fourOfAKindDesc: "같은 숫자 4장. 4장의 합 × 20으로 점수가 계산됩니다.",
    quintupleDesc: "같은 숫자 5장 (와일드 카드 필요). 모든 카드 합 × 25로 점수가 계산됩니다.",
    royalFlushDesc: "같은 무늬로 10, J, Q, K, A. 가장 높은 기본 포커 핸드입니다. 모든 카드 합 × 30으로 계산됩니다.",
    royalQuintupleDesc: "같은 숫자 AND 같은 무늬 5장 (와일드 카드 필요). 모든 카드 합 × 30으로 점수가 계산됩니다.",
    pentagonDesc: "스페이드 A 5장 (와일드 카드 필요). 궁극의 핸드입니다. 모든 카드 합 × 100으로 점수가 계산됩니다.",
    exampleHand: "예시 핸드",

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

    // Consumables
    selectCardsToRemove: "제거할 카드 선택",
    selectCardsToTransform: "변환할 카드 선택",
    selectCardsToDuplicate: "복제할 카드 선택",
    selectCards: "카드 선택",
    removeCardDesc: "덱에서 최대 {n}장의 카드를 제거합니다",
    transformCardDesc: "최대 {n}장의 카드를 랜덤 카드로 변환합니다",
    duplicateCardDesc: "최대 {n}장의 카드를 복제합니다 (덱에 복사)",
    selectUpToN: "최대 {n}장 선택",
    selected: "선택됨",
    removeCards: "{n}장 제거",
    transformCards: "{n}장 변환",
    duplicateCards: "{n}장 복제",
    skipRemoval: "건너뛰기",
    skipTransform: "건너뛰기",
    skipDuplicate: "건너뛰기",
    cardRemoved: "덱에서 {n}장의 카드가 제거되었습니다",
    cardTransformed: "{n}장의 카드가 변환되었습니다",
    cardDuplicated: "{n}장의 카드가 복제되었습니다",
    glassEffect: "글래스: 모든 무늬로 인정",

    // Settings
    language: "언어",
    english: "English",
    korean: "한국어",

    // Joker names
    joker_mult_master: "배수의 달인",
    joker_chip_lord: "칩 군주",
    joker_gold_rush: "골드 러시",
    joker_lucky_seven: "행운의 7",
    joker_ace_hunter: "에이스 헌터",
    joker_heart_breaker: "하트 브레이커",
    joker_spade_specialist: "스페이드 전문가",
    joker_flush_master: "플러시 마스터",
    joker_straight_shooter: "스트레이트 슈터",
    joker_full_house_party: "풀하우스 파티",
    joker_four_leaf: "네잎클로버",
    joker_high_roller: "하이 롤러",
    joker_safe_player: "안전 플레이어",
    joker_jackpot_hunter: "잭팟 헌터",
    joker_skull_crusher: "해골 파괴자",
    joker_echo: "메아리",
    joker_fortune_teller: "점술사",
    joker_royal_master: "로열 마스터",
    joker_all_in: "올인",
    joker_pair_power: "페어 파워",
    joker_gold_digger: "골드 디거",
    joker_card_collector: "카드 수집가",
    joker_chip_magnet: "칩 자석",
    joker_wild_master: "와일드 마스터",
    joker_target_seeker: "타겟 시커",
    joker_lucky_gambler: "행운의 도박사",
    joker_risk_taker: "리스크 테이커",
    joker_free_spinner: "프리 스피너",
    joker_double_or_nothing: "더블 오어 낫싱",
    joker_slot_lord: "슬롯 군주",

    // Joker descriptions
    joker_mult_master_desc: "×3 배수",
    joker_chip_lord_desc: "+100 칩",
    joker_gold_rush_desc: "라운드당 +10 골드",
    joker_lucky_seven_desc: "7이 있으면 ×7 배수",
    joker_ace_hunter_desc: "에이스당 +200 칩",
    joker_heart_breaker_desc: "하트당 ×2 배수",
    joker_spade_specialist_desc: "스페이드당 +150 칩",
    joker_flush_master_desc: "플러시 시 ×5 배수",
    joker_straight_shooter_desc: "스트레이트 시 ×4 배수",
    joker_full_house_party_desc: "풀하우스 시 ×6 배수",
    joker_four_leaf_desc: "포커 시 ×10 배수",
    joker_high_roller_desc: "룰렛 최대 배수 +2",
    joker_safe_player_desc: "+40% 안전 구역",
    joker_jackpot_hunter_desc: "⭐ 출현률 3배",
    joker_skull_crusher_desc: "💀 페널티 무효",
    joker_echo_desc: "모든 카드 2번 발동",
    joker_fortune_teller_desc: "룰렛 결과 미리보기",
    joker_royal_master_desc: "로열 플러시 시 ×20",
    joker_all_in_desc: "×8 배수, 0배 확률 증가",
    joker_pair_power_desc: "페어 시 ×2 배수",
    joker_gold_digger_desc: "💰 출현률 2배",
    joker_card_collector_desc: "🃏 출현률 2배",
    joker_chip_magnet_desc: "🎰 출현률 2배",
    joker_wild_master_desc: "🌟 출현률 3배",
    joker_target_seeker_desc: "🎯 출현률 2배",
    joker_lucky_gambler_desc: "0배 구역 -10%",
    joker_risk_taker_desc: "높은 배수 확률 증가",
    joker_free_spinner_desc: "+1 무료 룰렛 스핀",
    joker_double_or_nothing_desc: "100배 확률 +1%",
    joker_slot_lord_desc: "모든 좋은 심볼 +50%",

    // Consumable names
    consumable_card_remover_1: "카드 지우개",
    consumable_card_remover_2: "덱 클리너",
    consumable_card_remover_3: "대량 제거",
    consumable_card_transformer_1: "카드 변환기",
    consumable_card_transformer_2: "혼돈의 연금술사",
    consumable_card_duplicator_1: "카드 복제기",
    consumable_card_duplicator_2: "거울의 달인",

    // Consumable descriptions
    consumable_card_remover_1_desc: "덱에서 카드 1장 제거",
    consumable_card_remover_2_desc: "덱에서 최대 2장 제거",
    consumable_card_remover_3_desc: "덱에서 최대 3장 제거",
    consumable_card_transformer_1_desc: "카드 1장을 랜덤 변환",
    consumable_card_transformer_2_desc: "최대 2장을 랜덤 변환",
    consumable_card_duplicator_1_desc: "카드 1장 복제",
    consumable_card_duplicator_2_desc: "최대 2장 복제",

    // Hand boost consumable names
    consumable_hand_boost_high_card: "노 페어 강화",
    consumable_hand_boost_pair: "원 페어 강화",
    consumable_hand_boost_two_pair: "투 페어 강화",
    consumable_hand_boost_three_of_a_kind: "트리플 강화",
    consumable_hand_boost_straight: "스트레이트 강화",
    consumable_hand_boost_flush: "플러시 강화",
    consumable_hand_boost_full_house: "풀 하우스 강화",
    consumable_hand_boost_straight_flush: "스트레이트 플러시 강화",
    consumable_hand_boost_four_of_a_kind: "포커 강화",
    consumable_hand_boost_quintuple: "퀸튜플 강화",
    consumable_hand_boost_royal_flush: "로열 플러시 강화",
    consumable_hand_boost_royal_quintuple: "로열 퀸튜플 강화",
    consumable_hand_boost_pentagon: "펜타곤 강화",

    // Hand boost consumable descriptions
    consumable_hand_boost_high_card_desc: "노 페어 배수 영구 +1",
    consumable_hand_boost_pair_desc: "원 페어 배수 영구 +2",
    consumable_hand_boost_two_pair_desc: "투 페어 배수 영구 +2",
    consumable_hand_boost_three_of_a_kind_desc: "트리플 배수 영구 +4",
    consumable_hand_boost_straight_desc: "스트레이트 배수 영구 +4",
    consumable_hand_boost_flush_desc: "플러시 배수 영구 +4",
    consumable_hand_boost_full_house_desc: "풀 하우스 배수 영구 +8",
    consumable_hand_boost_straight_flush_desc: "스트레이트 플러시 배수 영구 +8",
    consumable_hand_boost_four_of_a_kind_desc: "포커 배수 영구 +15",
    consumable_hand_boost_quintuple_desc: "퀸튜플 배수 영구 +15",
    consumable_hand_boost_royal_flush_desc: "로열 플러시 배수 영구 +30",
    consumable_hand_boost_royal_quintuple_desc: "로열 퀸튜플 배수 영구 +30",
    consumable_hand_boost_pentagon_desc: "펜타곤 배수 영구 +50",

    // Shop UI
    leaveShop: "상점 나가기",
    noItemsAvailable: "상품 없음",

    // Pack names
    pack_standard: "기본 팩",
    pack_jumbo: "점보 팩",
    pack_mega: "메가 팩",
    pack_hand_boost_pack_basic: "기본 족보 강화 팩",
    pack_hand_boost_pack_advanced: "고급 족보 강화 팩",
    pack_hand_boost_pack_premium: "프리미엄 족보 강화 팩",
    pack_hand_boost_pack_legendary: "전설 족보 강화 팩",

    // Pack descriptions
    pack_standard_desc: "랜덤 카드 3장 포함",
    pack_jumbo_desc: "랜덤 카드 4장 포함",
    pack_mega_desc: "랜덤 카드 5장 포함",
    pack_hand_boost_pack_basic_desc: "기본 족보 강화 아이템 2개 포함",
    pack_hand_boost_pack_advanced_desc: "고급 족보 강화 아이템 2개 포함",
    pack_hand_boost_pack_premium_desc: "희귀 이상 족보 강화 아이템 2개 포함",
    pack_hand_boost_pack_legendary_desc: "전설 족보 강화 아이템 1개 포함",

    // Voucher names
    voucher_extra_hand: "추가 핸드",
    voucher_extra_discard: "추가 버리기",
    voucher_shop_discount: "상점 할인",
    voucher_luck_boost: "행운 부스트",

    // Voucher descriptions
    voucher_extra_hand_desc: "라운드당 핸드 +1 (영구)",
    voucher_extra_discard_desc: "라운드당 버리기 +1 (영구)",
    voucher_shop_discount_desc: "모든 상점 아이템 10% 할인",
    voucher_luck_boost_desc: "상점 희귀도 확률 증가",

    // Rarity names
    rarity_common: "일반",
    rarity_uncommon: "고급",
    rarity_rare: "희귀",
    rarity_legendary: "전설",

    // Hand guide
    handGuide: "족보 안내",
    multiplier: "배수",

    // Slot guide
    slotGuide: "슬롯 안내",
    singleSymbol: "1개",
    tripleSymbol: "3개",
    activeJokerBuffs: "활성 조커 버프",
    jokerBuffsActive: "개 조커 버프 활성",
    slotSymbol_card: "카드",
    slotSymbol_card_desc: "추가 카드를 드로우합니다. 더 많은 카드 = 더 많은 선택지!",
    slotSymbol_target: "타겟",
    slotSymbol_target_desc: "룰렛 안전 구간과 최대 배수를 증가시킵니다.",
    slotSymbol_gold: "골드",
    slotSymbol_gold_desc: "상점에서 사용할 즉시 골드를 획득합니다.",
    slotSymbol_chip: "칩",
    slotSymbol_chip_desc: "점수에 추가되는 즉시 칩 보너스를 획득합니다.",
    slotSymbol_star: "스타",
    slotSymbol_star_desc: "잭팟 심볼! 스타 3개 = 엄청난 보너스!",
    slotSymbol_wild: "와일드",
    slotSymbol_wild_desc: "조합에서 어떤 심볼과도 매칭됩니다.",
    slotSymbol_skull: "해골",
    slotSymbol_skull_desc: "페널티! 카드 버리기 또는 룰렛 스킵.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
