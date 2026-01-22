/**
 * Fortune's Hand - 모듈 간 인터페이스 정의
 * 
 * ⚠️ 이 파일은 모든 모듈의 계약입니다
 * ⚠️ 수정 시 모든 모듈 담당자와 협의 필요
 * ⚠️ 하위 호환성 유지 필수
 */

// ============================================================
// 기본 타입
// ============================================================

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type GamePhase = 
  | 'IDLE'
  | 'SLOT_PHASE'
  | 'DRAW_PHASE'
  | 'PLAY_PHASE'
  | 'SCORE_PHASE'
  | 'ROULETTE_PHASE'
  | 'REWARD_PHASE'
  | 'SHOP_PHASE'
  | 'GAME_OVER';

export type HandType =
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush'
  | 'quintuple'
  | 'royal_quintuple'
  | 'pentagon';

// ============================================================
// 카드 모듈 (cards)
// ============================================================

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;

  // 특수 카드 속성 (일반 카드는 모두 false/undefined)
  isWild?: boolean;        // 와일드 카드
  isGold?: boolean;        // 골드 카드 (점수 대신 골드)
  isGlass?: boolean;       // 글래스 카드 (모든 문양으로 인정)
  triggerSlot?: boolean;   // 플레이 시 미니 슬롯
  triggerRoulette?: boolean; // 추가 룰렛 기회

  // 강화 상태
  enhancement?: CardEnhancement;
}

export interface CardEnhancement {
  type: 'mult' | 'chips' | 'gold' | 'retrigger';
  value: number;
}

export interface Deck {
  cards: Card[];
  discardPile: Card[];
}

// cards 모듈이 제공하는 함수 시그니처
export interface CardsModule {
  createStandardDeck(): Card[];
  shuffle(cards: Card[]): Card[];
  draw(deck: Deck, count: number): { drawn: Card[]; deck: Deck };
  discard(deck: Deck, cards: Card[]): Deck;
  addToDeck(deck: Deck, cards: Card[]): Deck;
}

// ============================================================
// 슬롯 모듈 (slots)
// ============================================================

export type SlotSymbol = 
  | 'card'      // 🃏 카드 보너스
  | 'target'    // 🎯 룰렛 보너스
  | 'gold'      // 💰 즉시 골드
  | 'chip'      // 🎰 즉시 칩
  | 'star'      // ⭐ 잭팟
  | 'skull'     // 💀 페널티
  | 'wild';     // 🌟 와일드 (아무 심볼)

export interface SlotResult {
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol];
  isJackpot: boolean;
  effects: SlotEffects;
}

export interface SlotEffects {
  // 카드 단계에 적용
  cardBonus: {
    extraDraw: number;      // 추가 드로우
    handSize: number;       // 핸드 크기 증가
    scoreMultiplier: number; // 카드 점수 배수
  };
  
  // 룰렛 단계에 적용
  rouletteBonus: {
    safeZoneBonus: number;  // 안전 확률 증가 (0-100)
    maxMultiplier: number;  // 최대 배수 증가
    freeSpins: number;      // 무료 스핀 횟수
  };
  
  // 즉시 적용
  instant: {
    gold: number;
    chips: number;
  };
  
  // 페널티
  penalty: {
    discardCards: number;   // 강제 버리기
    skipRoulette: boolean;  // 룰렛 스킵
    loseGold: number;
  };
}

// slots 모듈이 제공하는 함수 시그니처
export interface SlotsModule {
  spin(modifiers?: SlotModifiers): SlotResult;
  getSymbolProbabilities(modifiers?: SlotModifiers): Map<SlotSymbol, number>;
}

export interface SlotModifiers {
  // 조커 등에서 오는 확률 조정
  symbolWeights?: Partial<Record<SlotSymbol, number>>;
  guaranteedSymbol?: SlotSymbol;
  rerollCount?: number;
}

// ============================================================
// 포커 모듈 (poker)
// ============================================================

export interface HandResult {
  handType: HandType;
  rank: number;           // 같은 핸드 타입 내 순위
  scoringCards: Card[];   // 점수에 기여한 카드들
  baseChips: number;      // 기본 칩 (핸드 타입별)
  baseMult: number;       // 기본 배수 (핸드 타입별)
}

export interface ScoreCalculation {
  handResult: HandResult;
  
  // 점수 계산 과정
  chipTotal: number;      // 칩 합계
  multTotal: number;      // 배수 합계
  
  // 적용된 보너스들
  appliedBonuses: AppliedBonus[];
  
  // 최종 점수 (칩 × 배수)
  finalScore: number;
}

export interface AppliedBonus {
  source: string;         // 보너스 출처 (조커 이름, 슬롯 등)
  type: 'chips' | 'mult' | 'xmult';
  value: number;
}

