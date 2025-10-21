import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Star, TrendingUp, Package, AlertTriangle, Info } from 'lucide-react';
import type { Skill } from '@/types';

interface SkillCombo {
  name: string;
  skills: string[];
  description: string;
  strategy: string;
  effectiveness: number;
}

const SKILL_COMBOS: SkillCombo[] = [
  {
    name: 'Escape Master',
    skills: ['escape_artist', 'leading_pride', 'transcendent_flash', 'turbo_engine'],
    description: 'Dominate from the front with unbeatable escape speed',
    strategy: 'escape',
    effectiveness: 95
  },
  {
    name: 'Chase Assassin',
    skills: ['chase_down', 'power_sprint', 'final_push', 'shadow_roll'],
    description: 'Explosive finish from behind position',
    strategy: 'chase',
    effectiveness: 90
  },
  {
    name: 'Stamina Monster',
    skills: ['stamina_keep', 'stamina_save', 'long_runner', 'blue_rose_prayer'],
    description: 'Never run out of stamina in long distance races',
    strategy: 'long',
    effectiveness: 88
  },
  {
    name: 'Sprint Specialist',
    skills: ['sprint_turbo', 'bakushin_burst', 'shuttle_burst', 'speed_star'],
    description: 'Maximum speed for short distance races',
    strategy: 'sprint',
    effectiveness: 92
  },
  {
    name: 'Recovery Master',
    skills: ['straight_line_recovery', 'pace_control', 'steady_pace', 'stamina_keep'],
    description: 'Efficient stamina management throughout the race',
    strategy: 'balanced',
    effectiveness: 85
  },
  {
    name: 'Acceleration King',
    skills: ['acceleration', 'curve_specialist', 'power_sprint', 'scarlet_impact'],
    description: 'Superior acceleration at key moments',
    strategy: 'power',
    effectiveness: 87
  },
  {
    name: 'Weather Warrior',
    skills: ['rain_master', 'wonder_charge', 'dirt_master', 'condors_flight'],
    description: 'Excel in adverse conditions',
    strategy: 'special',
    effectiveness: 83
  },
  {
    name: 'Comeback Kid',
    skills: ['never_give_up', 'comeback', 'emperors_dance', 'victory_ticket'],
    description: 'Strong recovery when falling behind',
    strategy: 'guts',
    effectiveness: 86
  }
];

const SKILL_COSTS = {
  'SS': 500,
  'S': 360,
  'A': 250,
  'B': 180,
  'C': 120,
  'unique': 600,
  'common': 200,
  'training': 150
};

const TRIGGER_FILTERS = [
  { value: 'all', label: 'All Conditions' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'mile', label: 'Mile' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'corner', label: 'Corners' },
  { value: 'straight', label: 'Straight' },
  { value: 'rain', label: 'Rainy Weather' }
];

