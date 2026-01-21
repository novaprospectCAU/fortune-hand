/**
 * PackDisplay Component
 *
 * Displays pack information in the shop
 * Shows pack name, description, card count, and special card probability
 */

import { getPackById, getPackName, getPackDescription, getPackRarity } from '../packs';
import { RARITY_COLORS } from '@/data/constants';

export interface PackDisplayProps {
  packId: string;
  cost: number;
  onBuy?: () => void;
  canAfford: boolean;
  sold?: boolean;
}

/**
 * Display a pack in the shop
 */
export function PackDisplay({ packId, cost, onBuy, canAfford, sold }: PackDisplayProps) {
  const pack = getPackById(packId);
  const name = getPackName(packId);
  const description = getPackDescription(packId);
  const rarity = getPackRarity(packId);
  const rarityColor = RARITY_COLORS[rarity];

  if (!pack) {
    return (
      <div className="pack-display pack-unknown">
        <div className="pack-name">Unknown Pack</div>
        <div className="pack-description">This pack is not available</div>
      </div>
    );
  }

  return (
    <div
      className="pack-display"
      style={{
        borderColor: rarityColor,
        opacity: sold ? 0.5 : 1,
      }}
    >
      {/* Pack Header */}
      <div className="pack-header">
        <h3 className="pack-name" style={{ color: rarityColor }}>
          {name}
        </h3>
        <span className="pack-rarity">{rarity}</span>
      </div>

      {/* Pack Info */}
      <div className="pack-info">
        <p className="pack-description">{description}</p>

        <div className="pack-stats">
          <div className="pack-stat">
            <span className="stat-label">Cards:</span>
            <span className="stat-value">{pack.cardCount}</span>
          </div>

          <div className="pack-stat">
            <span className="stat-label">Special Chance:</span>
            <span className="stat-value">{Math.round(pack.specialCardWeight * 100)}%</span>
          </div>

          {pack.guaranteedRarity && (
            <div className="pack-stat guaranteed">
              <span className="stat-label">Guaranteed:</span>
              <span className="stat-value" style={{ color: RARITY_COLORS[pack.guaranteedRarity] }}>
                {pack.guaranteedRarity}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pack Footer */}
      <div className="pack-footer">
        <div className="pack-cost">
          <span className="cost-icon">💰</span>
          <span className="cost-value">{cost}</span>
        </div>

        {onBuy && (
          <button
            className="pack-buy-button"
            onClick={onBuy}
            disabled={!canAfford || sold}
          >
            {sold ? 'SOLD' : canAfford ? 'BUY' : 'NOT ENOUGH GOLD'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Example CSS (to be added to your styles)
 *
 * .pack-display {
 *   border: 2px solid;
 *   border-radius: 8px;
 *   padding: 16px;
 *   background: #1a1a1a;
 *   transition: all 0.2s;
 * }
 *
 * .pack-display:hover {
 *   transform: translateY(-2px);
 *   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
 * }
 *
 * .pack-header {
 *   display: flex;
 *   justify-content: space-between;
 *   align-items: center;
 *   margin-bottom: 12px;
 * }
 *
 * .pack-name {
 *   font-size: 18px;
 *   font-weight: bold;
 *   margin: 0;
 * }
 *
 * .pack-rarity {
 *   text-transform: uppercase;
 *   font-size: 10px;
 *   padding: 2px 6px;
 *   background: rgba(255, 255, 255, 0.1);
 *   border-radius: 4px;
 * }
 *
 * .pack-description {
 *   color: #aaa;
 *   font-size: 14px;
 *   margin-bottom: 12px;
 * }
 *
 * .pack-stats {
 *   display: flex;
 *   flex-direction: column;
 *   gap: 8px;
 *   margin-bottom: 12px;
 * }
 *
 * .pack-stat {
 *   display: flex;
 *   justify-content: space-between;
 *   font-size: 12px;
 * }
 *
 * .pack-stat.guaranteed {
 *   font-weight: bold;
 * }
 *
 * .pack-footer {
 *   display: flex;
 *   justify-content: space-between;
 *   align-items: center;
 *   border-top: 1px solid rgba(255, 255, 255, 0.1);
 *   padding-top: 12px;
 * }
 *
 * .pack-cost {
 *   display: flex;
 *   align-items: center;
 *   gap: 4px;
 *   font-size: 16px;
 *   font-weight: bold;
 * }
 *
 * .pack-buy-button {
 *   padding: 8px 16px;
 *   border: none;
 *   border-radius: 4px;
 *   background: #22c55e;
 *   color: white;
 *   font-weight: bold;
 *   cursor: pointer;
 *   transition: background 0.2s;
 * }
 *
 * .pack-buy-button:hover:not(:disabled) {
 *   background: #16a34a;
 * }
 *
 * .pack-buy-button:disabled {
 *   background: #555;
 *   cursor: not-allowed;
 * }
 */
