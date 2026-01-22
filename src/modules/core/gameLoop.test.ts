/**
 * Game Loop Tests
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE_TRANSITIONS,
  getNextPhase,
  getTargetScoreForRound,
  getRoundBonuses,
  createDefaultConfig,
  mergeGameConfig,
  isActionValidInPhase,
  isValidTransition,
} from './gameLoop';
import type { GameState, GamePhase } from '@/types/interfaces';

describe('Game Loop', () => {
  describe('PHASE_TRANSITIONS', () => {
    it('should define transitions for all phases', () => {
      const phases: GamePhase[] = [
        'IDLE',
        'SLOT_PHASE',
        'DRAW_PHASE',
        'PLAY_PHASE',
        'SCORE_PHASE',
        'ROULETTE_PHASE',
        'REWARD_PHASE',
        'SHOP_PHASE',
        'GAME_OVER',
      ];

      phases.forEach(phase => {
        expect(PHASE_TRANSITIONS[phase]).toBeDefined();
      });
    });

    it('should have correct standard transitions', () => {
      expect(PHASE_TRANSITIONS.IDLE).toBe('SLOT_PHASE');
      expect(PHASE_TRANSITIONS.SLOT_PHASE).toBe('DRAW_PHASE');
      expect(PHASE_TRANSITIONS.DRAW_PHASE).toBe('PLAY_PHASE');
      expect(PHASE_TRANSITIONS.PLAY_PHASE).toBe('SCORE_PHASE');
      expect(PHASE_TRANSITIONS.SCORE_PHASE).toBe('ROULETTE_PHASE');
      expect(PHASE_TRANSITIONS.ROULETTE_PHASE).toBe('REWARD_PHASE');
    });
  });

  describe('getNextPhase', () => {
    function createMockState(overrides: Partial<GameState>): GameState {
      return {
        phase: 'IDLE',
        round: 1,
        turn: 1,
        targetScore: 300,
        currentScore: 0,
        gold: 100,
        deck: { cards: [], discardPile: [] },
        hand: [],
        selectedCards: [],
        slotResult: null,
        handResult: null,
        scoreCalculation: null,
        rouletteResult: null,
        triggeredSlotResults: [],
        rouletteSpinsGranted: 0,
        jokers: [],
        maxJokers: 5,
        purchasedVouchers: [],
        handsRemaining: 4,
        discardsRemaining: 3,
        slotSpinsRemaining: 4,
        openedPackCards: null,
        consumableOverlay: null,
        handMultiplierBonuses: {},
        roundRewardState: null,
        rouletteProbabilityMods: { safeBonus: 0, riskyBonus: 0, halfPenalty: 0 },
        permanentSlotBuffs: { symbolWeightBonuses: {} },
        nextRoundStartScoreRatio: 0,
        ...overrides,
      };
    }

    it('should return SLOT_PHASE from IDLE', () => {
      const state = createMockState({ phase: 'IDLE' });
      expect(getNextPhase(state)).toBe('SLOT_PHASE');
    });

    it('should return SLOT_PHASE from REWARD_PHASE if hands remaining', () => {
      const state = createMockState({
        phase: 'REWARD_PHASE',
        handsRemaining: 3,
        currentScore: 100,
        targetScore: 300,
      });
      expect(getNextPhase(state)).toBe('SLOT_PHASE');
    });

    it('should return SHOP_PHASE from REWARD_PHASE if target met', () => {
      const state = createMockState({
        phase: 'REWARD_PHASE',
        handsRemaining: 0,
        currentScore: 500,
        targetScore: 300,
      });
      expect(getNextPhase(state)).toBe('SHOP_PHASE');
    });

    it('should return GAME_OVER from REWARD_PHASE if no hands and target not met', () => {
      const state = createMockState({
        phase: 'REWARD_PHASE',
        handsRemaining: 0,
        currentScore: 100,
        targetScore: 300,
      });
      expect(getNextPhase(state)).toBe('GAME_OVER');
    });

    it('should return SLOT_PHASE from SHOP_PHASE', () => {
      const state = createMockState({ phase: 'SHOP_PHASE' });
      expect(getNextPhase(state)).toBe('SLOT_PHASE');
    });
  });

  describe('getTargetScoreForRound', () => {
    it('should return correct target for early rounds', () => {
      expect(getTargetScoreForRound(1)).toBe(300);
      expect(getTargetScoreForRound(2)).toBe(800);
      expect(getTargetScoreForRound(3)).toBe(2000);
    });

    it('should return correct target for later rounds', () => {
      expect(getTargetScoreForRound(7)).toBe(35000);
      expect(getTargetScoreForRound(8)).toBe(50000);
    });

    it('should calculate endless mode scores correctly', () => {
      // Beyond round 8, should add 25000 per round
      expect(getTargetScoreForRound(9)).toBe(75000);
      expect(getTargetScoreForRound(10)).toBe(100000);
    });
  });

  describe('getRoundBonuses', () => {
    it('should return correct bonuses for rounds with bonuses', () => {
      const round3 = getRoundBonuses(3);
      expect(round3.discardsBonus).toBe(1);
      expect(round3.handsBonus).toBe(0);

      const round4 = getRoundBonuses(4);
      expect(round4.handsBonus).toBe(1);
      expect(round4.discardsBonus).toBe(0);
    });

    it('should return zero bonuses for rounds without bonuses', () => {
      const round1 = getRoundBonuses(1);
      expect(round1.handsBonus).toBe(0);
      expect(round1.discardsBonus).toBe(0);
    });

    it('should return zero bonuses for endless rounds', () => {
      const round10 = getRoundBonuses(10);
      expect(round10.handsBonus).toBe(0);
      expect(round10.discardsBonus).toBe(0);
    });
  });

  describe('createDefaultConfig', () => {
    it('should create a config with all required fields', () => {
      const config = createDefaultConfig();
      expect(config.startingGold).toBeDefined();
      expect(config.startingHands).toBeDefined();
      expect(config.startingDiscards).toBeDefined();
      expect(config.handSize).toBeDefined();
      expect(config.maxJokers).toBeDefined();
      expect(config.roundScores).toBeDefined();
      expect(Array.isArray(config.roundScores)).toBe(true);
    });

    it('should have correct default values', () => {
      const config = createDefaultConfig();
      expect(config.startingGold).toBe(100);
      expect(config.startingHands).toBe(4);
      expect(config.startingDiscards).toBe(3);
      expect(config.handSize).toBe(8);
      expect(config.maxJokers).toBe(5);
    });
  });

  describe('mergeGameConfig', () => {
    it('should return default config when no partial provided', () => {
      const config = mergeGameConfig();
      expect(config.startingGold).toBe(100);
    });

    it('should override specific values', () => {
      const config = mergeGameConfig({ startingGold: 200 });
      expect(config.startingGold).toBe(200);
      expect(config.startingHands).toBe(4); // unchanged
    });

    it('should override multiple values', () => {
      const config = mergeGameConfig({
        startingGold: 150,
        maxJokers: 10,
      });
      expect(config.startingGold).toBe(150);
      expect(config.maxJokers).toBe(10);
      expect(config.startingHands).toBe(4);
    });
  });

  describe('isActionValidInPhase', () => {
    it('should validate startGame in IDLE', () => {
      expect(isActionValidInPhase('startGame', 'IDLE')).toBe(true);
      expect(isActionValidInPhase('playHand', 'IDLE')).toBe(false);
    });

    it('should validate spinSlot in SLOT_PHASE', () => {
      expect(isActionValidInPhase('spinSlot', 'SLOT_PHASE')).toBe(true);
      expect(isActionValidInPhase('playHand', 'SLOT_PHASE')).toBe(false);
    });

    it('should validate card actions in PLAY_PHASE', () => {
      expect(isActionValidInPhase('selectCard', 'PLAY_PHASE')).toBe(true);
      expect(isActionValidInPhase('deselectCard', 'PLAY_PHASE')).toBe(true);
      expect(isActionValidInPhase('playHand', 'PLAY_PHASE')).toBe(true);
      expect(isActionValidInPhase('discardSelected', 'PLAY_PHASE')).toBe(true);
    });

    it('should validate roulette actions in ROULETTE_PHASE', () => {
      expect(isActionValidInPhase('spinRoulette', 'ROULETTE_PHASE')).toBe(true);
      expect(isActionValidInPhase('skipRoulette', 'ROULETTE_PHASE')).toBe(true);
      expect(isActionValidInPhase('playHand', 'ROULETTE_PHASE')).toBe(false);
    });

    it('should validate shop actions in SHOP_PHASE', () => {
      expect(isActionValidInPhase('buyItem', 'SHOP_PHASE')).toBe(true);
      expect(isActionValidInPhase('rerollShop', 'SHOP_PHASE')).toBe(true);
      expect(isActionValidInPhase('leaveShop', 'SHOP_PHASE')).toBe(true);
    });
  });

  describe('isValidTransition', () => {
    it('should allow valid standard transitions', () => {
      expect(isValidTransition('IDLE', 'SLOT_PHASE')).toBe(true);
      expect(isValidTransition('SLOT_PHASE', 'DRAW_PHASE')).toBe(true);
      expect(isValidTransition('PLAY_PHASE', 'SCORE_PHASE')).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(isValidTransition('IDLE', 'PLAY_PHASE')).toBe(false);
      expect(isValidTransition('SLOT_PHASE', 'SHOP_PHASE')).toBe(false);
    });

    it('should allow special REWARD_PHASE transitions', () => {
      expect(isValidTransition('REWARD_PHASE', 'SLOT_PHASE')).toBe(true);
      expect(isValidTransition('REWARD_PHASE', 'SHOP_PHASE')).toBe(true);
      expect(isValidTransition('REWARD_PHASE', 'GAME_OVER')).toBe(true);
    });

    it('should only allow IDLE from GAME_OVER', () => {
      expect(isValidTransition('GAME_OVER', 'IDLE')).toBe(true);
      expect(isValidTransition('GAME_OVER', 'SLOT_PHASE')).toBe(false);
    });
  });
});
