/**
 * Shop Module - Public API
 *
 * This module handles the shop system including:
 * - Shop generation (items based on round and luck)
 * - Pricing calculation
 * - Buy and reroll transactions
 * - Shop UI components
 *
 * IMPORTANT: This module does NOT directly modify game state.
 * All transactions return results that the core module uses to update state.
 */

// Logic exports
export { generateShop, generateShopWithSeed, selectItemType, selectRarity } from './shopGenerator';
export {
  buyItem,
  reroll,
  markItemAsSold,
  calculateRerollCost,
  canAffordItem,
  canAffordReroll,
  type RerollResult,
  type RerollError,
  type ExtendedTransaction,
} from './transactions';
export {
  calculatePrice,
  calculatePriceWithRoundScaling,
  getBasePrice,
  BASE_PRICES,
  RARITY_MULTIPLIERS,
} from './pricing';
export {
  openPack,
  getAllPacks,
  getPackById,
  getPacksByRarity,
  getPackName,
  getPackDescription,
  getPackRarity,
  calculatePackValue,
  type PackData,
  type PackResult,
} from './packs';
export {
  getVoucherById,
  getAllVouchers,
  getVouchersByRarity,
  calculateVoucherModifiers,
  calculateInterest,
  isVoucherPurchased,
} from './vouchers';

// Component exports
export { Shop, ShopItem, RerollButton, PackDisplay, PackOpenOverlay } from './components';
export type { ShopProps, ShopItemProps, RerollButtonProps, PackDisplayProps, PackOpenOverlayProps } from './components';

// Re-export types from interfaces for convenience
export type { ShopState, ShopItem as ShopItemType, Transaction } from '@/types/interfaces';
