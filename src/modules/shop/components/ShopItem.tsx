/**
 * ShopItem Component
 *
 * Displays a single item in the shop with its price and buy button.
 */

import React from 'react';
import type { ShopItem as ShopItemType, Suit, Rank } from '@/types/interfaces';
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
    /** Card-specific details for displaying actual card */
    cardInfo?: {
      suit: Suit;
      rank: Rank;
      isWild?: boolean;
      isGold?: boolean;
      triggerSlot?: boolean;
      triggerRoulette?: boolean;
    };
  };
}

/** Suit symbols */
const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

/** Suit colors */
const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#ef4444',
  diamonds: '#ef4444',
  clubs: '#1f2937',
  spades: '#1f2937',
};

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

      {/* Item Display - 카드는 실제 카드 비주얼 표시 */}
      <div className="w-28 h-32 sm:w-32 sm:h-36 flex items-center justify-center mb-3">
        {isSold ? (
          <span className="text-5xl sm:text-6xl">✕</span>
        ) : item.type === 'card' && itemDetails?.cardInfo ? (
          <div
            className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg bg-white border-2 flex flex-col items-center justify-between p-1 shadow-lg relative"
            style={{
              borderColor: itemDetails.cardInfo.isWild ? '#a855f7' :
                          itemDetails.cardInfo.isGold ? '#f59e0b' :
                          itemDetails.cardInfo.triggerSlot ? '#22c55e' :
                          itemDetails.cardInfo.triggerRoulette ? '#3b82f6' : '#d1d5db',
              boxShadow: itemDetails.cardInfo.isWild ? '0 0 12px rgba(168, 85, 247, 0.4)' :
                         itemDetails.cardInfo.isGold ? '0 0 12px rgba(245, 158, 11, 0.4)' :
                         itemDetails.cardInfo.triggerSlot ? '0 0 12px rgba(34, 197, 94, 0.4)' :
                         itemDetails.cardInfo.triggerRoulette ? '0 0 12px rgba(59, 130, 246, 0.4)' : undefined,
            }}
          >
            {/* Top left rank/suit */}
            <div
              className="self-start text-sm font-bold leading-tight"
              style={{ color: SUIT_COLORS[itemDetails.cardInfo.suit] }}
            >
              <div>{itemDetails.cardInfo.rank}</div>
              <div>{SUIT_SYMBOLS[itemDetails.cardInfo.suit]}</div>
            </div>
            {/* Center suit */}
            <div
              className="text-3xl sm:text-4xl"
              style={{ color: SUIT_COLORS[itemDetails.cardInfo.suit] }}
            >
              {SUIT_SYMBOLS[itemDetails.cardInfo.suit]}
            </div>
            {/* Bottom right rank/suit (rotated) */}
            <div
              className="self-end text-sm font-bold leading-tight rotate-180"
              style={{ color: SUIT_COLORS[itemDetails.cardInfo.suit] }}
            >
              <div>{itemDetails.cardInfo.rank}</div>
              <div>{SUIT_SYMBOLS[itemDetails.cardInfo.suit]}</div>
            </div>
            {/* Special card indicator */}
            {(itemDetails.cardInfo.isWild || itemDetails.cardInfo.isGold || itemDetails.cardInfo.triggerSlot || itemDetails.cardInfo.triggerRoulette) && (
              <div className="absolute top-1 right-1 text-xs">
                {itemDetails.cardInfo.isWild && <span title="Wild">🌟</span>}
                {itemDetails.cardInfo.isGold && <span title="Gold">💰</span>}
                {itemDetails.cardInfo.triggerSlot && <span title="Slot">🎰</span>}
                {itemDetails.cardInfo.triggerRoulette && <span title="Roulette">🎯</span>}
              </div>
            )}
          </div>
        ) : (
          <span className="text-5xl sm:text-6xl">{getItemTypeIcon(item.type)}</span>
        )}
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
