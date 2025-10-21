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
    growth: number;
    mood: number;
    training: number;
    support: number;
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

const TRAINING_TYPES: TrainingType[] = [
  {
    name: 'Speed',
    icon: <Zap className="w-4 h-4 text-blue-500" />,
    baseStats: { speed: 10, stamina: 0, power: 2, guts: 0, wisdom: 0, skillPt: 4 },
    failureRate: 5
  },
  {
    name: 'Stamina',
    icon: <Heart className="w-4 h-4 text-red-500" />,
    baseStats: { speed: 0, stamina: 10, power: 0, guts: 3, wisdom: 0, skillPt: 4 },
    failureRate: 10
  },
  {
    name: 'Power',
    icon: <Activity className="w-4 h-4 text-orange-500" />,
    baseStats: { speed: 2, stamina: 0, power: 10, guts: 0, wisdom: 0, skillPt: 4 },
    failureRate: 10
  },
  {
    name: 'Guts',
    icon: <Target className="w-4 h-4 text-purple-500" />,
    baseStats: { speed: 0, stamina: 2, power: 2, guts: 10, wisdom: 0, skillPt: 4 },
    failureRate: 15
  },
  {
    name: 'Wisdom',
    icon: <Brain className="w-4 h-4 text-green-500" />,
    baseStats: { speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 10, skillPt: 8 },
    failureRate: 5
  }
];

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

    const growthRate = 0.2;
    const growthMultiplier = 1 + growthRate;

    const moodMultiplier = motivation === 5 ? 1.2 :
      motivation === 4 ? 1.1 :
      motivation === 3 ? 1.0 :
      motivation === 2 ? 0.9 : 0.8;

    const trainingEffectiveness = trainingLevel * 0.05;
    const trainingBonusFromCards = supportCards.reduce((sum, card) => sum + card.trainingBonus, 0) / 100;
    const trainingMultiplier = 1 + trainingEffectiveness + trainingBonusFromCards;

    const supportMultiplier = 1 + supportCards.length * 0.05;

    let friendshipMultiplier = 1;
    if (bond >= 80) {
      supportCards.forEach(card => {
        if (card.type === selectedTraining.name.toLowerCase() || card.type === 'friend') {
          friendshipMultiplier *= (1 + card.friendshipBonus / 100);
        }
      });
    }

    const combinedMultiplier = growthMultiplier * moodMultiplier * trainingMultiplier * supportMultiplier * friendshipMultiplier;

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

    let failureRisk = selectedTraining.failureRate;
    failureRisk *= 1 - bond / 200;
    failureRisk *= 1 + (100 - energy) / 200;
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
          growth: growthMultiplier,
          mood: moodMultiplier,
          training: trainingMultiplier,
          support: supportMultiplier,
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
                  <span>Growth</span>
                  <span>{calculateTraining.breakdown.multipliers.growth.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mood</span>
                  <span>{calculateTraining.breakdown.multipliers.mood.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Training</span>
                  <span>{calculateTraining.breakdown.multipliers.training.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Support Count</span>
                  <span>{calculateTraining.breakdown.multipliers.support.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Friendship</span>
                  <span>{calculateTraining.breakdown.multipliers.friendship.toFixed(2)}×</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-blue-600">
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
          <div className="text-xs text-gray-600 mb-2 font-mono bg-white p-2 rounded">
            (Base + Stat Bonus) × {calculateTraining.breakdown.multipliers.growth.toFixed(2)} × {calculateTraining.breakdown.multipliers.mood.toFixed(2)} × {calculateTraining.breakdown.multipliers.training.toFixed(2)} × {calculateTraining.breakdown.multipliers.support.toFixed(2)} × {calculateTraining.breakdown.multipliers.friendship.toFixed(2)}
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Motivation: Great★★★★★ +20%, Good★★★★ +10%, Normal★★★ 0%, Bad★★ -10%, Awful★ -20%</li>
            <li>• Friendship Training activates when Bond ≥ 80 (orange gauge)</li>
            <li>• Each support card adds +5% to all gains</li>
            <li>• Training cap: +100 max per session (halved to +50 if stat &gt; 1200)</li>
            <li>• Low energy increases failure risk - rest when below 30%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
