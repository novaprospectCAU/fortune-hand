# Tutorial System

A comprehensive tutorial system for guiding new players through Fortune's Hand.

## Features

- **Step-by-step guidance**: Progressive tutorial that adapts to game phases
- **Visual highlights**: Spotlight effect on UI elements with glowing borders
- **Persistent state**: Remembers completion status via localStorage
- **Skippable**: Players can skip the tutorial at any time
- **Responsive**: Adapts to different screen sizes
- **Accessible**: ARIA attributes and keyboard navigation

## Components

### TutorialOverlay

Main component that orchestrates the entire tutorial experience.

```tsx
import { TutorialOverlay } from '@/modules/ui';
import { useGameStore } from '@/modules/core/store';

function Game() {
  const phase = useGameStore((state) => state.phase);

  return (
    <>
      {/* Your game UI */}
      <TutorialOverlay
        currentPhase={phase}
        enabled={true}
        onComplete={() => console.log('Tutorial completed!')}
        onSkip={() => console.log('Tutorial skipped')}
      />
    </>
  );
}
```

### TutorialStep

Displays a single tutorial step with navigation controls.

```tsx
<TutorialStep
  title="Welcome to Fortune's Hand!"
  content="Match poker hands and spin the roulette..."
  currentStep={1}
  totalSteps={10}
  position="center"
  isFirst={true}
  isLast={false}
  onNext={() => {}}
  onPrevious={() => {}}
  onSkip={() => {}}
  showSkip={true}
/>
```

### TutorialHighlight

Creates a spotlight effect on specific UI elements.

```tsx
<TutorialHighlight
  targetId="slot-machine"
  isActive={true}
  padding={8}
/>
```

## Usage

### 1. Add data-tutorial-id to UI elements

Mark elements you want to highlight with `data-tutorial-id`:

```tsx
<div data-tutorial-id="slot-machine">
  <SlotMachine />
</div>

<div data-tutorial-id="hand-area">
  <CardHand />
</div>

<div data-tutorial-id="roulette-wheel">
  <Roulette />
</div>
```

### 2. Configure tutorial steps

Edit `/src/data/tutorial.json`:

```json
{
  "steps": [
    {
      "id": "welcome",
      "title": "Welcome!",
      "content": "Tutorial content...",
      "phase": "IDLE",
      "highlight": null,
      "position": "center"
    }
  ]
}
```

### 3. Integrate with game

```tsx
import { TutorialOverlay, useTutorial } from '@/modules/ui';

function App() {
  const { isActive, resetTutorial } = useTutorial();
  const currentPhase = useGameStore((state) => state.phase);

  return (
    <div>
      {/* Game UI */}

      {/* Tutorial overlay */}
      <TutorialOverlay currentPhase={currentPhase} />

      {/* Optional: Restart tutorial button in settings */}
      <button onClick={resetTutorial}>
        Restart Tutorial
      </button>
    </div>
  );
}
```

## Tutorial Step Data

Each step has:

- `id`: Unique identifier
- `title`: Step heading
- `content`: Explanation text (supports newlines)
- `phase`: Game phase when this step appears (or null)
- `highlight`: `data-tutorial-id` of element to highlight
- `position`: Where to show the step tooltip
  - `center`: Center of screen
  - `top`: Above highlighted element
  - `bottom`: Below highlighted element
  - `left`: Left of highlighted element
  - `right`: Right of highlighted element

## Hook: useTutorial

Manage tutorial state programmatically:

```tsx
const {
  // State
  isActive,        // Is tutorial currently active?
  currentStep,     // Current step index (0-based)
  currentStepData, // Current step object
  totalSteps,      // Total number of steps
  isFirstStep,     // Is this the first step?
  isLastStep,      // Is this the last step?
  isCompleted,     // Has tutorial been completed?
  isSkipped,       // Has tutorial been skipped?
  canAdvance,      // Can we go to next step?

  // Actions
  nextStep,        // Go to next step
  previousStep,    // Go to previous step
  skipTutorial,    // Skip and don't show again
  completeTutorial,// Mark as completed
  resetTutorial,   // Start over (for testing/settings)
  startTutorial,   // Manually start tutorial
} = useTutorial();
```

## LocalStorage Keys

- `fortune-hand-tutorial-completed`: "true" when completed
- `fortune-hand-tutorial-skipped`: "true" when skipped

To reset for testing:

```js
localStorage.removeItem('fortune-hand-tutorial-completed');
localStorage.removeItem('fortune-hand-tutorial-skipped');
```

## Styling

The tutorial uses the existing UI theme:

- Primary color for highlights
- Game surface background for step cards
- Consistent with Button, Modal components

Customize in `/src/modules/ui/styles/theme.ts`.

## Testing

```bash
npm test src/modules/ui/components/tutorial
npm test src/modules/ui/hooks/useTutorial.test.ts
```

All components have comprehensive tests with 100% coverage.

## Future Enhancements

- Interactive elements (click to continue)
- Animated arrows pointing to elements
- Video/GIF demonstrations
- Multiple tutorial paths (basic/advanced)
- Achievement system integration
