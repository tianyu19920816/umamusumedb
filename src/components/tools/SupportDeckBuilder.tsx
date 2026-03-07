import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Star, TrendingUp, Users, Sparkles, AlertTriangle, Check, Lock, Unlock, Zap, Award, Lightbulb, RotateCcw } from 'lucide-react';
import PlaceholderImage from '../PlaceholderImage';
import type { SupportCard } from '@/types';
import { supportCards as staticSupportCards } from '@/lib/static-content';

interface DeckSlot {
  card: SupportCard | null;
  position: number;
  lb: number;
}

interface CardScore {
  card: SupportCard;
  score: number;
  breakdown: {
    rarityScore: number;
    friendshipScore: number;
    trainingScore: number;
    skillPtScore: number;
    versatilityScore: number;
  };
  tier: 'SS' | 'S' | 'A' | 'B' | 'C';
}

interface DeckAnalysis {
  totalBonus: { [key: string]: number };
  typeBalance: { [key: string]: number };
  recommendations: string[];
  missingTypes: string[];
  duplicateCards: string[];
  rarityCount: { SSR: number; SR: number; R: number };
  score: number;
  synergyScore: number;
  potentialScore: number;
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

const LB_MULTIPLIERS = { 0: 1.0, 1: 1.1, 2: 1.2, 3: 1.35, 4: 1.5 };

const getLBColorClass = (lb: number) => {
  switch (lb) {
    case 4: return 'bg-yellow-500 text-white';
    case 3: return 'bg-purple-500 text-white';
    case 2: return 'bg-blue-500 text-white';
    case 1: return 'bg-green-500 text-white';
    default: return 'bg-gray-300 text-gray-700';
  }
};

// Card Image component with fallback handling
interface CardImageProps {
  card: SupportCard;
  className?: string;
}

function CardImage({ card, className = '' }: CardImageProps) {
  // Use R2 image URLs directly from data
  // Priority: character_image_url > image_url
  const imageUrl = card.character_image_url || card.image_url;
  
  // If no image URL available, show placeholder
  if (!imageUrl) {
    return (
      <PlaceholderImage
        type="card"
        name={card.name_en}
        rarity={card.rarity}
        className={className}
      />
    );
  }
  
  return (
    <>
      <img 
        src={imageUrl}
        alt={card.name_en}
        className={`${className} object-cover opacity-90`}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // If R2 image fails, hide to show placeholder
          console.warn(`Failed to load image: ${imageUrl}`);
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
        onLoad={() => {
          console.log(`Loaded image: ${imageUrl}`);
        }}
      />
      {/* Placeholder is always behind the image */}
      <div className="absolute inset-0 -z-10">
        <PlaceholderImage
          type="card"
          name={card.name_en}
          rarity={card.rarity}
          className="w-full h-full"
        />
      </div>
    </>
  );
}

// Enhanced deck templates with specific goals
const DECK_TEMPLATES = [
  {
    name: 'Speed Focus',
    description: 'Maximize speed growth for sprint/mile',
    composition: { speed: 3, power: 1, wisdom: 1, friend: 1 },
    targetStats: ['speed', 'power'],
    recommendedTypes: ['speed', 'friend']
  },
  {
    name: 'Balanced',
    description: 'Well-rounded for any distance',
    composition: { speed: 1, stamina: 1, power: 1, guts: 1, wisdom: 1, friend: 1 },
    targetStats: ['speed', 'stamina', 'power', 'guts', 'wisdom'],
    recommendedTypes: ['friend']
  },
  {
    name: 'Long Distance',
    description: 'Stamina-heavy for long races',
    composition: { stamina: 3, speed: 1, wisdom: 1, friend: 1 },
    targetStats: ['stamina', 'guts'],
    recommendedTypes: ['stamina', 'friend']
  },
  {
    name: 'Sprint Power',
    description: 'Speed + Power combo',
    composition: { speed: 2, power: 2, wisdom: 1, friend: 1 },
    targetStats: ['speed', 'power'],
    recommendedTypes: ['speed', 'power', 'friend']
  },
  {
    name: 'Wisdom Support',
    description: 'Skill point and wisdom focus',
    composition: { wisdom: 3, speed: 1, power: 1, friend: 1 },
    targetStats: ['wisdom'],
    recommendedTypes: ['wisdom', 'friend']
  },
  {
    name: 'Guts Build',
    description: 'High guts for aggressive racing',
    composition: { guts: 3, speed: 1, power: 1, friend: 1 },
    targetStats: ['guts', 'power'],
    recommendedTypes: ['guts', 'friend']
  }
];

// Calculate individual card score
function calculateCardScore(card: SupportCard): CardScore {
  const effects = card.effects || {};
  
  // Extract values from effects
  const getEffectValue = (key: string): number => {
    const val = effects[key];
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'object') {
      return val.lv50 || val.lv45 || val.lv40 || val.lv1 || 0;
    }
    return 0;
  };

