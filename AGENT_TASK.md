# Agent 3: Cards Module 작업 지시서

## 역할
카드 데이터 및 덱 관리 담당

## 브랜치
- 작업 브랜치: `feature/cards-module`
- 머지 대상: `develop`

## 우선순위: 높음
이 모듈은 Poker 모듈의 의존성이므로 먼저 완료해야 합니다.

## M1 작업 목록

### 1단계: 카드 생성
- [ ] `src/modules/cards/cardFactory.ts`
  ```typescript
  export function createStandardDeck(): Card[] {
    // 52장 표준 덱 생성
    // id 형식: "{rank}_{suit}" (예: "A_hearts")
  }

  export function createCard(rank: Rank, suit: Suit): Card {
    // 단일 카드 생성
  }
  ```

### 2단계: 덱 조작 함수
- [ ] `src/modules/cards/deck.ts`
  ```typescript
  // Fisher-Yates 셔플 (불변성 유지)
  export function shuffle(cards: Card[]): Card[]

  // 드로우 (덱 부족 시 discardPile 재활용)
  export function draw(deck: Deck, count: number): { drawn: Card[]; deck: Deck }

  // 카드 버리기
  export function discard(deck: Deck, cards: Card[]): Deck

  // 덱에 카드 추가
  export function addToDeck(deck: Deck, cards: Card[]): Deck
  ```

### 3단계: 특수 카드 (기초)
- [ ] `src/data/cards.json` 확인 및 필요시 생성
- [ ] `src/modules/cards/specialCards.ts`
  - 특수 카드 데이터 로더

### 4단계: UI 컴포넌트
- [ ] `src/modules/cards/components/Card.tsx`
  ```tsx
  interface CardProps {
    card: Card;
    selected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    faceDown?: boolean;
  }
  ```
- [ ] `src/modules/cards/components/Hand.tsx`
  ```tsx
  interface HandProps {
    cards: Card[];
    selectedIds: string[];
    onCardClick: (cardId: string) => void;
    maxSelect?: number;
  }
  ```
- [ ] `src/modules/cards/components/CardStack.tsx`
  - 덱/버린 카드 더미 표시

### 5단계: Export
- [ ] `src/modules/cards/index.ts`

## 핵심 구현 상세

### Fisher-Yates 셔플
```typescript
export function shuffle(cards: Card[]): Card[] {
  const result = [...cards]; // 원본 유지
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### 드로우 로직
```typescript
export function draw(deck: Deck, count: number): { drawn: Card[]; deck: Deck } {
  let { cards, discardPile } = deck;

  // 카드 부족 시 discardPile 셔플해서 보충
  if (cards.length < count && discardPile.length > 0) {
    cards = [...cards, ...shuffle(discardPile)];
    discardPile = [];
  }

  const drawn = cards.slice(0, count);
  const remaining = cards.slice(count);

  return {
    drawn,
    deck: { cards: remaining, discardPile }
  };
}
```

## 테스트 요구사항
```bash
npm run test:cards
```
- 덱 생성 테스트 (52장, 중복 없음)
- 셔플 무작위성 테스트
- 드로우/버리기 상태 일관성
- discardPile 재셔플 테스트

## 카드 비주얼 가이드
- hearts/diamonds: 빨강 (#ef4444)
- clubs/spades: 검정 (#1f2937)
- 선택된 카드: 위로 올라감 (translateY)
- 특수 카드: 테두리 색상 구분

## 작업 완료 후
```bash
git add .
git commit -m "feat(cards): implement deck management and card UI

- Add createStandardDeck and card factory
- Implement shuffle, draw, discard functions
- Create Card and Hand components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin feature/cards-module
```

## 참조 문서
- `src/modules/cards/CLAUDE.md`
- `specs/interfaces.ts`
