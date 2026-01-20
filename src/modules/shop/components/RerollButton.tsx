/**
 * RerollButton Component
 *
 * Button to reroll the shop items for a cost.
 */

import React from 'react';

export interface RerollButtonProps {
  cost: number;
  canAfford: boolean;
  onClick: () => void;
  /** Number of times rerolled this shop visit */
  rerollCount?: number;
}

export function RerollButton({
  cost,
  canAfford,
  onClick,
  rerollCount = 0,
}: RerollButtonProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        disabled={!canAfford}
        className={`
          flex items-center gap-2 py-2 px-6 rounded-lg font-bold transition-all
          ${
            canAfford
              ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-105'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
        aria-label={`Reroll shop for ${cost} gold`}
      >
        <span className="text-xl">🔄</span>
        <span>Reroll</span>
        <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
          <span className="text-yellow-300">$</span>
          <span>{cost}</span>
        </span>
      </button>

      {rerollCount > 0 && (
        <p className="text-xs text-gray-400 mt-1">
          Rerolled {rerollCount} time{rerollCount > 1 ? 's' : ''}
        </p>
      )}

      {!canAfford && (
        <p className="text-xs text-red-400 mt-1">Not enough gold</p>
      )}
    </div>
  );
}

export default RerollButton;