  const friendship = getEffectValue('friendship_bonus');
  const training = getEffectValue('training_bonus');
  const motivation = getEffectValue('motivation_bonus');
  const skillPt = getEffectValue('skill_pt_bonus');

  // Base rarity score
  const rarityScore = card.rarity === 'SSR' ? 30 : card.rarity === 'SR' ? 15 : 5;
  
  // Calculate individual scores
  const friendshipScore = Math.min(friendship * 0.5, 25); // Cap at 25
  const trainingScore = Math.min(training * 0.6, 20); // Cap at 20
  const skillPtScore = Math.min(skillPt * 0.1, 15); // Cap at 15
  const versatilityScore = motivation * 0.5; // Motivation is valuable for all

  // Friend cards get bonus for event variety
  const friendBonus = card.type === 'friend' ? 10 : 0;

  const totalScore = rarityScore + friendshipScore + trainingScore + skillPtScore + versatilityScore + friendBonus;

  // Determine tier
  let tier: CardScore['tier'] = 'C';
  if (totalScore >= 70) tier = 'SS';
  else if (totalScore >= 55) tier = 'S';
  else if (totalScore >= 40) tier = 'A';
  else if (totalScore >= 25) tier = 'B';

  return {
    card,
    score: Math.round(totalScore),
    breakdown: {
      rarityScore,
      friendshipScore: Math.round(friendshipScore),
      trainingScore: Math.round(trainingScore),
      skillPtScore: Math.round(skillPtScore),
      versatilityScore: Math.round(versatilityScore) + friendBonus
    },
    tier
  };
}

// Generate recommendations for missing cards
function generateRecommendations(
  deck: DeckSlot[],
  availableCards: SupportCard[],
  selectedTemplate: typeof DECK_TEMPLATES[0] | null
): string[] {
  const recommendations: string[] = [];
  const filledSlots = deck.filter(s => s.card).length;
  
  if (filledSlots === 0) {
    recommendations.push('Start by selecting a template above, or add cards manually');
    return recommendations;
  }

  // Type analysis
  const typeCount: Record<string, number> = { speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0, friend: 0 };
  deck.forEach(slot => {
    if (slot.card) typeCount[slot.card.type]++;
  });

  // Check template alignment
  if (selectedTemplate) {
    Object.entries(selectedTemplate.composition).forEach(([type, count]) => {
      const current = typeCount[type] || 0;
      if (current < count) {
        const needed = count - current;
        recommendations.push(`Add ${needed} more ${type} card(s) for "${selectedTemplate.name}" template`);
      }
    });
  }

  // General recommendations
  if (!typeCount.friend && filledSlots >= 4) {
    recommendations.push('Consider adding a Friend card for event bonuses and training variety');
  }

  const missingTypes = Object.entries(typeCount)
    .filter(([, count]) => count === 0)
    .map(([type]) => type);
  
  if (missingTypes.length > 3 && filledSlots >= 4) {
    recommendations.push('Your deck lacks type diversity - consider a more balanced composition');
  }

  // Score recommendations
  const scores = deck
    .filter(s => s.card)
    .map(s => calculateCardScore(s.card!));
  
  const lowTierCards = scores.filter(s => s.tier === 'C' || s.tier === 'B');
  if (lowTierCards.length >= 2 && filledSlots >= 4) {
    recommendations.push(`${lowTierCards.length} cards have below-average ratings - consider upgrading to SSR cards`);
  }

  return recommendations;
}

