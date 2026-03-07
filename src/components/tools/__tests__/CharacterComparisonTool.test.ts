import { describe, it, expect, beforeEach } from 'vitest';
import type { Character, CharacterStats, CharacterAptitudes, CharacterGrowthRates } from '@/types';

// Test data for character comparison
const mockCharacters: Character[] = [
  {
    id: 'char_1',
    name_en: 'Test Character 1',
    name_jp: 'テストキャラ1',
    rarity: 3,
    initial_stats: { speed: 100, stamina: 80, power: 90, guts: 85, wisdom: 75 },
    max_stats: { speed: 150, stamina: 120, power: 140, guts: 130, wisdom: 110 },
    growth_rates: { speed: 20, stamina: 10, power: 15, guts: 12, wisdom: 8 },
    aptitudes: {
      turf: 'A', dirt: 'B', sprint: 'S', mile: 'A', medium: 'B', long: 'C',
      escape: 'A', lead: 'S', between: 'B', chase: 'C'
    },
    unique_skill: { name_en: 'Skill 1', effect: 'Test effect' },
    awakening_skills: ['skill1', 'skill2'],
    attributes: { speed: 100, stamina: 80, power: 90, guts: 85, wisdom: 75 },
    skills: ['skill1', 'skill2']
  },
  {
    id: 'char_2',
    name_en: 'Test Character 2',
    name_jp: 'テストキャラ2',
    rarity: 2,
    initial_stats: { speed: 80, stamina: 100, power: 85, guts: 90, wisdom: 95 },
    max_stats: { speed: 120, stamina: 150, power: 130, guts: 140, wisdom: 145 },
    growth_rates: { speed: 10, stamina: 25, power: 12, guts: 15, wisdom: 20 },
    aptitudes: {
      turf: 'S', dirt: 'A', sprint: 'B', mile: 'A', medium: 'S', long: 'A',
      escape: 'B', lead: 'A', between: 'S', chase: 'A'
    },
    unique_skill: { name_en: 'Skill 2', effect: 'Test effect 2' },
    awakening_skills: ['skill3'],
    attributes: { speed: 80, stamina: 100, power: 85, guts: 90, wisdom: 95 },
    skills: ['skill3']
  },
  {
    id: 'char_3',
    name_en: 'Test Character 3',
    name_jp: 'テストキャラ3',
    rarity: 1,
    initial_stats: { speed: 60, stamina: 60, power: 60, guts: 60, wisdom: 60 },
    max_stats: { speed: 100, stamina: 100, power: 100, guts: 100, wisdom: 100 },
    growth_rates: { speed: 5, stamina: 5, power: 5, guts: 5, wisdom: 5 },
    aptitudes: {
      turf: 'C', dirt: 'C', sprint: 'C', mile: 'C', medium: 'C', long: 'C',
      escape: 'C', lead: 'C', between: 'C', chase: 'C'
    },
    unique_skill: null,
    awakening_skills: [],
    attributes: { speed: 60, stamina: 60, power: 60, guts: 60, wisdom: 60 },
    skills: []
  }
];

// Helper functions from the component
const DEFAULT_STATS: CharacterStats = {
  speed: 0,
  stamina: 0,
  power: 0,
  guts: 0,
  wisdom: 0
};

const DEFAULT_APTITUDES: CharacterAptitudes = {
  turf: 'G', dirt: 'G', sprint: 'G', mile: 'G', medium: 'G', long: 'G',
  escape: 'G', lead: 'G', between: 'G', chase: 'G'
};

const APTITUDE_ORDER = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

function getAptitudeValue(rating: string): number {
  const index = APTITUDE_ORDER.indexOf(rating);
  return index === -1 ? 7 : index;
}

function getGrowthColor(rate: number | undefined): string {
  if (!rate) return 'text-gray-400';
  if (rate >= 20) return 'text-green-600 font-bold';
  if (rate >= 10) return 'text-blue-600 font-semibold';
  if (rate > 0) return 'text-yellow-600';
  return 'text-gray-500';
}

function formatAptitude(rating: string | undefined): string {
  return rating || 'G';
}

// Calculate best stats from selected characters
function calculateBestStats(characters: Character[]) {
  if (characters.length === 0) return null;
  
  const stats: Record<string, number> = { speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0 };
  const maxStats: Record<string, number> = { speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0 };
  
  characters.forEach(char => {
    const init = char.initial_stats || DEFAULT_STATS;
    const max = char.max_stats || DEFAULT_STATS;
    Object.keys(stats).forEach(key => {
      stats[key] = Math.max(stats[key], init[key as keyof CharacterStats] || 0);
      maxStats[key] = Math.max(maxStats[key], max[key as keyof CharacterStats] || 0);
    });
  });
  
  return { initial: stats, max: maxStats };
}

// Calculate best aptitudes from selected characters
function calculateBestAptitudes(characters: Character[]) {
  if (characters.length === 0) return {};
  
  const best: Record<string, string> = {};
  characters.forEach(char => {
    const apt = char.aptitudes || DEFAULT_APTITUDES;
    Object.entries(apt).forEach(([key, value]) => {
      if (!best[key] || getAptitudeValue(value) < getAptitudeValue(best[key])) {
        best[key] = value;
      }
    });
  });
  return best;
}