export default function SkillBuilder() {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterSkillType, setFilterSkillType] = useState<string>('all');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [skillPointBudget, setSkillPointBudget] = useState<number>(2000);
  const [selectedCombo, setSelectedCombo] = useState<SkillCombo | null>(null);

  useEffect(() => {
    fetch('/data/skills.json')
      .then(res => res.json())
      .then(data => {
        const skillsWithCost = data.map((skill: any) => ({
          ...skill,
          cost: SKILL_COSTS[skill.rarity as keyof typeof SKILL_COSTS] || 200
        }));
        setAvailableSkills(skillsWithCost);
      })
      .catch(console.error);
  }, []);

  const skillTypes = useMemo(() => {
    const types = new Set<string>();
    availableSkills.forEach(skill => {
      if (skill.skill_type) {
        types.add(skill.skill_type);
      }
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [availableSkills]);

  const filteredSkills = useMemo(() => {
    return availableSkills.filter(skill => {
      if (filterRarity !== 'all' && skill.rarity !== filterRarity) return false;
      if (filterSkillType !== 'all') {
        if (!skill.skill_type || skill.skill_type.toLowerCase() !== filterSkillType.toLowerCase()) {
          return false;
        }
      }

      const effectText = `${skill.effect || ''} ${skill.description_en || ''}`.toLowerCase();
      const triggerText = `${skill.trigger_condition || ''}`.toLowerCase();
      const combinedText = `${effectText} ${triggerText}`;

      if (filterStrategy !== 'all') {
        if (filterStrategy === 'speed' && !combinedText.includes('speed')) return false;
        if (filterStrategy === 'stamina' && !combinedText.includes('stamina')) return false;
        if (filterStrategy === 'power' && !combinedText.includes('power')) return false;
        if (filterStrategy === 'guts' && !combinedText.includes('guts')) return false;
      }

      if (filterTrigger !== 'all' && !combinedText.includes(filterTrigger)) {
        return false;
      }

      if (searchTerm) {
        const haystack = `${skill.name_en} ${skill.name_jp || ''} ${combinedText}`.toLowerCase();
        if (!haystack.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }

      return !selectedSkills.some(s => s.id === skill.id);
    });
  }, [
    availableSkills,
    filterRarity,
    filterSkillType,
    filterStrategy,
    filterTrigger,
    searchTerm,
    selectedSkills
  ]);

  const totalCost = useMemo(() => {
    return selectedSkills.reduce((sum, skill) => sum + (skill.cost || 0), 0);
  }, [selectedSkills]);

  const selectedSummary = useMemo(() => {
    const rarityCount = selectedSkills.reduce<Record<string, number>>((acc, skill) => {
      acc[skill.rarity || 'unknown'] = (acc[skill.rarity || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const typeCount = selectedSkills.reduce<Record<string, number>>((acc, skill) => {
      const type = skill.skill_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      rarityCount,
      typeEntries: Object.entries(typeCount)
    };
  }, [selectedSkills]);

  const addSkill = (skill: Skill) => {
    if (totalCost + (skill.cost || 0) <= skillPointBudget) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
  };

  const applyCombo = (combo: SkillCombo) => {
    const comboSkills = availableSkills.filter(skill => 
      combo.skills.includes(skill.id)
    );
    setSelectedSkills(comboSkills);
    setSelectedCombo(combo);
  };

  const clearAll = () => {
    setSelectedSkills([]);
    setSelectedCombo(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SS': return 'text-yellow-600 bg-yellow-50';
      case 'S': return 'text-purple-600 bg-purple-50';
      case 'A': return 'text-blue-600 bg-blue-50';
      case 'B': return 'text-green-600 bg-green-50';
      case 'unique': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'escape': return '🏃';
      case 'chase': return '🎯';
      case 'sprint': return '⚡';
      case 'long': return '🏔️';
      case 'power': return '💪';
      case 'guts': return '🔥';
      case 'special': return '🌟';
      default: return '⚖️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Recommended Combos
          </h2>
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SKILL_COMBOS.map(combo => (
            <button
              key={combo.name}
              onClick={() => applyCombo(combo)}
              className={`p-3 bg-white rounded-lg hover:shadow-lg transition text-left ${
                selectedCombo?.name === combo.name ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{getStrategyIcon(combo.strategy)}</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full"
                      style={{ width: `${combo.effectiveness}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold">{combo.effectiveness}%</span>
                </div>
              </div>
              <div className="font-semibold text-sm">{combo.name}</div>
              <div className="text-xs text-gray-600 mt-1">{combo.description}</div>
              <div className="text-xs text-purple-600 mt-2">{combo.skills.length} skills</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Selected Skills</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Budget:</span>
              <input
                type="number"
                value={skillPointBudget}
                onChange={(e) => setSkillPointBudget(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border rounded text-sm"
                min="0"
                max="5000"
                step="100"
              />
              <span className="text-sm font-bold text-blue-600">
                {totalCost} / {skillPointBudget}
              </span>
            </div>
          </div>

          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
              <span className="px-2 py-1 bg-gray-100 rounded">
                Rarity: {Object.entries(selectedSummary.rarityCount).length > 0
                  ? Object.entries(selectedSummary.rarityCount).map(([rarity, count]) => `${rarity}×${count}`).join(', ')
                  : 'None'}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded">
                Categories: {selectedSummary.typeEntries.length > 0
                  ? selectedSummary.typeEntries.map(([type, count]) => `${type}×${count}`).join(', ')
                  : 'None'}
              </span>
            </div>
          )}
          
          {totalCost > skillPointBudget && (
            <div className="mb-3 p-2 bg-red-50 rounded flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              Over budget by {totalCost - skillPointBudget} skill points
            </div>
          )}
          
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {selectedSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Select skills from the list or choose a combo
              </div>
            ) : (
              selectedSkills.map(skill => (
                <div key={skill.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="font-medium text-sm">{skill.name_en}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getRarityColor(skill.rarity)}`}>
                        {skill.rarity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{skill.effect}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{skill.cost}pt</span>
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {selectedSkills.length > 0 && (
            <div className="p-3 bg-blue-50 rounded">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Build Analysis
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Total Skills:</span>
                  <span className="font-bold ml-1">{selectedSkills.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Unique Skills:</span>
                  <span className="font-bold ml-1">
                    {selectedSkills.filter(s => s.skill_type === 'unique').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-bold ml-1">
                    {Math.round((totalCost / skillPointBudget) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Points Left:</span>
                  <span className="font-bold ml-1">{Math.max(0, skillPointBudget - totalCost)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Available Skills</h3>
            <div className="flex flex-wrap gap-2 justify-end">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or effect"
                className="text-sm border rounded px-2 py-1 w-44"
              />
              <select
                value={filterSkillType}
                onChange={(e) => setFilterSkillType(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Skill Types</option>
                {skillTypes.map(type => (
                  <option key={type} value={type.toLowerCase()}>{type}</option>
                ))}
              </select>
              <select
                value={filterStrategy}
                onChange={(e) => setFilterStrategy(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Stats</option>
                <option value="speed">Speed</option>
                <option value="stamina">Stamina</option>
                <option value="power">Power</option>
                <option value="guts">Guts</option>
              </select>
              <select
                value={filterTrigger}
                onChange={(e) => setFilterTrigger(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                {TRIGGER_FILTERS.map(filter => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Rarities</option>
                <option value="SS">SS</option>
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="unique">Unique</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredSkills.map(skill => (
              <button
                key={skill.id}
                onClick={() => addSkill(skill)}
                disabled={totalCost + (skill.cost || 0) > skillPointBudget}
                className={`w-full text-left p-2 rounded hover:bg-gray-50 transition ${
                  totalCost + (skill.cost || 0) > skillPointBudget ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="font-medium text-sm">{skill.name_en}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getRarityColor(skill.rarity)}`}>
                        {skill.rarity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{skill.effect}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-500">{skill.cost}pt</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-yellow-600" />
          Skill Building Tips
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium mb-1">Priority Guidelines:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• Unique skills first (character identity)</li>
              <li>• Race strategy skills (escape/chase/etc)</li>
              <li>• Recovery skills for long distance</li>
              <li>• Acceleration for final spurt</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Budget Management:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• 2000-2500 pts: Standard build</li>
              <li>• 2500-3000 pts: Advanced build</li>
              <li>• 3000+ pts: Maxed build</li>
              <li>• Save points for crucial skills</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
