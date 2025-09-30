import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Star, TrendingUp, Users, Sparkles, AlertTriangle, Check, Image } from 'lucide-react';
import PlaceholderImage from '../PlaceholderImage';

interface SupportCard {
  id: string;
  name_en: string;
  name_jp: string;
  type: 'speed' | 'stamina' | 'power' | 'guts' | 'wisdom' | 'friend';
  rarity: 'SSR' | 'SR' | 'R';
  effects: any;
  skills: string[];
  image_url?: string;
}

interface DeckSlot {
  card: SupportCard | null;
  position: number;
}

interface DeckAnalysis {
  totalBonus: { [key: string]: number };
  typeBalance: { [key: string]: number };
  recommendations: string[];
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
      score: 0
    };

    deck.forEach(slot => {
      if (!slot.card) return;
      
      analysis.typeBalance[slot.card.type]++;
      
      if (slot.card.effects) {
        const effects = slot.card.effects;
        if (effects.friendship_bonus) {
          const bonus = typeof effects.friendship_bonus === 'object' 
            ? (effects.friendship_bonus.lv50 || effects.friendship_bonus.lv1)
            : effects.friendship_bonus;
          analysis.totalBonus.friendship += bonus || 0;
        }
        if (effects.training_bonus) {
          const bonus = typeof effects.training_bonus === 'object'
            ? (effects.training_bonus.lv50 || effects.training_bonus.lv1)
            : effects.training_bonus;
          analysis.totalBonus.training += bonus || 0;
        }
        if (effects.motivation_bonus) {
          const bonus = typeof effects.motivation_bonus === 'object'
            ? (effects.motivation_bonus.lv50 || effects.motivation_bonus.lv1)
            : effects.motivation_bonus;
          analysis.totalBonus.motivation += bonus || 0;
        }
        if (effects.skill_pt_bonus) {
          const bonus = typeof effects.skill_pt_bonus === 'object'
            ? (effects.skill_pt_bonus.lv50 || effects.skill_pt_bonus.lv1)
            : effects.skill_pt_bonus;
          analysis.totalBonus.skillPt += bonus || 0;
        }
      }
    });

    const filledSlots = deck.filter(s => s.card).length;
    
    if (filledSlots < 6) {
      analysis.recommendations.push(`Add ${6 - filledSlots} more cards to complete your deck`);
    }
    
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

    analysis.score = Math.round(
      (analysis.totalBonus.friendship + analysis.totalBonus.training) * 0.3 +
      typeCount * 10 +
      (6 - Math.abs(3 - maxType)) * 5 +
      (analysis.typeBalance.friend > 0 ? 10 : 0)
    );

    return analysis;
  }, [deck]);

  const addCardToDeck = (card: SupportCard, position: number) => {
    const newDeck = [...deck];
    newDeck[position] = { card, position };
    setDeck(newDeck);
  };

  const removeCardFromDeck = (position: number) => {
    const newDeck = [...deck];
    newDeck[position] = { card: null, position };
    setDeck(newDeck);
  };

  const applyTemplate = (template: typeof DECK_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    const newDeck = Array.from({ length: 6 }, (_, i) => ({ card: null, position: i }));
    
    let position = 0;
    Object.entries(template.composition).forEach(([type, count]) => {
      const cardsOfType = availableCards
        .filter(card => card.type === type)
        .sort((a, b) => {
          const rarityOrder = { SSR: 3, SR: 2, R: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        })
        .slice(0, count);
      
      cardsOfType.forEach(card => {
        if (position < 6) {
          newDeck[position] = { card, position };
          position++;
        }
      });
    });
    
    setDeck(newDeck);
  };

  const clearDeck = () => {
    setDeck(Array.from({ length: 6 }, (_, i) => ({ card: null, position: i })));
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
                        <PlaceholderImage type="card" className="w-full h-full" />
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
                            className="opacity-0 group-hover:opacity-100 transition bg-red-500 rounded-full p-1"
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
            const emptySlot = deck.find(s => !s.card);
            return (
              <button
                key={card.id}
                onClick={() => {
                  const emptySlotIndex = deck.findIndex(s => !s.card);
                  if (emptySlotIndex !== -1) {
                    addCardToDeck(card, emptySlotIndex);
                  }
                }}
                disabled={deck.every(s => s.card !== null)}
                className={`aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden text-left hover:shadow-lg transition relative ${
                  deck.every(s => s.card !== null) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                      <PlaceholderImage type="card" className="w-full h-full" />
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