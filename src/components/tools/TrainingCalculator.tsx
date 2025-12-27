import React, { useState, useMemo } from 'react';
import { TrendingUp, Activity, Zap, Heart, Brain, Target, Plus, Minus, RotateCcw, AlertTriangle } from 'lucide-react';

interface TrainingType {
  name: string;
  icon: JSX.Element;
  baseStats: {
    speed: number;
    stamina: number;
    power: number;
    guts: number;
    wisdom: number;
    skillPt: number;
  };
  failureRate: number;
}

interface SupportCard {
  name: string;
  type: 'speed' | 'stamina' | 'power' | 'guts' | 'wisdom' | 'friend';
  friendshipBonus: number;
  trainingBonus: number;
  specialtyBonus: { [key: string]: number };
}

interface TrainingBreakdown {
  baseStats: { [key: string]: number };
  statBonus: { [key: string]: number };
  rawGains: { [key: string]: number };
  caps: { [key: string]: boolean };
  multipliers: {
    trainingLevel: number;
    growth: number;
    mood: number;
    cardTraining: number;
    multiBonus: number;
    friendship: number;
    total: number;
  };
}

interface TrainingResult {
  stats: { [key: string]: number };
  total: number;
  energy: number;
  failureRisk: number;
  breakdown: TrainingBreakdown;
  warnings: string[];
}

// Base stats at Training Lv1 - these scale with training level
const TRAINING_TYPES: TrainingType[] = [
  {
    name: 'Speed',
    icon: <Zap className="w-4 h-4 text-blue-500" />,
    baseStats: { speed: 10, stamina: 0, power: 3, guts: 0, wisdom: 0, skillPt: 4 },
    failureRate: 3
  },
  {
    name: 'Stamina',
    icon: <Heart className="w-4 h-4 text-red-500" />,
    baseStats: { speed: 0, stamina: 10, power: 0, guts: 3, wisdom: 0, skillPt: 4 },
    failureRate: 5
  },
  {
    name: 'Power',
    icon: <Activity className="w-4 h-4 text-orange-500" />,
    baseStats: { speed: 2, stamina: 0, power: 10, guts: 0, wisdom: 0, skillPt: 4 },
    failureRate: 5
  },
  {
    name: 'Guts',
    icon: <Target className="w-4 h-4 text-purple-500" />,
    baseStats: { speed: 0, stamina: 2, power: 2, guts: 10, wisdom: 0, skillPt: 4 },
    failureRate: 8
  },
  {
    name: 'Wisdom',
    icon: <Brain className="w-4 h-4 text-green-500" />,
    baseStats: { speed: 2, stamina: 0, power: 0, guts: 0, wisdom: 10, skillPt: 8 },
    failureRate: 0 // Wisdom training restores energy, no failure
  }
];

// Training level multipliers (Lv1=1.0x, Lv5=2.0x approximately)
const TRAINING_LEVEL_MULTIPLIERS = {
  1: 1.0,
  2: 1.25,
  3: 1.5,
  4: 1.75,
  5: 2.0
};

// Multi-character training bonus (number of support cards on same training)
const MULTI_TRAINING_BONUS = {
  0: 1.0,   // No support cards
  1: 1.05,  // 1 card: +5%
  2: 1.10,  // 2 cards: +10%
  3: 1.15,  // 3 cards: +15%
  4: 1.20,  // 4 cards: +20%
  5: 1.25,  // 5 cards: +25%
  6: 1.30   // 6 cards (all): +30%
};

const PRESET_CARDS: SupportCard[] = [
  {
    name: 'Kitasan Black SSR',
    type: 'speed',
    friendshipBonus: 35,
    trainingBonus: 25,
    specialtyBonus: { speed: 3 }
  },
  {
    name: 'Super Creek SSR',
    type: 'stamina',
    friendshipBonus: 32,
    trainingBonus: 22,
    specialtyBonus: { stamina: 4 }
  },
  {
    name: 'Fine Motion SSR',
    type: 'power',
    friendshipBonus: 30,
    trainingBonus: 25,
    specialtyBonus: { power: 4 }
  },
  {
    name: 'Admire Vega SSR',
    type: 'wisdom',
    friendshipBonus: 28,
    trainingBonus: 20,
    specialtyBonus: { wisdom: 4, skillPt: 50 }
  }
];

