export type StatKey = 'speed' | 'stamina' | 'power' | 'guts' | 'wisdom';

export interface CharacterStats {
  speed: number;
  stamina: number;
  power: number;
  guts: number;
  wisdom: number;
}

export interface CharacterGrowthRates {
  speed?: number;
  stamina?: number;
  power?: number;
  guts?: number;
  wisdom?: number;
}

export interface CharacterDistanceAptitudes {
  sprint: string;
  mile: string;
  medium: string;
  long: string;
}

export interface CharacterStrategyAptitudes {
  escape: string;
  lead: string;
  between: string;
  chase: string;
}

export interface CharacterSurfaceAptitudes {
  turf: string;
  dirt: string;
}

export type CharacterAptitudes = CharacterSurfaceAptitudes &
  CharacterDistanceAptitudes &
  CharacterStrategyAptitudes;

export interface UniqueSkill {
  name_en: string;
  name_jp?: string;
  effect?: string;
}

export interface CharacterRecord {
  id: string;
  name_en: string;
  name_jp: string;
  rarity: number;
  initial_stats?: CharacterStats | string | null;
  max_stats?: CharacterStats | string | null;
  growth_rates?: CharacterGrowthRates | string | null;
  aptitudes?: CharacterAptitudes | string | null;
  unique_skill?: UniqueSkill | string | null;
  awakening_skills?: string[] | string | null;
  attributes?: CharacterStats | string | null;
  skills?: string[] | string | null;
  image_url?: string;
  birthday?: string | null;
  cv?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface Character extends Omit<CharacterRecord, 'initial_stats' | 'max_stats' | 'growth_rates' | 'aptitudes' | 'unique_skill' | 'awakening_skills' | 'attributes' | 'skills'> {
  initial_stats?: CharacterStats;
  max_stats?: CharacterStats;
  growth_rates?: CharacterGrowthRates;
  aptitudes?: CharacterAptitudes;
  unique_skill?: UniqueSkill | null;
  awakening_skills?: string[];
  attributes?: CharacterStats;
  skills?: string[];
}

export interface LevelValueMap {
  lv1?: number;
  lv25?: number;
  lv30?: number;
  lv35?: number;
  lv40?: number;
  lv45?: number;
  lv50?: number;
}

export type SupportCardEffectValue = number | LevelValueMap;

export interface SupportCardEffects {
  [key: string]: SupportCardEffectValue;
}

export interface SupportCardRecord {
  id: string;
  name_en: string;
  name_jp: string;
  character?: string;
  type: 'speed' | 'stamina' | 'power' | 'guts' | 'wisdom' | 'friend';
  rarity: 'R' | 'SR' | 'SSR';
  effects?: SupportCardEffects | string | null;
  skills?: string[] | string | null;
  events?: string[] | string | null;
  image_url?: string;
  release_date?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface SupportCard extends Omit<SupportCardRecord, 'effects' | 'skills' | 'events'> {
  effects?: SupportCardEffects;
  skills?: string[];
  events?: string[];
}

export interface TierListEntry {
  id: number;
  item_type: 'character' | 'support_card';
  item_id: string;
  category: string;
  tier: string;
  votes: number;
  updated_at?: string;
  item_name?: string;
  item_name_jp?: string;
  item_rarity?: number | string;
  item_image?: string;
}

export interface Skill {
  id: string;
  name_en: string;
  name_jp?: string;
  description_en?: string;
  description_jp?: string;
  effect?: string;
  trigger_condition?: string;
  duration?: string;
  cooldown?: string;
  activation_rate?: string;
  skill_type?: string;
  rarity?: string;
  cost?: number;
  icon_url?: string;
  created_at?: string;
  [key: string]: unknown;
}