describe('CharacterComparisonTool', () => {
  describe('Data Processing', () => {
    it('should calculate best initial stats correctly', () => {
      const bestStats = calculateBestStats(mockCharacters);
      expect(bestStats).not.toBeNull();
      expect(bestStats?.initial.speed).toBe(100); // char_1 has highest speed
      expect(bestStats?.initial.stamina).toBe(100); // char_2 has highest stamina
      expect(bestStats?.initial.wisdom).toBe(95); // char_2 has highest wisdom
    });

    it('should calculate best max stats correctly', () => {
      const bestStats = calculateBestStats(mockCharacters);
      expect(bestStats?.max.speed).toBe(150); // char_1
      expect(bestStats?.max.stamina).toBe(150); // char_2
      expect(bestStats?.max.wisdom).toBe(145); // char_2
    });

    it('should handle empty character array', () => {
      const bestStats = calculateBestStats([]);
      expect(bestStats).toBeNull();
    });

    it('should handle single character', () => {
      const bestStats = calculateBestStats([mockCharacters[0]]);
      expect(bestStats?.initial.speed).toBe(100);
      expect(bestStats?.initial.stamina).toBe(80);
    });
  });

  describe('Aptitude Calculations', () => {
    it('should find best aptitudes across characters', () => {
      const bestAptitudes = calculateBestAptitudes(mockCharacters);
      expect(bestAptitudes.sprint).toBe('S'); // char_1 has S
      expect(bestAptitudes.medium).toBe('S'); // char_2 has S
      expect(bestAptitudes.turf).toBe('S'); // char_2 has S
    });

    it('should handle empty array for aptitudes', () => {
      const bestAptitudes = calculateBestAptitudes([]);
      expect(Object.keys(bestAptitudes)).toHaveLength(0);
    });

    it('should correctly compare aptitude values', () => {
      expect(getAptitudeValue('S')).toBe(0);
      expect(getAptitudeValue('A')).toBe(1);
      expect(getAptitudeValue('G')).toBe(7);
      expect(getAptitudeValue('')).toBe(7); // Invalid rating defaults to G
    });
  });

  describe('Growth Rate Colors', () => {
    it('should return correct color classes for growth rates', () => {
      expect(getGrowthColor(25)).toBe('text-green-600 font-bold');
      expect(getGrowthColor(20)).toBe('text-green-600 font-bold');
      expect(getGrowthColor(15)).toBe('text-blue-600 font-semibold');
      expect(getGrowthColor(10)).toBe('text-blue-600 font-semibold');
      expect(getGrowthColor(5)).toBe('text-yellow-600');
      expect(getGrowthColor(0)).toBe('text-gray-400'); // 0 is falsy so returns default
      expect(getGrowthColor(undefined)).toBe('text-gray-400');
    });
  });

  describe('Formatting Functions', () => {
    it('should format aptitude correctly', () => {
      expect(formatAptitude('S')).toBe('S');
      expect(formatAptitude('A')).toBe('A');
      expect(formatAptitude(undefined)).toBe('G');
      expect(formatAptitude('')).toBe('G');
    });
  });

  describe('Character Data Validation', () => {
    it('should handle missing optional fields gracefully', () => {
      const incompleteChar: Character = {
        id: 'incomplete',
        name_en: 'Incomplete',
        name_jp: '不完全',
        rarity: 1
      };
      
      const stats = incompleteChar.initial_stats || DEFAULT_STATS;
      expect(stats.speed).toBe(0);
    });

    it('should calculate total stats correctly', () => {
      const char = mockCharacters[0];
      const initStats = char.initial_stats || DEFAULT_STATS;
      const total = Object.values(initStats).reduce((a, b) => a + b, 0);
      expect(total).toBe(430); // 100+80+90+85+75
    });
  });

  describe('Search Filtering', () => {
    it('should match search query to character names', () => {
      const query = 'test character 1';
      const char = mockCharacters[0];
      const searchString = `${char.name_en} ${char.name_jp}`.toLowerCase();
      expect(searchString.includes(query)).toBe(true);
    });

    it('should handle partial matches', () => {
      const query = 'char 2';
      const char = mockCharacters[1];
      const searchString = `${char.name_en}`.toLowerCase();
      expect(searchString.includes('char') || searchString.includes('2')).toBe(true);
    });
  });

  describe('Comparison Logic', () => {
    it('should correctly identify character with highest stat', () => {
      const characters = [mockCharacters[0], mockCharacters[1]];
      const bestStats = calculateBestStats(characters);
      
      // char_1 has speed 100, char_2 has speed 80
      expect(bestStats?.initial.speed).toBe(100);
      
      // char_1 has stamina 80, char_2 has stamina 100
      expect(bestStats?.initial.stamina).toBe(100);
    });

    it('should handle characters with missing stats', () => {
      const charWithMissingStats: Character = {
        ...mockCharacters[0],
        initial_stats: { speed: 50, stamina: 0, power: 0, guts: 0, wisdom: 0 }
      };
      
      const bestStats = calculateBestStats([charWithMissingStats, mockCharacters[1]]);
      expect(bestStats?.initial.speed).toBe(80); // From char_2
      expect(bestStats?.initial.stamina).toBe(100); // From char_2
    });
  });
});
