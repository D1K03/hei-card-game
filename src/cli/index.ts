import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import {
  startGame,
  makeGuess,
  getCardDisplay,
  getCardColor,
  isGameOver,
  getRemainingCards,
  getProgress,
  TOTAL_CARDS,
  MAX_SCORE,
  type GameState,
  type Guess,
  type Card,
} from '../core/index.ts';

// Best score persistence (in-memory for this session)
let sessionBestScore = 0;

// Display card with color
function displayCard(card: Card): string {
  const display = getCardDisplay(card);
  const color = getCardColor(card);
  return color === 'red' ? chalk.red.bold(display) : chalk.white.bold(display);
}

// Display game header
function showHeader(state: GameState): void {
  const header = boxen(
    chalk.cyan.bold('Higher or Lower') +
      '\n\n' +
      `Score: ${chalk.green.bold(state.score)} | ` +
      `Best: ${chalk.yellow.bold(state.bestScore)} | ` +
      `Cards: ${chalk.blue.bold(`${state.cardsPlayed}/${TOTAL_CARDS}`)} (${getProgress(state)}%)`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    }
  );
  console.log(header);
}

// Display current card
function showCurrentCard(state: GameState): void {
  if (!state.currentCard) return;

  const cardBox = boxen(chalk.bold('Current Card:\n\n') + displayCard(state.currentCard), {
    padding: 1,
    borderStyle: 'double',
    borderColor: getCardColor(state.currentCard) === 'red' ? 'red' : 'white',
    textAlignment: 'center',
  });
  console.log(cardBox);
}

// Show game result
function showResult(won: boolean, finalScore: number, bestScore: number): void {
  const message = won
    ? chalk.green.bold('CONGRATULATIONS! You completed the entire deck!')
    : chalk.red.bold('Game Over!');

  const scoreMessage =
    finalScore === bestScore && finalScore > 0 ? chalk.yellow.bold('New Best Score!') : '';

  const resultBox = boxen(
    message +
      '\n\n' +
      `Final Score: ${chalk.green.bold(finalScore)}/${MAX_SCORE}\n` +
      `Best Score: ${chalk.yellow.bold(bestScore)}\n` +
      scoreMessage,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: won ? 'green' : 'red',
      textAlignment: 'center',
    }
  );
  console.log(resultBox);
}

// Main game loop
async function playGame(): Promise<void> {
  console.clear();

  // Shuffle animation
  const spinner = ora({
    text: 'Shuffling deck...',
    color: 'cyan',
  }).start();

  // Simulate shuffle time for effect
  await new Promise((resolve) => setTimeout(resolve, 1500));

  let state = startGame(sessionBestScore);
  spinner.succeed("Deck shuffled! Let's play!");

  // Game loop
  while (!isGameOver(state)) {
    console.clear();
    showHeader(state);
    showCurrentCard(state);

    console.log(chalk.dim(`\nRemaining cards: ${getRemainingCards(state)}`));

    const guess = await select<Guess>({
      message: 'Will the next card be higher or lower?',
      choices: [
        { name: 'Higher', value: 'higher' },
        { name: 'Lower', value: 'lower' },
      ],
    });

    const result = makeGuess(state, guess);
    state = result.newState;

    // Brief reveal of the card
    console.clear();
    showHeader(state);

    const revealBox = boxen(
      (result.correct ? chalk.green('Correct!') : chalk.red('Wrong!')) +
        '\n\n' +
        chalk.bold('The card was:\n') +
        displayCard(result.nextCard),
      {
        padding: 1,
        borderStyle: result.correct ? 'round' : 'double',
        borderColor: result.correct ? 'green' : 'red',
        textAlignment: 'center',
      }
    );
    console.log(revealBox);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Update session best score
  sessionBestScore = state.bestScore;

  // Show final result
  console.clear();
  showResult(state.status === 'won', state.score, state.bestScore);
}

// Main menu
async function main(): Promise<void> {
  console.clear();

  const welcome = boxen(
    chalk.cyan.bold('HIGHER OR LOWER\n\n') +
      chalk.white('Guess if the next card will be\nhigher or lower than the current one.\n\n') +
      chalk.dim('Complete all 54 cards to win!'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      textAlignment: 'center',
    }
  );
  console.log(welcome);

  let playing = true;

  while (playing) {
    await playGame();

    playing = await confirm({
      message: 'Play again?',
      default: true,
    });
  }

  console.log(chalk.cyan('\nThanks for playing!\n'));
  process.exit(0);
}

// Run the game
main().catch(console.error);
