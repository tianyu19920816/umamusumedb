import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Star, TrendingUp, Users, Sparkles, AlertTriangle, Check, Lock, Unlock } from 'lucide-react';
import PlaceholderImage from '../PlaceholderImage';
import type { SupportCard } from '@/types';

interface DeckSlot {
  card: SupportCard | null;
  position: number;
}

interface DeckAnalysis {
  totalBonus: { [key: string]: number };
  typeBalance: { [key: string]: number };
  recommendations: string[];
  missingTypes: string[];
  duplicateCards: string[];
  rarityCount: { SSR: number; SR: number; R: number };
  score: number;
}

const TYPE_COLORS = {
  speed: 'blue',
  stamina: 'red', 
  power: 'orange',
  guts: 'purple',
  wisdom: 'green',
  friend: 'pink'
};

const getTypeColorClasses = (type: string) => {
  switch(type) {
    case 'speed': return 'bg-blue-500 text-blue-600';
    case 'stamina': return 'bg-red-500 text-red-600';
    case 'power': return 'bg-orange-500 text-orange-600';
    case 'guts': return 'bg-purple-500 text-purple-600';
    case 'wisdom': return 'bg-green-500 text-green-600';
    case 'friend': return 'bg-pink-500 text-pink-600';
    default: return 'bg-gray-500 text-gray-600';
  }
};

