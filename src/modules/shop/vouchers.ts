/**
 * Vouchers Module - Permanent Upgrade System
 *
 * Vouchers provide permanent bonuses that persist across rounds.
 * Each voucher can only be purchased once.
 */

import type { Voucher, VoucherEffect, VoucherModifiers } from '@/types/interfaces';
import vouchersData from '@/data/vouchers.json';

/**
 * Get voucher by ID
 *
 * @param id - The voucher ID
 * @returns The voucher data, or undefined if not found
 */
export function getVoucherById(id: string): Voucher | undefined {
  return vouchersData.vouchers.find((v) => v.id === id) as Voucher | undefined;
}

/**
 * Get all vouchers
 *
 * @returns Array of all vouchers
 */
export function getAllVouchers(): Voucher[] {
  return vouchersData.vouchers as Voucher[];
}

/**
 * Get vouchers filtered by rarity
 *
 * @param rarity - The rarity level
 * @returns Array of vouchers with that rarity
 */
export function getVouchersByRarity(
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
): Voucher[] {
  return vouchersData.vouchers.filter((v) => v.rarity === rarity) as Voucher[];
}

/**
 * Calculate voucher modifiers from purchased vouchers
 *
 * @param purchasedVoucherIds - Array of purchased voucher IDs
 * @returns Aggregated modifiers
 */
export function calculateVoucherModifiers(purchasedVoucherIds: string[]): VoucherModifiers {
  const modifiers: VoucherModifiers = {
    handsBonus: 0,
    discardsBonus: 0,
    handSizeBonus: 0,
    maxJokersBonus: 0,
    slotSpinsBonus: 0,
    startingGoldBonus: 0,
    rerollDiscount: 0,
    luckBonus: 0,
    interestRate: 0,
    interestMax: 0,
  };

  for (const voucherId of purchasedVoucherIds) {
    const voucher = getVoucherById(voucherId);
    if (!voucher) continue;

    applyEffectToModifiers(voucher.effect, modifiers);
  }

  return modifiers;
}

/**
 * Apply a single voucher effect to modifiers
 *
 * @param effect - The voucher effect to apply
 * @param modifiers - The modifiers object to update
 */
function applyEffectToModifiers(effect: VoucherEffect, modifiers: VoucherModifiers): void {
  switch (effect.type) {
    case 'hands_bonus':
      modifiers.handsBonus += effect.value;
      break;
    case 'discards_bonus':
      modifiers.discardsBonus += effect.value;
      break;
    case 'hand_size_bonus':
      modifiers.handSizeBonus += effect.value;
      break;
    case 'max_jokers_bonus':
      modifiers.maxJokersBonus += effect.value;
      break;
    case 'slot_spins_bonus':
      modifiers.slotSpinsBonus += effect.value;
      break;
    case 'starting_gold_bonus':
      modifiers.startingGoldBonus += effect.value;
      break;
    case 'reroll_discount':
      modifiers.rerollDiscount += effect.value;
      break;
    case 'luck_bonus':
      modifiers.luckBonus += effect.value;
      break;
    case 'interest':
      modifiers.interestRate += effect.rate;
      modifiers.interestMax = Math.max(modifiers.interestMax, effect.max);
      break;
    case 'combo':
      // Apply each sub-effect
      for (const subEffect of effect.effects) {
        applyEffectToModifiers(subEffect, modifiers);
      }
      break;
  }
}

/**
 * Calculate interest gold based on current gold and voucher modifiers
 *
 * @param currentGold - Current player gold
 * @param modifiers - Voucher modifiers
 * @returns Interest gold earned
 */
export function calculateInterest(currentGold: number, modifiers: VoucherModifiers): number {
  if (modifiers.interestRate === 0) return 0;

  const interest = Math.floor(currentGold * modifiers.interestRate);
  return Math.min(interest, modifiers.interestMax);
}

/**
 * Check if a voucher has already been purchased
 *
 * @param voucherId - The voucher ID to check
 * @param purchasedVouchers - Array of purchased voucher IDs
 * @returns True if already purchased
 */
export function isVoucherPurchased(
  voucherId: string,
  purchasedVouchers: string[]
): boolean {
  return purchasedVouchers.includes(voucherId);
}
