import type { Card as CardType } from '../../../core/index.ts';
import { getCardColor, isJoker, getSuitSymbol } from '../../../core/index.ts';

interface CardProps {
  card: CardType | null;
  highlight?: 'correct' | 'wrong' | null;
  className?: string;
}

export function Card({ card, highlight, className = '' }: CardProps) {
  if (!card) {
    return <div className={`card card-placeholder ${className}`} />;
  }

  const color = getCardColor(card);
  const highlightClass =
    highlight === 'correct' ? 'card-correct' : highlight === 'wrong' ? 'card-wrong' : '';

  if (isJoker(card)) {
    return (
      <div className={`card card-joker ${color} ${highlightClass} ${className}`}>
        <div className="card-content">
          <span className="card-joker-icon">JOKER</span>
          <span className="card-joker-type">{card.value === 15 ? 'HIGH' : 'LOW'}</span>
        </div>
      </div>
    );
  }

  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <div className={`card card-standard ${color} ${highlightClass} ${className}`}>
      <div className="card-corner top-left">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{suitSymbol}</span>
      </div>
      <div className="card-center">
        <span className="card-suit-large">{suitSymbol}</span>
      </div>
      <div className="card-corner bottom-right">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{suitSymbol}</span>
      </div>
    </div>
  );
}
