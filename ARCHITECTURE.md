## Design Decisions

### Architecture: Shared Core Module for CLI and GUI
The game logic is in `src/core/` and is imported by both CLI and GUI. This ensures:
- **Single source of truth**: Game rules are defined once, reducing bugs from inconsistent implementations.
- **Testability**: Easier to test for the core game logic.
- **Separation of concerns**: UI does not affect the functionality of the game.

### Fixed State Pattern
`GameState` is readonly and all state transitions return new objects rather than mutating:
```typescript
readonly deck: readonly Card[];
readonly currentCard: Card | null;
```
**Why**: Making deck immutable so that it re-renders properly which is important for the GUI.

### Joker Value Randomization at Shuffle Time
Each Joker is assigned a value (0=lowest or 15=highest) when the deck is created, not when compared:
```typescript
const redJokerIsHigh = Math.random() < 0.5;
cards.push(createJoker('red', redJokerIsHigh));
```
**Why**: Jokers are randomised as either the highest card or the lowest card in the shuffle. The value is fixed for the entire game.

### Tie Handling: Both Guesses Correct
When the next card equals the current card, both "higher" and "lower" are accepted:
```typescript
if (comparison === 0) {
  correct = true; // Same value is always correct
}
```
**Why**: I felt it would be unfair otherwise, losing on a tie means there's no winning option.

### Card Value Scale (0-15)
- Standard cards (52 cards): 2-14 (2 through Ace)
- Joker (LOW): 0 (below all standard cards)
- Joker (HIGH): 15 (above all standard cards)

**Why**: Simple game logic with the added extension of the joker values so I can compare the cards easily.

### Score Calculation (Max 53)
The first card revealed is the starter and doesn't count as a guess. With 54 cards, there is a maximum of 53 guesses possible, so the highest score would be 53.

### GUI State Persistence
Best score uses localStorage in the browser and is session-only in CLI:
```typescript
localStorage.setItem(BEST_SCORE_KEY, state.bestScore.toString());
```
**Why**: Easiest way of storing the score taking into account that the browser will refresh and that the user would only want to track the best score for each session.

## Ideas for Improvement

### Features
1. **Keyboard shortcuts in GUI**: Add 'H' for Higher, 'L' for Lower, 'R' for Restart
2. **Card flip animation**: Animate the card turning over when revealed
3. **Sound effects**: Audio feedback for correct/wrong guesses and win/lose
4. **Statistics tracking**: Track games played, win rate, average score
5. **Difficulty modes**:
   - Easy: Show probability hints based on remaining cards
   - Hard: Ties count as losses
6. **Multiplayer**: Take turns, highest score after one deck wins
7. **Card counting helper**: Show how many of each rank remain (for learning)

### Technical
1. **E2E tests**: Playwright tests for GUI game flow
2. **CLI persistence**: Save best score to a file (`~/.hei-card-game/scores.json`)
3. **Accessibility**: Add ARIA labels, screen reader support, high contrast mode
4. **PWA support**: Make GUI installable as a Progressive Web App
5. **Undo feature**: Allow undoing the last guess (costs points or limited uses)
6. **Replay system**: Record game moves and allow replay/sharing

### Code Quality
1. **Extract card rendering**: The CLI card display and GUI Card component have duplicated suit symbol logic
2. **Error boundaries**: Add React error boundaries for graceful failure handling
3. **Loading states**: Show skeleton UI while game initializes
4. **Responsive design**: Optimize card size and layout for mobile devices