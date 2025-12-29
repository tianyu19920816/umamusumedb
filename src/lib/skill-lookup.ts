import type { Skill } from '@/types';

export function normalizeSkillKey(input: string): string {
  return String(input ?? '')
    .trim()
    .toLowerCase();
}

export function createSkillIndex(skills: Skill[]): Map<string, Skill> {
  const index = new Map<string, Skill>();

  for (const skill of skills) {
    if (!skill) continue;
    if (skill.id) index.set(normalizeSkillKey(skill.id), skill);
    if (skill.name_en) index.set(normalizeSkillKey(skill.name_en), skill);
    if (skill.name_jp) index.set(normalizeSkillKey(skill.name_jp), skill);
  }

  return index;
}

export function findSkillIdByName(index: Map<string, Skill>, name: string): string | null {
  const key = normalizeSkillKey(name);
  const found = index.get(key);
  return found?.id ?? null;
}