// poker 모듈이 제공하는 함수 시그니처
export interface PokerModule {
  evaluateHand(cards: Card[]): HandResult;
  calculateScore(
    handResult: HandResult,
    bonuses: AppliedBonus[]
  ): ScoreCalculation;
  compareHands(a: HandResult, b: HandResult): number;
}

// ============================================================
// 룰렛 모듈 (roulette)
// ============================================================

export interface RouletteConfig {
  segments: RouletteSegment[];
  spinDuration: number;   // 애니메이션 시간 (ms)
}

export interface RouletteSegment {
  id: string;
  multiplier: number;     // 0 = 꽝
  probability: number;    // 0-100
  color: string;
}

export interface RouletteInput {
  baseScore: number;
  config: RouletteConfig;
}

export interface RouletteResult {
  segment: RouletteSegment;
  finalScore: number;     // baseScore × multiplier
  wasSkipped: boolean;
}

// roulette 모듈이 제공하는 함수 시그니처
export interface RouletteModule {
  spin(input: RouletteInput): RouletteResult;
  getDefaultConfig(): RouletteConfig;
  applyBonuses(config: RouletteConfig, bonuses: SlotEffects['rouletteBonus']): RouletteConfig;
}

// ============================================================
// 조커 모듈 (jokers)
// ============================================================

export interface Joker {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  
  // 효과 트리거 조건
  trigger: JokerTrigger;
  
  // 효과
  effect: JokerEffect;
  
  // 상점 가격
  cost: number;
}

export type JokerTrigger = 
  | { type: 'on_score' }                           // 점수 계산 시
  | { type: 'on_play'; cardCondition?: CardCondition }  // 카드 플레이 시
  | { type: 'on_slot'; symbolCondition?: SlotSymbol }   // 슬롯 결과 시
  | { type: 'on_roulette' }                        // 룰렛 시
  | { type: 'passive' };                           // 항상 적용

export interface CardCondition {
  suit?: Suit;
  rank?: Rank;
  minRank?: number;
  maxRank?: number;
}

export type JokerEffect = 
  | { type: 'add_chips'; value: number }
  | { type: 'add_mult'; value: number }
  | { type: 'multiply'; value: number }
  | { type: 'add_gold'; value: number }
  | { type: 'modify_slot'; modification: Partial<SlotModifiers> }
  | { type: 'modify_roulette'; modification: Partial<SlotEffects['rouletteBonus']> }
  | { type: 'retrigger'; count: number }
  | { type: 'custom'; handler: string };  // 복잡한 효과는 핸들러 이름 참조

// jokers 모듈이 제공하는 함수 시그니처
export interface JokersModule {
  evaluateJokers(
    jokers: Joker[],
    context: JokerContext
  ): AppliedBonus[];
  
  getJokerById(id: string): Joker | undefined;
  getAllJokers(): Joker[];
}

export interface JokerContext {
  phase: GamePhase;
  playedCards?: Card[];
  handResult?: HandResult;
  slotResult?: SlotResult;
  currentScore?: number;
}

// ============================================================
// 상점 모듈 (shop)
// ============================================================

export interface ShopItem {
  id: string;
  type: 'joker' | 'card' | 'pack' | 'voucher' | 'consumable';
  itemId: string;         // 실제 아이템 참조
  cost: number;
  sold: boolean;
}

// ============================================================
// 소모품 (Consumables)
// ============================================================

export type ConsumableType = 'card_remover' | 'card_transformer' | 'card_duplicator' | 'hand_booster';

export interface Consumable {
  id: string;
  name: string;
  description: string;
  type: ConsumableType;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  cost: number;
  selectLimit?: number;  // 선택 가능한 카드 수 (card_ 타입용)
  handType?: HandType;   // 강화할 핸드 타입 (hand_booster용)
  boostValue?: number;   // 배수 증가량 (hand_booster용)
}

export interface ConsumableOverlayState {
  isOpen: boolean;
  consumable: Consumable | null;
  selectedCards: Card[];
}

export interface ShopState {
  items: ShopItem[];
  rerollCost: number;
  rerollsUsed: number;
}

export interface Transaction {
  success: boolean;
  item?: ShopItem;
  newGold: number;
  error?: string;
  packCards?: Card[]; // Cards from opened pack (if item was a pack)
}

// shop 모듈이 제공하는 함수 시그니처
export interface ShopModule {
  generateShop(round: number, luck: number): ShopState;
  buyItem(shopState: ShopState, itemId: string, playerGold: number): Transaction;
  reroll(shopState: ShopState, playerGold: number): { shop: ShopState; cost: number };
}

// ============================================================
// 바우처 모듈 (vouchers)
// ============================================================

export interface Voucher {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  cost: number;
  effect: VoucherEffect;
}