export default function SupportDeckBuilder() {
  const [availableCards, setAvailableCards] = useState<SupportCard[]>([]);
  const [deck, setDeck] = useState<DeckSlot[]>(
    Array.from({ length: 6 }, (_, i) => ({ card: null, position: i, lb: 0 }))
  );
  const [lockedSlots, setLockedSlots] = useState<boolean[]>(
    Array.from({ length: 6 }, () => false)
  );
  const [selectedTemplate, setSelectedTemplate] = useState<typeof DECK_TEMPLATES[0] | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showCardRatings, setShowCardRatings] = useState(false);
  const [sortByScore, setSortByScore] = useState(false);

  useEffect(() => {
    setAvailableCards(staticSupportCards);
  }, []);

  // Calculate scored cards
  const scoredCards = useMemo(() => {
    return availableCards.map(calculateCardScore).sort((a, b) => b.score - a.score);
  }, [availableCards]);

  const filteredCards = useMemo(() => {
    let cards = sortByScore ? scoredCards.map(sc => sc.card) : availableCards;
    
    cards = cards.filter(card => {
      if (filterType !== 'all' && card.type !== filterType) return false;
      if (filterRarity !== 'all' && card.rarity !== filterRarity) return false;
      return !deck.some(slot => slot.card?.id === card.id);
    });
    
    return cards;
  }, [availableCards, scoredCards, filterType, filterRarity, deck, sortByScore]);

  const analyzeDeck = useMemo((): DeckAnalysis => {
    const analysis: DeckAnalysis = {
      totalBonus: { friendship: 0, training: 0, motivation: 0, skillPt: 0 },
      typeBalance: { speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0, friend: 0 },
      recommendations: [],
      missingTypes: [],
      duplicateCards: [],
      rarityCount: { SSR: 0, SR: 0, R: 0 },
      score: 0,
      synergyScore: 0,
      potentialScore: 0
    };

    const duplicateCounter = new Map<string, number>();
    const cardScores: number[] = [];

    deck.forEach(slot => {
      if (!slot.card) return;

      const card = slot.card;
      const cardScore = calculateCardScore(card);
      cardScores.push(cardScore.score);
      
      analysis.typeBalance[card.type]++;
      analysis.rarityCount[card.rarity] = (analysis.rarityCount[card.rarity] || 0) + 1;
      duplicateCounter.set(card.id, (duplicateCounter.get(card.id) || 0) + 1);

      const effects = card.effects;
      if (effects) {
        const getVal = (key: string): number => {
          const val = effects[key];
          if (!val) return 0;
          if (typeof val === 'number') return val;
          if (typeof val === 'object') return val.lv50 || val.lv45 || val.lv1 || 0;
          return 0;
        };
        analysis.totalBonus.friendship += getVal('friendship_bonus');
        analysis.totalBonus.training += getVal('training_bonus');
        analysis.totalBonus.motivation += getVal('motivation_bonus');
        analysis.totalBonus.skillPt += getVal('skill_pt_bonus');
      }
    });

    const filledSlots = deck.filter(s => s.card).length;

    // Calculate synergy score
    const typeCount = Object.values(analysis.typeBalance).filter(v => v > 0).length;
    const hasFriend = analysis.typeBalance.friend > 0;
    analysis.synergyScore = (typeCount * 5) + (hasFriend ? 15 : 0);

    // Calculate potential score based on card ratings
    const avgCardScore = cardScores.length > 0 
      ? cardScores.reduce((a, b) => a + b, 0) / cardScores.length 
      : 0;
    analysis.potentialScore = Math.round(avgCardScore * 0.8);

    // Generate recommendations
    analysis.recommendations = generateRecommendations(deck, availableCards, selectedTemplate);

    analysis.missingTypes = Object.entries(analysis.typeBalance)
      .filter(([, count]) => count === 0)
      .map(([type]) => type);

    analysis.duplicateCards = Array.from(duplicateCounter.entries())
      .filter(([, count]) => count > 1)
      .map(([cardId]) => deck.find(slot => slot.card?.id === cardId)?.card?.name_en || cardId);

    // Calculate final score
    const totalLB = deck.reduce((sum, slot) => sum + (slot.card ? slot.lb : 0), 0);
    const avgLBMultiplier = filledSlots > 0
      ? deck.reduce((sum, slot) => sum + (slot.card ? LB_MULTIPLIERS[slot.lb as keyof typeof LB_MULTIPLIERS] : 0), 0) / filledSlots
      : 1.0;

    analysis.score = Math.round(
      // Base: Card quality (0-60)
      (analysis.potentialScore * 0.6) +
      // Synergy: Type diversity + Friend bonus (0-35)
      analysis.synergyScore +
      // Rarity bonus
      analysis.rarityCount.SSR * 10 +
      analysis.rarityCount.SR * 5 +
      // LB bonus
      totalLB * 2 +
      // Penalties
      (analysis.duplicateCards.length > 0 ? -15 : 0)
    );

    return analysis;
  }, [deck, availableCards, selectedTemplate]);

  const addCardToDeck = (card: SupportCard, position: number, lb: number = 0) => {
    if (lockedSlots[position]) return;
    const newDeck = [...deck];
    newDeck[position] = { card, position, lb };
    setDeck(newDeck);
  };

  const setCardLB = (position: number, lb: number) => {
    const newDeck = [...deck];
    if (newDeck[position].card) {
      newDeck[position] = { ...newDeck[position], lb: Math.max(0, Math.min(4, lb)) };
      setDeck(newDeck);
    }
  };

  const removeCardFromDeck = (position: number) => {
    if (lockedSlots[position]) return;
    const newDeck = [...deck];
    newDeck[position] = { card: null, position, lb: 0 };
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
      lockedSlots[idx] ? slot : { card: null, position: idx, lb: 0 }
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
      retainedDeck[targetIndex] = { card, position: targetIndex, lb: 0 };
      occupiedIds.add(card.id);
    };

    // Sort cards by score for better template fills
    Object.entries(template.composition).forEach(([type, count]) => {
      const cardsOfType = scoredCards
        .filter(sc => sc.card.type === type)
        .sort((a, b) => b.score - a.score);

      for (const sc of cardsOfType) {
        if (occupiedIds.has(sc.card.id)) continue;
        fillNextSlot(sc.card);
        if (--count <= 0) break;
      }
    });

    setDeck(retainedDeck);
  };

  const clearDeck = () => {
    setDeck(Array.from({ length: 6 }, (_, i) => ({ card: null, position: i, lb: 0 })));
    setLockedSlots(Array.from({ length: 6 }, () => false));
    setSelectedTemplate(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 55) return 'text-orange-600';
    if (score >= 40) return 'text-blue-600';
    if (score >= 25) return 'text-gray-600';
    return 'text-gray-400';
  };

  const getTierBadgeColor = (tier: string) => {
    switch(tier) {
      case 'SS': return 'bg-red-100 text-red-700 border-red-200';
      case 'S': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'A': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'B': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Templates Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Quick Templates
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose a template to auto-fill your deck with recommended cards. Lock slots to keep specific cards.
        </p>
        <div className="flex flex-wrap gap-2">
          {DECK_TEMPLATES.map(template => (
            <button
              key={template.name}
              onClick={() => applyTemplate(template)}
              className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                selectedTemplate?.name === template.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="font-semibold">{template.name}</div>
              <div className={`text-xs ${selectedTemplate?.name === template.name ? 'text-blue-100' : 'text-gray-500'}`}>
                {template.description}
              </div>
            </button>
          ))}
          <button
            onClick={clearDeck}
            className="px-3 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 transition flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Deck Grid */}
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
              >
                {lockedSlots[index] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              {slot.card ? (
                <>
                  <div className={`absolute top-0 left-0 right-0 h-1 ${getTypeColorClasses(slot.card.type).split(' ')[0]}`} />
                  <div className="h-full flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0">
                      <CardImage 
                        card={slot.card}
                        className="w-full h-full"
                      />
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
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getRarityColorClasses(slot.card.rarity)}`}>
                              {slot.card.rarity}
                            </span>
                            <select
                              value={slot.lb}
                              onChange={(e) => {
                                e.stopPropagation();
                                setCardLB(index, parseInt(e.target.value));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`text-[10px] font-bold px-1 py-0.5 rounded cursor-pointer ${getLBColorClass(slot.lb)}`}
                            >
                              <option value={0}>LB0</option>
                              <option value={1}>LB1</option>
                              <option value={2}>LB2</option>
                              <option value={3}>LB3</option>
                              <option value={4}>LB4</option>
                            </select>
                          </div>
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
      </div>

      {/* Enhanced Analysis */}
      {showAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Deck Analysis
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Score Display */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Overall Score</div>
                <div className={`text-4xl font-bold ${getScoreColor(analyzeDeck.score)}`}>
                  {analyzeDeck.score}
                </div>
                <div className="text-xs text-gray-500 mt-1">out of 100</div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card Quality</span>
                    <span className="font-medium">{analyzeDeck.potentialScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Synergy</span>
                    <span className="font-medium">{analyzeDeck.synergyScore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bonuses */}
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
                  <span className="text-sm text-gray-600">Rarity Mix</span>
                  <span className="font-bold text-purple-600">
                    {analyzeDeck.rarityCount.SSR} SSR / {analyzeDeck.rarityCount.SR} SR / {analyzeDeck.rarityCount.R} R
                  </span>
                </div>
              </div>
            </div>
            
            {/* Type Distribution */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Type Distribution</h4>
              <div className="space-y-2">
                {Object.entries(analyzeDeck.typeBalance).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-xs w-16 capitalize">{type}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getTypeColorClasses(type).split(' ')[0]}`}
                        style={{ width: `${(count / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
              {analyzeDeck.missingTypes.length > 0 && (
                <div className="mt-3 text-xs text-orange-600">
                  Missing: {analyzeDeck.missingTypes.join(', ')}
                </div>
              )}
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Recommendations</span>
            </div>
            {analyzeDeck.recommendations.length > 0 ? (
              <div className="space-y-2">
                {analyzeDeck.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-blue-800">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>Excellent deck composition! Ready for training.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Cards */}
      <div id="available-cards" className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold">Available Cards</h3>
          <div className="flex flex-wrap gap-2">
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
            <button
              onClick={() => setSortByScore(!sortByScore)}
              className={`text-sm px-3 py-1 rounded border transition ${
                sortByScore 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Sort by Score
            </button>
            <button
              onClick={() => setShowCardRatings(!showCardRatings)}
              className={`text-sm px-3 py-1 rounded border transition ${
                showCardRatings 
                  ? 'bg-purple-50 border-purple-300 text-purple-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Award className="w-3 h-3 inline mr-1" />
              Show Ratings
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto">
          {filteredCards.map(card => {
            const scoredCard = scoredCards.find(sc => sc.card.id === card.id);
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
                
                {/* Rating Badge */}
                {showCardRatings && scoredCard && (
                  <div className={`absolute top-1 right-1 z-20 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getTierBadgeColor(scoredCard.tier)}`}>
                    {scoredCard.tier}
                  </div>
                )}
                
                <div className="h-full relative overflow-hidden">
                  <div className="absolute inset-0">
                    <CardImage 
                      card={card}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="relative z-10 p-2 h-full flex flex-col bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="text-xs font-bold text-white uppercase drop-shadow">
                      {card.type}
                    </div>
                    <div className="text-xs font-semibold mt-1 line-clamp-2 text-white drop-shadow">
                      {card.name_en}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getRarityColorClasses(card.rarity)}`}>
                        {card.rarity}
                      </span>
                      {showCardRatings && scoredCard && (
                        <span className="text-xs text-white font-bold drop-shadow">
                          {scoredCard.score}pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cards match your filters
          </div>
        )}
      </div>

      {/* Legend */}
      {showCardRatings && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <div className="font-medium mb-2">Card Rating Tiers</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 font-bold">SS</span>
              <span className="text-gray-600">Elite (70+ pts) - Top tier support</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200 font-bold">S</span>
              <span className="text-gray-600">Excellent (55-69 pts) - Great choice</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-bold">A</span>
              <span className="text-gray-600">Good (40-54 pts) - Solid option</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 font-bold">B</span>
              <span className="text-gray-600">Average (25-39 pts) - Decent filler</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200 font-bold">C</span>
              <span className="text-gray-600">Below Average (&lt;25 pts)</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Scores based on: Rarity + Friendship Bonus + Training Bonus + Skill Points + Motivation Bonus
          </div>
        </div>
      )}
    </div>
  );
}
