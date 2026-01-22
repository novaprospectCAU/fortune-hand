/**
 * Shop Component
 *
 * Main shop interface displaying items, reroll button, and player gold.
 */

import React from 'react';
import type { ShopState } from '@/types/interfaces';
import { ShopItem, type ShopItemProps } from './ShopItem';
import { RerollButton } from './RerollButton';
import { calculateRerollCost, canAffordItem, canAffordReroll } from '../transactions';
import { useI18n } from '@/modules/ui';

export interface ShopProps {
  shopState: ShopState;
  playerGold: number;
  onBuy: (itemId: string) => void;
  onReroll: () => void;
  onLeave: () => void;
  /** Optional function to get item details for display */
  getItemDetails?: (
    itemId: string,
    itemType: string
  ) => ShopItemProps['itemDetails'];
}

export function Shop({
  shopState,
  playerGold,
  onBuy,
  onReroll,
  onLeave,
  getItemDetails,
}: ShopProps): React.ReactElement {
  const { t } = useI18n();
  const rerollCost = calculateRerollCost(shopState);
  const canReroll = canAffordReroll(shopState, playerGold);

  return (
    <div className="flex flex-col min-h-full bg-gray-950 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">{t('shop')}</h1>
        <div className="flex items-center gap-4">
          {/* Player Gold */}
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-yellow-400">{playerGold}</span>
          </div>
        </div>
      </div>

      {/* Shop Items Grid */}
      <div className="flex-1 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shopState.items.map((item) => (
            <ShopItem
              key={item.id}
              item={item}
              canAfford={canAffordItem(item, playerGold)}
              onBuy={() => onBuy(item.id)}
              itemDetails={getItemDetails?.(item.itemId, item.type)}
            />
          ))}
        </div>

        {shopState.items.length === 0 && (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <p>{t('noItemsAvailable')}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center border-t border-gray-800 pt-4">
        <RerollButton
          cost={rerollCost}
          canAfford={canReroll}
          onClick={onReroll}
          rerollCount={shopState.rerollsUsed}
        />

        <button
          onClick={onLeave}
          className="
            flex items-center gap-2 py-2 px-6 rounded-lg font-bold
            bg-gray-700 hover:bg-gray-600 text-white transition-colors
          "
        >
          <span>{t('leaveShop')}</span>
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}

export default Shop;
