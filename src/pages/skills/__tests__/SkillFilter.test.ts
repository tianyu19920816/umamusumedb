import { describe, it, expect } from 'vitest';
import type { Skill } from '@/types';

// Mock skills data with various attributes
const mockSkills: Skill[] = [
  {
    id: 'speed_star',
    name_en: 'Speed Star',
    name_jp: 'スピードスター',
    description_en: 'Speed +0.15 m/s',
    effect: 'Speed +0.15 m/s',
    trigger_condition: 'Middle phase',
    duration: '3.0s',
    cooldown: '30s',
    activation_rate: '100%',
    skill_type: 'common',
    rarity: 'A',
    cost: 100,
    icon_url: '/icons/skills/speed_star.png'
  },
  {
    id: 'sprint_turbo',
    name_en: 'Sprint Turbo',
    name_jp: 'スプリントターボ',
    description_en: 'Speed +0.45 m/s in sprint',
    effect: 'Speed +0.45 m/s in sprint',
    trigger_condition: 'Sprint races only',
    duration: 'Entire race',
    cooldown: 'None',
    activation_rate: '100%',
    skill_type: 'unique',
    rarity: 'S',
    cost: 200,
    icon_url: '/icons/skills/sprint_turbo.png'
  },
  {
    id: 'escape_artist',
    name_en: 'Escape Artist',
    name_jp: '逃げの達人',
    description_en: 'Speed when escaping',
    effect: 'Speed +0.25 m/s when escaping',
    trigger_condition: 'When escaping',
    duration: 'While escaping',
    cooldown: 'None',
    activation_rate: '100%',
    skill_type: 'common',
    rarity: 'B',
    cost: 120,
    icon_url: '/icons/skills/escape_artist.png'
  },
  {
    id: 'stamina_keep',
    name_en: 'Stamina Keep',
    name_jp: 'スタミナキープ',
    description_en: 'Stamina consumption -15%',
    effect: 'Stamina consumption -15%',
    trigger_condition: 'Middle phase',
    duration: '3.0s',
    cooldown: '30s',
    activation_rate: '100%',
    skill_type: 'common',
    rarity: 'A',
    cost: 100,
    icon_url: '/icons/skills/stamina_keep.png'
  },
  {
    id: 'final_push',
    name_en: 'Final Push',
    name_jp: '最後の追い込み',
    description_en: 'Speed in final stretch',
    effect: 'Speed +0.35 m/s',
    trigger_condition: 'Last 200m',
    duration: 'Until finish',
    cooldown: 'Once per race',
    activation_rate: '100%',
    skill_type: 'unique',
    rarity: 'SS',
    cost: 300,
    icon_url: '/icons/skills/final_push.png'
  },
  {
    id: 'long_runner',
    name_en: 'Long Runner',
    name_jp: '長距離走者',
    description_en: 'Stamina in long races',
    effect: 'Stamina +400 in long races',
    trigger_condition: 'Long distance only',
    duration: 'Entire race',
    cooldown: 'None',
    activation_rate: '100%',
    skill_type: 'common',
    rarity: 'S',
    cost: 150,
    icon_url: '/icons/skills/long_runner.png'
  },
  {
    id: 'mile_champion',
    name_en: 'Mile Champion',
    name_jp: 'マイルチャンピオン',
    description_en: 'Stats in mile races',
    effect: 'All stats +150 in mile races',
    trigger_condition: 'Mile races only',
    duration: 'Entire race',
    cooldown: 'None',
    activation_rate: '100%',
    skill_type: 'training',
    rarity: 'A',
    cost: 180,
    icon_url: '/icons/skills/mile_champion.png'
  },
  {
    id: 'curve_specialist',
    name_en: 'Curve Specialist',
    name_jp: 'コーナー巧者',
    description_en: 'Speed on curves',
    effect: 'Speed +0.2 m/s on curves',
    trigger_condition: 'Final corner on curve',
    duration: '3.0s',
    cooldown: 'Once per race',
    activation_rate: '100%',
    skill_type: 'common',
    rarity: 'B',
    cost: 110,
    icon_url: '/icons/skills/curve_specialist.png'
  }
];

// Helper function to infer phase from trigger condition
function inferPhase(skill: Skill): string {
  const trigger = (skill.trigger_condition || '').toLowerCase();
  if (trigger.includes('start') || trigger.includes('immediately')) return 'start';
  if (trigger.includes('middle') || trigger.includes('throughout')) return 'middle';
  if (trigger.includes('final') || trigger.includes('last') || trigger.includes('spurt')) return 'final';
  if (trigger.includes('corner') || trigger.includes('curve')) return 'corner';
  if (trigger.includes('straight')) return 'straight';
  return 'other';
}

