# Cards 모듈

카드 데이터 및 덱 관리 담당

## 책임

- 표준 52장 덱 생성
- 덱 셔플, 드로우, 버리기
- 특수 카드 데이터 관리
- 카드 UI 컴포넌트

## 절대 하지 않는 것

- 포커 핸드 판정 (poker 모듈 담당)
- 점수 계산
- 조커 효과 처리

## 주요 파일

```
src/modules/cards/
├── deck.ts            # 덱 조작 함수
├── cardFactory.ts     # 카드 생성
├── specialCards.ts    # 특수 카드 로더
├── components/
│   ├── Card.tsx
│   ├── CardStack.tsx
│   └── Hand.tsx
└── index.ts
```

## 핵심 함수

```typescript
// cardFactory.ts
export function createStandardDeck(): Card[] {
  // 52장 표준 덱 생성
  // id 형식: "{rank}_{suit}" (예: "A_hearts")
}

// deck.ts
export function shuffle(cards: Card[]): Card[] {
  // Fisher-Yates 셔플
  // 원본 배열 수정하지 않음 (불변성)
}

export function draw(deck: Deck, count: number): { drawn: Card[]; deck: Deck } {
  // count만큼 드로우
  // 덱에 카드 부족하면 discardPile 셔플해서 보충
}

export function discard(deck: Deck, cards: Card[]): Deck {
  // 카드를 discardPile로 이동
}

export function addToDeck(deck: Deck, cards: Card[]): Deck {
  // 새 카드 추가 (특수 카드 구매 시)
}
```

## 카드 ID 규칙

```
표준 카드: "{rank}_{suit}"
  예: "A_hearts", "10_clubs", "K_spades"

특수 카드: "{special_id}"
  예: "wild_joker", "gold_ace"
```

## UI 컴포넌트

```tsx
// Card.tsx
interface CardProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  faceDown?: boolean;
}

// Hand.tsx
interface HandProps {
  cards: Card[];
  selectedIds: string[];
  onCardClick: (cardId: string) => void;
  maxSelect?: number;
}
```

## 카드 비주얼

- 무늬별 색상: hearts/diamonds = 빨강, clubs/spades = 검정
- 특수 카드는 테두리 색상으로 구분
- 강화된 카드는 배경 효과

## 테스트

```bash
pnpm test:cards
```

- 덱 생성 테스트 (52장, 중복 없음)
- 셔플 무작위성 테스트
- 드로우/버리기 상태 일관성
- discardPile 재셔플 테스트