const getRarityColorClasses = (rarity: string) => {
  switch(rarity) {
    case 'SSR': return 'text-yellow-600 bg-yellow-50';
    case 'SR': return 'text-purple-600 bg-purple-50';
    case 'R': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const DECK_TEMPLATES = [
  {
    name: 'Speed Focus',
    description: 'Maximize speed training',
    composition: { speed: 3, power: 1, wisdom: 1, friend: 1 }
  },
  {
    name: 'Balanced',
    description: 'Well-rounded training',
    composition: { speed: 1, stamina: 1, power: 1, guts: 1, wisdom: 1, friend: 1 }
  },
  {
    name: 'Long Distance',
    description: 'Stamina-heavy build',
    composition: { stamina: 3, speed: 1, wisdom: 1, friend: 1 }
  },
  {
    name: 'Sprint Power',
    description: 'Sprint race focused',
    composition: { speed: 2, power: 2, wisdom: 1, friend: 1 }
  }
];

export default function SupportDeckBuilder() {
  const [availableCards, setAvailableCards] = useState<SupportCard[]>([]);
  const [deck, setDeck] = useState<DeckSlot[]>(
    Array.from({ length: 6 }, (_, i) => ({ card: null, position: i }))
  );
  const [lockedSlots, setLockedSlots] = useState<boolean[]>(
    Array.from({ length: 6 }, () => false)
  );
  const [selectedTemplate, setSelectedTemplate] = useState<typeof DECK_TEMPLATES[0] | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showAnalysis, setShowAnalysis] = useState(true);

  useEffect(() => {
    fetch('/data/support-cards.json')
      .then(res => res.json())
      .then(data => {
        const parsed = data.map((card: any) => ({
          ...card,
          effects: typeof card.effects === 'string' ? JSON.parse(card.effects) : card.effects,
          skills: typeof card.skills === 'string' ? JSON.parse(card.skills) : card.skills
        }));
        setAvailableCards(parsed);
      })
      .catch(console.error);
  }, []);

  const filteredCards = useMemo(() => {
    return availableCards.filter(card => {
      if (filterType !== 'all' && card.type !== filterType) return false;
      if (filterRarity !== 'all' && card.rarity !== filterRarity) return false;
      return !deck.some(slot => slot.card?.id === card.id);
    });
  }, [availableCards, filterType, filterRarity, deck]);

  const analyzeDeck = useMemo((): DeckAnalysis => {
    const analysis: DeckAnalysis = {
      totalBonus: {
        friendship: 0,
        training: 0,
        motivation: 0,
        skillPt: 0
      },
      typeBalance: {
        speed: 0,
        stamina: 0,
        power: 0,
        guts: 0,
        wisdom: 0,
        friend: 0
      },
      recommendations: [],
      missingTypes: [],
      duplicateCards: [],
      rarityCount: { SSR: 0, SR: 0, R: 0 },
      score: 0
    };

    const duplicateCounter = new Map<string, number>();

    deck.forEach(slot => {
      if (!slot.card) return;

      const card = slot.card;
      analysis.typeBalance[card.type]++;
      analysis.rarityCount[card.rarity] = (analysis.rarityCount[card.rarity] || 0) + 1;
      duplicateCounter.set(card.id, (duplicateCounter.get(card.id) || 0) + 1);

      const effects = card.effects;
      if (effects) {
        if (effects.friendship_bonus) {
          const bonus = typeof effects.friendship_bonus === 'object'
            ? (effects.friendship_bonus.lv50 || effects.friendship_bonus.lv45 || effects.friendship_bonus.lv1)
            : effects.friendship_bonus;
          analysis.totalBonus.friendship += Number(bonus) || 0;
        }
        if (effects.training_bonus) {
          const bonus = typeof effects.training_bonus === 'object'
            ? (effects.training_bonus.lv50 || effects.training_bonus.lv45 || effects.training_bonus.lv1)
            : effects.training_bonus;
          analysis.totalBonus.training += Number(bonus) || 0;
        }
        if (effects.motivation_bonus) {
          const bonus = typeof effects.motivation_bonus === 'object'
            ? (effects.motivation_bonus.lv50 || effects.motivation_bonus.lv45 || effects.motivation_bonus.lv1)
            : effects.motivation_bonus;
          analysis.totalBonus.motivation += Number(bonus) || 0;
        }
        if (effects.skill_pt_bonus) {
          const bonus = typeof effects.skill_pt_bonus === 'object'
            ? (effects.skill_pt_bonus.lv50 || effects.skill_pt_bonus.lv45 || effects.skill_pt_bonus.lv1)
            : effects.skill_pt_bonus;
          analysis.totalBonus.skillPt += Number(bonus) || 0;
        }
      }
    });

    const filledSlots = deck.filter(s => s.card).length;

    if (filledSlots < 6) {
      analysis.recommendations.push(`Add ${6 - filledSlots} more cards to complete your deck`);
    }

    analysis.missingTypes = Object.entries(analysis.typeBalance)
      .filter(([, count]) => count === 0)
      .map(([type]) => type);

    analysis.duplicateCards = Array.from(duplicateCounter.entries())
      .filter(([, count]) => count > 1)
      .map(([cardId]) => deck.find(slot => slot.card?.id === cardId)?.card?.name_en || cardId);

    const typeCount = Object.values(analysis.typeBalance).filter(v => v > 0).length;
    if (typeCount < 3 && filledSlots >= 4) {
      analysis.recommendations.push('Consider diversifying card types for better coverage');
    }

    if (analysis.typeBalance.friend === 0 && filledSlots >= 5) {
      analysis.recommendations.push('Add a Friend card for event bonuses');
    }

    const maxType = Math.max(...Object.values(analysis.typeBalance));
    if (maxType >= 4) {
      analysis.recommendations.push('Too many cards of the same type may limit training options');
    }

    if (analysis.totalBonus.friendship < 100 && filledSlots === 6) {
      analysis.recommendations.push('Total friendship bonus is low - consider higher rarity cards');
    }

    if (analysis.missingTypes.includes('speed')) {
      analysis.recommendations.push('No Speed cards detected — consider adding at least one for consistent stat gains');
    }
    if (analysis.missingTypes.includes('stamina')) {
      analysis.recommendations.push('No Stamina cards detected — long training may struggle without stamina support');
    }
    if (analysis.rarityCount.SSR < 2 && filledSlots === 6) {
      analysis.recommendations.push('Less than two SSR cards — aim for more high-rarity support if possible');
    }
    if (analysis.duplicateCards.length > 0) {
      analysis.recommendations.push('Duplicate support cards detected — duplicates do not stack');
    }

    analysis.score = Math.round(
      (analysis.totalBonus.friendship + analysis.totalBonus.training) * 0.3 +
      typeCount * 10 +
      (6 - Math.abs(3 - maxType)) * 5 +
      (analysis.typeBalance.friend > 0 ? 10 : 0)
    );

    return analysis;
  }, [deck]);

  const addCardToDeck = (card: SupportCard, position: number) => {
    if (lockedSlots[position]) return;
    const newDeck = [...deck];
    newDeck[position] = { card, position };
    setDeck(newDeck);
  };

  const removeCardFromDeck = (position: number) => {
    if (lockedSlots[position]) return;
    const newDeck = [...deck];
    newDeck[position] = { card: null, position };
    setDeck(newDeck);
  };

  const toggleLock = (position: number) => {
    setLockedSlots(prev => {
      const next = [...prev];
      next[position] = !next[position];
      return next;
    });
  };

  const applyTemplate = (template: typeof DECK_TEMPLATES[0]) => {
    setSelectedTemplate(template);

    const retainedDeck = deck.map((slot, idx) =>
      lockedSlots[idx] ? slot : { card: null, position: idx }
    );

    const occupiedIds = new Set(
      retainedDeck
        .map(slot => (slot.card ? slot.card.id : null))
        .filter(Boolean) as string[]
    );

    const fillNextSlot = (card: SupportCard) => {
      const targetIndex = retainedDeck.findIndex(
        (slot, idx) => !lockedSlots[idx] && !slot.card
      );
      if (targetIndex === -1) return;
      retainedDeck[targetIndex] = { card, position: targetIndex };
      occupiedIds.add(card.id);
    };

    Object.entries(template.composition).forEach(([type, count]) => {
      const cardsOfType = availableCards
        .filter(card => card.type === type)
        .sort((a, b) => {
          const rarityOrder = { SSR: 3, SR: 2, R: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        });

      for (const card of cardsOfType) {
        if (occupiedIds.has(card.id)) continue;
        fillNextSlot(card);
        if (--count <= 0) break;
      }
    });

    setDeck(retainedDeck);
  };

  const clearDeck = () => {
    setDeck(Array.from({ length: 6 }, (_, i) => ({ card: null, position: i })));
    setLockedSlots(Array.from({ length: 6 }, () => false));
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Current Deck
        </h2>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {deck.map((slot, index) => (
            <div
              key={index}
              className="aspect-[3/4] bg-white rounded-lg border-2 border-dashed border-gray-300 relative group cursor-pointer"
              onClick={() => {
                if (!slot.card) {
                  // Scroll to available cards section
                  document.getElementById('available-cards')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(index);
                }}
                className={`absolute top-2 left-2 z-30 p-1 rounded-full transition ${
                  lockedSlots[index] ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-600'
                }`}
                aria-label={lockedSlots[index] ? 'Unlock slot' : 'Lock slot'}
              >
                {lockedSlots[index] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              {slot.card ? (
                <>
                  <div className={`absolute top-0 left-0 right-0 h-1 ${getTypeColorClasses(slot.card.type).split(' ')[0]}`} />
                  <div className="h-full flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0">
                      {slot.card.image_url ? (
                        <img 
                          src={slot.card.image_url} 
                          alt={slot.card.name_en}
                          className="w-full h-full object-cover opacity-90"
                        />
                      ) : (
                        <PlaceholderImage
                          type="card"
                          name={slot.card.name_en}
                          rarity={slot.card.rarity}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    <div className="relative z-10 p-2 h-full flex flex-col bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <div className="text-xs font-bold text-white uppercase drop-shadow">
                        {slot.card.type}
                      </div>
                      <div className="text-xs font-semibold mt-1 line-clamp-2 text-white drop-shadow">
                        {slot.card.name_en}
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getRarityColorClasses(slot.card.rarity)}`}>
                            {slot.card.rarity}
                         </span>
                         <button
                            onClick={() => removeCardFromDeck(index)}
                            className={`transition rounded-full p-1 ${
                              lockedSlots[index]
                                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-red-500 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition">
                  <Plus className="w-8 h-8" />
                  <span className="text-xs mt-1">Click to add</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {DECK_TEMPLATES.map(template => (
            <button
              key={template.name}
              onClick={() => applyTemplate(template)}
              className={`px-3 py-1 rounded text-sm transition ${
                selectedTemplate?.name === template.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {template.name}
            </button>
          ))}
          <button
            onClick={clearDeck}
            className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300 transition"
          >
            Clear Deck
          </button>
        </div>
      </div>

      {showAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Deck Analysis
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Total Bonuses</h4>
              <div className="space-y-2">
                {Object.entries(analyzeDeck.totalBonus).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-bold">+{value}%</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                  <span className="text-sm text-gray-600">SSR / SR / R</span>
                  <span className="font-bold text-purple-600">
                    {analyzeDeck.rarityCount.SSR}/{analyzeDeck.rarityCount.SR}/{analyzeDeck.rarityCount.R}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Type Distribution</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(analyzeDeck.typeBalance).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getTypeColorClasses(type).split(' ')[0]}`}
                        style={{ width: `${(count / 6) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs mt-1 capitalize">{type}: {count}</div>
                  </div>
                ))}
              </div>
              {analyzeDeck.missingTypes.length > 0 && (
                <div className="mt-3 text-xs text-orange-600 flex items-start gap-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Missing types: {analyzeDeck.missingTypes.join(', ')}</span>
                </div>
              )}
              {analyzeDeck.duplicateCards.length > 0 && (
                <div className="mt-2 text-xs text-red-600 flex items-start gap-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Duplicates: {analyzeDeck.duplicateCards.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Deck Score</span>
              <span className="text-2xl font-bold text-blue-600">{analyzeDeck.score}/100</span>
            </div>
            {analyzeDeck.recommendations.length > 0 && (
              <div className="space-y-1">
                {analyzeDeck.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
            {analyzeDeck.recommendations.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>Deck composition looks balanced and ready for training runs.</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div id="available-cards" className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Available Cards</h3>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              <option value="speed">Speed</option>
              <option value="stamina">Stamina</option>
              <option value="power">Power</option>
              <option value="guts">Guts</option>
              <option value="wisdom">Wisdom</option>
              <option value="friend">Friend</option>
            </select>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Rarities</option>
              <option value="SSR">SSR</option>
              <option value="SR">SR</option>
              <option value="R">R</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
          {filteredCards.map(card => {
            const emptySlotIndex = deck.findIndex((s, idx) => !s.card && !lockedSlots[idx]);
            return (
              <button
                key={card.id}
                onClick={() => {
                  if (emptySlotIndex !== -1) {
                    addCardToDeck(card, emptySlotIndex);
                  }
                }}
                disabled={emptySlotIndex === -1}
                className={`aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden text-left hover:shadow-lg transition relative ${
                  emptySlotIndex === -1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${getTypeColorClasses(card.type).split(' ')[0]}`} />
                <div className="h-full relative overflow-hidden">
                  <div className="absolute inset-0">
                    {card.image_url ? (
                      <img 
                        src={card.image_url} 
                        alt={card.name_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PlaceholderImage
                        type="card"
                        name={card.name_en}
                        rarity={card.rarity}
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <div className="relative z-10 p-2 h-full flex flex-col bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="text-xs font-bold text-white uppercase drop-shadow">
                      {card.type}
                    </div>
                    <div className="text-xs font-semibold mt-1 line-clamp-2 text-white drop-shadow">
                      {card.name_en}
                    </div>
                    <div className="mt-auto">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getRarityColorClasses(card.rarity)}`}>
                        {card.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