// Helper function to infer distance from trigger/effect
function inferDistance(skill: Skill): string {
  const trigger = (skill.trigger_condition || '').toLowerCase();
  const effect = (skill.effect || '').toLowerCase();
  
  if (trigger.includes('sprint') || effect.includes('sprint')) return 'sprint';
  if (trigger.includes('mile') || effect.includes('mile')) return 'mile';
  if (trigger.includes('medium') || trigger.includes('middle distance')) return 'medium';
  if (trigger.includes('long') || effect.includes('long')) return 'long';
  return 'all';
}

// Helper function to infer running style
function inferStyle(skill: Skill): string {
  const trigger = (skill.trigger_condition || '').toLowerCase();
  const effect = (skill.effect || '').toLowerCase();
  
  if (trigger.includes('escap') || effect.includes('escap')) return 'escape';
  if (trigger.includes('lead') || trigger.includes('1st') || trigger.includes('chase')) return 'lead';
  if (trigger.includes('between') || trigger.includes('overtaking') || trigger.includes('pass')) return 'between';
  if (trigger.includes('chase') || trigger.includes('5th') || trigger.includes('last')) return 'chase';
  return 'all';
}

// Helper function to infer effect type
function inferEffectType(skill: Skill): string {
  const effect = (skill.effect || '').toLowerCase();
  
  if (effect.includes('speed')) return 'speed';
  if (effect.includes('acceleration') || effect.includes('accel')) return 'acceleration';
  if (effect.includes('stamina') || effect.includes('energy')) return 'stamina';
  if (effect.includes('power')) return 'power';
  if (effect.includes('position')) return 'positioning';
  if (effect.includes('stat')) return 'all_stats';
  return 'other';
}

// Filter function matching the component logic
function filterSkills(
  skills: Skill[],
  searchQuery: string,
  rarity: string,
  type: string,
  phase: string,
  distance: string,
  style: string,
  effectType: string
): Skill[] {
  const q = searchQuery.toLowerCase().trim();
  
  return skills.filter(skill => {
    const searchString = `${skill.name_en} ${skill.name_jp || ''} ${skill.effect || ''} ${skill.trigger_condition || ''}`.toLowerCase();
    
    const matchesSearch = !q || searchString.includes(q);
    const matchesRarity = rarity === 'all' || skill.rarity === rarity;
    const matchesType = type === 'all' || (skill.skill_type || '').toLowerCase() === type;
    const matchesPhase = phase === 'all' || inferPhase(skill) === phase;
    const matchesDistance = distance === 'all' || inferDistance(skill) === distance;
    const matchesStyle = style === 'all' || inferStyle(skill) === style;
    const matchesEffect = effectType === 'all' || inferEffectType(skill) === effectType;
    
    return matchesSearch && matchesRarity && matchesType && matchesPhase && 
           matchesDistance && matchesStyle && matchesEffect;
  });
}