export type VoucherEffect =
  | { type: 'hands_bonus'; value: number }
  | { type: 'discards_bonus'; value: number }
  | { type: 'hand_size_bonus'; value: number }
  | { type: 'max_jokers_bonus'; value: number }
  | { type: 'slot_spins_bonus'; value: number }
  | { type: 'starting_gold_bonus'; value: number }
  | { type: 'reroll_discount'; value: number }
  | { type: 'luck_bonus'; value: number }
  | { type: 'interest'; rate: number; max: number }
  | { type: 'combo'; effects: Exclude<VoucherEffect, { type: 'combo' }>[] };

export interface VoucherModifiers {
  handsBonus: number;
  discardsBonus: number;
  handSizeBonus: number;
  maxJokersBonus: number;
  slotSpinsBonus: number;
  startingGoldBonus: number;
  rerollDiscount: number;
  luckBonus: number;
  interestRate: number;
  interestMax: number;
}

// ============================================================
// 코어 모듈 (core) - 게임 상태
// ============================================================

export interface GameState {
  // 진행 상태
  phase: GamePhase;
  round: number;
  turn: number;

  // 목표
  targetScore: number;
  currentScore: number;

  // 자원
  gold: number;

  // 핸드 & 덱
  deck: Deck;
  hand: Card[];
  selectedCards: Card[];

  // 턴 결과
  slotResult: SlotResult | null;
  handResult: HandResult | null;
  scoreCalculation: ScoreCalculation | null;
  rouletteResult: RouletteResult | null;

  // 특수 카드 트리거 결과
  triggeredSlotResults: SlotResult[];  // 카드 트리거로 발동된 슬롯 결과들
  rouletteSpinsGranted: number;        // 카드 트리거로 부여받은 룰렛 스핀 수

  // 보유 조커
  jokers: Joker[];
  maxJokers: number;

  // 보유 바우처
  purchasedVouchers: string[];         // 구매한 바우처 ID 목록

  // 족보 배수 보너스 (영구적)
  handMultiplierBonuses: Partial<Record<HandType, number>>;

  // 플레이 제한
  handsRemaining: number;
  discardsRemaining: number;
  slotSpinsRemaining: number;

  // 팩 오픈 결과 (오버레이 표시용)
  openedPackCards: Card[] | null;

  // 소모품 오버레이 상태
  consumableOverlay: ConsumableOverlayState | null;
}

export interface GameConfig {
  startingGold: number;
  startingHands: number;
  startingDiscards: number;
  startingSlotSpins: number;
  handSize: number;
  maxJokers: number;
  roundScores: number[];  // 라운드별 목표 점수
}

// core 모듈이 제공하는 액션
export interface GameActions {
  // 게임 흐름
  startGame(config?: Partial<GameConfig>): void;
  nextPhase(): void;
  
  // 슬롯 단계
  spinSlot(): void;
  setSlotResult(result: SlotResult): void;
  skipSlot(): void;
  
  // 카드 단계
  selectCard(cardId: string): void;
  deselectCard(cardId: string): void;
  playHand(): void;
  discardSelected(): void;
  
  // 룰렛 단계
  spinRoulette(): void;
  skipRoulette(): void;
  retryRoulette(): void;
  confirmRoulette(): void;
  setRouletteResult(result: RouletteResult): void;
  
  // 상점 단계
  buyItem(itemId: string): void;
  rerollShop(): void;
  leaveShop(): void;

  // 조커 관리
  removeJoker(jokerId: string): void;

  // 팩 오픈 결과
  clearOpenedPackCards(): void;

  // 소모품 관련
  openConsumableOverlay(consumable: Consumable): void;
  closeConsumableOverlay(): void;
  applyConsumable(selectedCardIds: string[]): void;
}

// ============================================================
// 이벤트 시스템 (모듈 간 느슨한 결합용)
// ============================================================

export type GameEvent = 
  | { type: 'GAME_START'; config: GameConfig }
  | { type: 'PHASE_CHANGE'; from: GamePhase; to: GamePhase }
  | { type: 'SLOT_SPIN'; result: SlotResult }
  | { type: 'CARDS_DRAWN'; cards: Card[] }
  | { type: 'CARDS_PLAYED'; cards: Card[]; handResult: HandResult }
  | { type: 'CARDS_DISCARDED'; cards: Card[] }
  | { type: 'SCORE_CALCULATED'; calculation: ScoreCalculation }
  | { type: 'ROULETTE_SPIN'; result: RouletteResult }
  | { type: 'ROUND_END'; score: number; target: number; success: boolean }
  | { type: 'ITEM_BOUGHT'; item: ShopItem }
  | { type: 'GAME_OVER'; finalRound: number; finalScore: number };

export interface EventEmitter {
  emit(event: GameEvent): void;
  on(eventType: GameEvent['type'], handler: (event: GameEvent) => void): void;
  off(eventType: GameEvent['type'], handler: (event: GameEvent) => void): void;
}
