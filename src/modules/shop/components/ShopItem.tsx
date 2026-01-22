/**
 * ShopItem Component
 *
 * Displays a single item in the shop with its price and buy button.
 */

import React from 'react';
import type { ShopItem as ShopItemType } from '@/types/interfaces';
import { RARITY_COLORS } from '@/data/constants';

export interface ShopItemProps {
  item: ShopItemType;
  canAfford: boolean;
  onBuy: () => void;
  /** Optional item details to display */
  itemDetails?: {
    name: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  };
}

/**
 * Get display icon for item type
 */
function getItemTypeIcon(type: ShopItemType['type']): string {
  switch (type) {
    case 'joker':
      return '🃏';
    case 'card':
      return '🎴';
    case 'pack':
      return '📦';
    case 'voucher':
      return '🎫';
    default:
      return '❓';
  }
}

/**
 * Get display name for item type
 */
function getItemTypeName(type: ShopItemType['type']): string {
  switch (type) {
    case 'joker':
      return 'Joker';
    case 'card':
      return 'Card';
    case 'pack':
      return 'Pack';
    case 'voucher':
      return 'Voucher';
    default:
      return 'Unknown';
  }
}

export function ShopItem({ item, canAfford, onBuy, itemDetails }: ShopItemProps): React.ReactElement {
  const isSold = item.sold;
  const isDisabled = isSold || !canAfford;

  const rarityColor = itemDetails?.rarity
    ? RARITY_COLORS[itemDetails.rarity]
    : RARITY_COLORS.common;

  return (
    <div
      className={`
        relative flex flex-col items-center p-4 sm:p-5 rounded-lg border-2 transition-all min-w-[140px] sm:min-w-[160px]
        ${isSold ? 'opacity-50 bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-600 hover:border-gray-400'}
        ${!canAfford && !isSold ? 'border-red-900' : ''}
      `}
      style={{
        borderColor: !isSold && canAfford ? rarityColor : undefined,
      }}
    >
      {/* Item Type Badge */}
      <div className="absolute -top-2 -right-2 text-2xl sm:text-3xl">
        {getItemTypeIcon(item.type)}
      </div>

      {/* Item Display - 더 큰 아이콘 */}
      <div className="w-28 h-32 sm:w-32 sm:h-36 flex items-center justify-center text-5xl sm:text-6xl mb-3">
        {isSold ? '✕' : getItemTypeIcon(item.type)}
      </div>

      {/* Item Info */}
      <div className="text-center mb-3 w-full">
        <h3 className="font-bold text-white text-sm sm:text-base">
          {itemDetails?.name ?? getItemTypeName(item.type)}
        </h3>
        {itemDetails?.description && (
          <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2 px-1">
            {itemDetails.description}
          </p>
        )}
        {itemDetails?.rarity && (
          <span
            className="text-xs sm:text-sm font-medium"
            style={{ color: rarityColor }}
          >
            {itemDetails.rarity.charAt(0).toUpperCase() + itemDetails.rarity.slice(1)}
          </span>
        )}
      </div>

      {/* Price and Buy Button */}
      <div className="w-full mt-auto">
        <button
          onClick={onBuy}
          disabled={isDisabled}
          className={`
            w-full py-2 px-4 rounded font-bold transition-colors
            ${
              isDisabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-500 text-white cursor-pointer'
            }
          `}
        >
          {isSold ? (
            'SOLD'
          ) : (
            <span className="flex items-center justify-center gap-1">
              <span className="text-yellow-300">$</span>
              <span>{item.cost}</span>
            </span>
          )}
        </button>
        {!isSold && !canAfford && (
          <p className="text-xs text-red-400 text-center mt-1">Not enough gold</p>
        )}
      </div>
    </div>
  );
}

export default ShopItem;