describe('Skill Filter', () => {
  describe('Phase Inference', () => {
    it('should correctly infer phase from trigger conditions', () => {
      expect(inferPhase(mockSkills[0])).toBe('middle'); // "Middle phase"
      expect(inferPhase(mockSkills[1])).toBe('other'); // "Sprint races only"
      expect(inferPhase(mockSkills[4])).toBe('final'); // "Last 200m"
      // Note: "Final corner" contains "final" so it matches final before corner
      expect(inferPhase(mockSkills[7])).toBe('final'); // "Final corner on curve"
    });

    it('should handle edge cases for phase detection', () => {
      expect(inferPhase({ trigger_condition: 'Start of race' } as Skill)).toBe('start');
      expect(inferPhase({ trigger_condition: 'Straight sections' } as Skill)).toBe('straight');
      expect(inferPhase({ trigger_condition: '' } as Skill)).toBe('other');
      expect(inferPhase({} as Skill)).toBe('other');
    });
  });

  describe('Distance Inference', () => {
    it('should correctly infer distance from trigger/effect', () => {
      expect(inferDistance(mockSkills[1])).toBe('sprint'); // Sprint races only
      expect(inferDistance(mockSkills[5])).toBe('long'); // Long distance only
      expect(inferDistance(mockSkills[6])).toBe('mile'); // Mile races
      expect(inferDistance(mockSkills[0])).toBe('all'); // No specific distance
    });

    it('should prioritize trigger condition over effect', () => {
      const skill: Skill = {
        ...mockSkills[0],
        trigger_condition: 'Sprint races',
        effect: 'Stamina boost in all races'
      };
      expect(inferDistance(skill)).toBe('sprint');
    });
  });

  describe('Style Inference', () => {
    it('should correctly infer running style', () => {
      expect(inferStyle(mockSkills[2])).toBe('escape'); // "When escaping"
      expect(inferStyle(mockSkills[0])).toBe('all'); // No specific style
    });

    it('should detect chase-related triggers', () => {
      const chaseSkill: Skill = {
        ...mockSkills[0],
        trigger_condition: 'When in 5th place or lower'
      };
      expect(inferStyle(chaseSkill)).toBe('chase');
    });
  });

  describe('Effect Type Inference', () => {
    it('should correctly categorize effect types', () => {
      expect(inferEffectType(mockSkills[0])).toBe('speed'); // Speed +0.15 m/s
      expect(inferEffectType(mockSkills[3])).toBe('stamina'); // Stamina consumption
      expect(inferEffectType(mockSkills[6])).toBe('all_stats'); // All stats +150
    });

    it('should handle stamina-related effects', () => {
      const energySkill: Skill = {
        ...mockSkills[0],
        effect: 'Energy consumption reduced'
      };
      expect(inferEffectType(energySkill)).toBe('stamina');
    });
  });

  describe('Filter Combinations', () => {
    it('should return all skills when filters are "all"', () => {
      const result = filterSkills(mockSkills, '', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(mockSkills.length);
    });

    it('should filter by rarity correctly', () => {
      const result = filterSkills(mockSkills, '', 'S', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(2); // sprint_turbo and long_runner
      expect(result.every(s => s.rarity === 'S')).toBe(true);
    });

    it('should filter by skill type correctly', () => {
      const result = filterSkills(mockSkills, '', 'all', 'unique', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(2); // sprint_turbo and final_push
      expect(result.every(s => s.skill_type === 'unique')).toBe(true);
    });

    it('should filter by phase correctly', () => {
      const result = filterSkills(mockSkills, '', 'all', 'all', 'middle', 'all', 'all', 'all');
      expect(result).toHaveLength(2); // speed_star and stamina_keep
    });

    it('should filter by distance correctly', () => {
      const result = filterSkills(mockSkills, '', 'all', 'all', 'all', 'sprint', 'all', 'all');
      expect(result).toHaveLength(1); // sprint_turbo
    });

    it('should filter by effect type correctly', () => {
      const result = filterSkills(mockSkills, '', 'all', 'all', 'all', 'all', 'all', 'speed');
      expect(result.every(s => inferEffectType(s) === 'speed')).toBe(true);
    });

    it('should combine multiple filters', () => {
      const result = filterSkills(mockSkills, '', 'A', 'common', 'middle', 'all', 'all', 'all');
      expect(result).toHaveLength(2); // speed_star and stamina_keep
      expect(result.every(s => s.rarity === 'A' && s.skill_type === 'common')).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    it('should search by name (English)', () => {
      const result = filterSkills(mockSkills, 'speed star', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].name_en).toBe('Speed Star');
    });

    it('should search by name (Japanese)', () => {
      const result = filterSkills(mockSkills, 'スピード', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should search by effect text', () => {
      const result = filterSkills(mockSkills, 'stamina consumption', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('stamina_keep');
    });

    it('should search by trigger condition', () => {
      const result = filterSkills(mockSkills, 'last 200m', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('final_push');
    });

    it('should be case insensitive', () => {
      const result1 = filterSkills(mockSkills, 'SPEED', 'all', 'all', 'all', 'all', 'all', 'all');
      const result2 = filterSkills(mockSkills, 'speed', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result1.length).toBe(result2.length);
    });

    it('should return empty array for no matches', () => {
      const result = filterSkills(mockSkills, 'xyznonexistent', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(0);
    });

    it('should handle empty search query', () => {
      const result = filterSkills(mockSkills, '', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(mockSkills.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle skills with missing optional fields', () => {
      const incompleteSkill: Skill = {
        id: 'incomplete',
        name_en: 'Incomplete Skill'
      };
      
      const result = filterSkills([incompleteSkill], '', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(1);
    });

    it('should handle empty skills array', () => {
      const result = filterSkills([], '', 'all', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(0);
    });

    it('should handle combined search and filter', () => {
      const result = filterSkills(mockSkills, 'speed', 'A', 'all', 'all', 'all', 'all', 'all');
      expect(result).toHaveLength(1); // speed_star (rarity A, contains "speed")
    });

    it('should return correct count for result display', () => {
      const result = filterSkills(mockSkills, '', 'all', 'common', 'all', 'all', 'all', 'all');
      const commonSkills = mockSkills.filter(s => s.skill_type === 'common');
      expect(result).toHaveLength(commonSkills.length);
    });
  });

  describe('Skill Tags Display', () => {
    it('should generate correct phase tags', () => {
      const skill = mockSkills[4]; // final_push
      expect(inferPhase(skill)).toBe('final');
    });

    it('should generate correct distance tags', () => {
      const skill = mockSkills[5]; // long_runner
      expect(inferDistance(skill)).toBe('long');
    });

    it('should handle skills without specific tags', () => {
      const skill = mockSkills[0]; // speed_star - middle phase, no specific distance
      expect(inferPhase(skill)).toBe('middle');
      expect(inferDistance(skill)).toBe('all');
    });
  });
});