export default function TrainingCalculator() {
  const [selectedTraining, setSelectedTraining] = useState<TrainingType>(TRAINING_TYPES[0]);
  const [supportCards, setSupportCards] = useState<SupportCard[]>([]);
  const [motivation, setMotivation] = useState<number>(3); // 1-5 scale
  const [energy, setEnergy] = useState<number>(100);
  const [bond, setBond] = useState<number>(50);
  const [trainingLevel, setTrainingLevel] = useState<number>(1);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const calculateTraining = useMemo((): TrainingResult => {
    const baseStats = { ...selectedTraining.baseStats };

    const statBonus: { [key: string]: number } = {
      speed: 0,
      stamina: 0,
      power: 0,
      guts: 0,
      wisdom: 0,
      skillPt: 0
    };

    supportCards.forEach(card => {
      Object.entries(card.specialtyBonus).forEach(([stat, bonus]) => {
        if (statBonus[stat] !== undefined) {
          statBonus[stat] += bonus;
        }
      });
    });

    // Character growth rate (depends on character's growth bonus, typically 0-30%)
    const growthRate = 0.2; // Average 20% growth bonus
    const growthMultiplier = 1 + growthRate;

    // Motivation multiplier (やる気)
    const moodMultiplier = motivation === 5 ? 1.2 :  // 絶好調
      motivation === 4 ? 1.1 :  // 好調
      motivation === 3 ? 1.0 :  // 普通
      motivation === 2 ? 0.9 :  // 不調
      0.8;                      // 絶不調

    // Training level multiplier (Lv1-5)
    const trainingLevelMultiplier = TRAINING_LEVEL_MULTIPLIERS[trainingLevel as keyof typeof TRAINING_LEVEL_MULTIPLIERS] || 1.0;
    
    // Support card training bonus (from card effects)
    const trainingBonusFromCards = supportCards.reduce((sum, card) => sum + card.trainingBonus, 0) / 100;
    const cardTrainingMultiplier = 1 + trainingBonusFromCards;

    // Multi-character training bonus (number of cards present)
    const multiBonus = MULTI_TRAINING_BONUS[supportCards.length as keyof typeof MULTI_TRAINING_BONUS] || 1.0;

    // Friendship training bonus (activated when bond >= 80)
    let friendshipBonus = 0;
    if (bond >= 80) {
      supportCards.forEach(card => {
        if (card.type === selectedTraining.name.toLowerCase() || card.type === 'friend') {
          friendshipBonus += card.friendshipBonus;
        }
      });
    }
    const friendshipMultiplier = 1 + (friendshipBonus / 100);

    const combinedMultiplier = trainingLevelMultiplier * growthMultiplier * moodMultiplier * cardTrainingMultiplier * multiBonus * friendshipMultiplier;

    const finalStats: { [key: string]: number } = {};
    const rawGains: { [key: string]: number } = {};
    const caps: { [key: string]: boolean } = {};
    let total = 0;

    Object.entries(baseStats).forEach(([stat, baseValue]) => {
      const basePlusBonus = baseValue + (statBonus[stat] || 0);
      const uncapped = basePlusBonus * combinedMultiplier;
      rawGains[stat] = uncapped;

      let calculated = uncapped;
      if (stat !== 'skillPt' && calculated > 100) {
        caps[stat] = true;
        calculated = 100;
      }

      finalStats[stat] = Math.floor(calculated);
      if (stat !== 'skillPt') {
        total += finalStats[stat];
      }
    });

    const energyCost = 10 + Math.floor(total / 10);

    // Improved failure rate calculation
    let failureRisk = selectedTraining.failureRate;
    // Bond reduces failure rate more significantly (up to -60% at max bond)
    const bondReduction = (bond / 100) * 0.6;
    failureRisk *= (1 - bondReduction);
    // Low energy increases failure rate more dramatically
    const energyPenalty = energy < 50 ? (50 - energy) / 25 : 0; // Up to 2x at 0 energy
    failureRisk *= (1 + energyPenalty);
    failureRisk = Math.max(0, Math.min(50, failureRisk));

    const warnings: string[] = [];
    if (energy < 30) warnings.push('Energy below 30% — resting reduces injury chance.');
    if (bond < 80) warnings.push('Bond below 80 — friendship bonuses inactive.');
    if (motivation <= 2) warnings.push('Low motivation — consider cheering items or races.');
    if (supportCards.length === 0) warnings.push('No support cards selected — gains will remain minimal.');
    if (failureRisk > 30) warnings.push('Failure risk exceeds 30% — training could fail.');

    return {
      stats: finalStats,
      total,
      energy: energyCost,
      failureRisk,
      breakdown: {
        baseStats,
        statBonus,
        rawGains,
        caps,
        multipliers: {
          trainingLevel: trainingLevelMultiplier,
          growth: growthMultiplier,
          mood: moodMultiplier,
          cardTraining: cardTrainingMultiplier,
          multiBonus: multiBonus,
          friendship: friendshipMultiplier,
          total: combinedMultiplier
        }
      },
      warnings
    };
  }, [selectedTraining, supportCards, motivation, energy, bond, trainingLevel]);

  const addSupportCard = (card: SupportCard) => {
    if (supportCards.length < 6) {
      setSupportCards([...supportCards, card]);
    }
  };

  const removeSupportCard = (index: number) => {
    setSupportCards(supportCards.filter((_, i) => i !== index));
  };

  const reset = () => {
    setSupportCards([]);
    setMotivation(3);
    setEnergy(100);
    setBond(50);
    setTrainingLevel(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Training Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {TRAINING_TYPES.map(type => (
                <button
                  key={type.name}
                  onClick={() => setSelectedTraining(type)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg transition ${
                    selectedTraining.name === type.name
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {type.icon}
                  <span className="text-sm font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Motivation</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setMotivation(level)}
                    className={`w-10 h-10 rounded-full transition ${
                      level <= motivation
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {'★'}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Energy: {energy}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Bond: {bond}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={bond}
                onChange={(e) => setBond(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Training Level: Lv.{trainingLevel}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTrainingLevel(Math.max(1, trainingLevel - 1))}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{trainingLevel}</span>
                <button
                  onClick={() => setTrainingLevel(Math.min(5, trainingLevel + 1))}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Support Cards ({supportCards.length}/6)</h3>
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {supportCards.map((card, index) => (
            <div key={index} className="bg-gray-50 rounded p-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{card.name}</span>
                <button
                  onClick={() => removeSupportCard(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              <div className="text-gray-500 mt-1">
                {card.type.toUpperCase()} +{card.trainingBonus}%
              </div>
            </div>
          ))}
        </div>
        
        {supportCards.length < 6 && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Add Preset Cards:</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_CARDS.map(card => (
                <button
                  key={card.name}
                  onClick={() => addSupportCard(card)}
                  className="text-xs bg-blue-50 hover:bg-blue-100 rounded p-2 text-left"
                >
                  <div className="font-medium">{card.name}</div>
                  <div className="text-gray-500">{card.type.toUpperCase()}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Training Results
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {Object.entries(calculateTraining.stats).map(([stat, value]) => (
            <div key={stat} className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase">{stat}</div>
              <div className="text-2xl font-bold text-blue-600">
                +{value}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 p-4 bg-white rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Total Stats</div>
            <div className="text-xl font-bold text-green-600">+{calculateTraining.total}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Energy Cost</div>
            <div className="text-xl font-bold text-orange-600">-{calculateTraining.energy}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Failure Risk</div>
            <div className="text-xl font-bold text-red-600">{calculateTraining.failureRisk.toFixed(1)}%</div>
          </div>
        </div>

        {calculateTraining.warnings.length > 0 && (
          <div className="mt-4 space-y-1">
            {calculateTraining.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => setShowBreakdown(prev => !prev)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showBreakdown ? 'Hide multiplier breakdown' : 'Show multiplier breakdown'}
          </button>

          {showBreakdown && (
            <div className="mt-3 bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Multipliers</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Training Lv{trainingLevel}</span>
                  <span>{calculateTraining.breakdown.multipliers.trainingLevel.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Character Growth</span>
                  <span>{calculateTraining.breakdown.multipliers.growth.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Motivation (やる気)</span>
                  <span>{calculateTraining.breakdown.multipliers.mood.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Card Training Bonus</span>
                  <span>{calculateTraining.breakdown.multipliers.cardTraining.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Multi-Training ({supportCards.length} cards)</span>
                  <span>{calculateTraining.breakdown.multipliers.multiBonus.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Friendship Training</span>
                  <span>{calculateTraining.breakdown.multipliers.friendship.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-blue-600 col-span-2 pt-2 border-t">
                  <span>Total Multiplier</span>
                  <span>{calculateTraining.breakdown.multipliers.total.toFixed(2)}×</span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Stat Bonuses</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
                {Object.entries(calculateTraining.breakdown.statBonus).map(([stat, bonus]) => (
                  <div key={stat} className="bg-gray-50 rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="uppercase text-gray-500">{stat}</span>
                      <span className="font-semibold">+{bonus}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>Raw Gain</span>
                      <span>{calculateTraining.breakdown.rawGains[stat].toFixed(1)}</span>
                    </div>
                    {calculateTraining.breakdown.caps[stat] && (
                      <div className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Cap reached at +100
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Training Formula & Tips</h4>
          <div className="text-xs text-gray-600 mb-2 font-mono bg-white p-2 rounded overflow-x-auto">
            Base × Lv({calculateTraining.breakdown.multipliers.trainingLevel.toFixed(2)}) × Growth({calculateTraining.breakdown.multipliers.growth.toFixed(2)}) × Mood({calculateTraining.breakdown.multipliers.mood.toFixed(2)}) × Cards({calculateTraining.breakdown.multipliers.cardTraining.toFixed(2)}) × Multi({calculateTraining.breakdown.multipliers.multiBonus.toFixed(2)}) × Friend({calculateTraining.breakdown.multipliers.friendship.toFixed(2)})
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Training Level:</strong> Lv1=1.0×, Lv2=1.25×, Lv3=1.5×, Lv4=1.75×, Lv5=2.0×</li>
            <li>• <strong>Motivation (やる気):</strong> 絶好調+20%, 好調+10%, 普通±0%, 不調-10%, 絶不調-20%</li>
            <li>• <strong>Friendship Training:</strong> Activates when Bond ≥ 80 (orange gauge)</li>
            <li>• <strong>Multi-Training:</strong> +5% per card present (up to +30% with 6 cards)</li>
            <li>• <strong>Cap:</strong> +100 max per stat (reduces to +50 if stat &gt; 1200)</li>
            <li>• <strong>Wisdom Training:</strong> Restores energy instead of consuming it</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
