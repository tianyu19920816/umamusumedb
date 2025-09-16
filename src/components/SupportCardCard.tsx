import React from 'react';
import { Star, Zap, Heart, Brain, Users, Sparkles } from 'lucide-react';
import PlaceholderImage from './PlaceholderImage';

interface SupportCard {
  id: string;
  name_en: string;
  name_jp: string;
  type: 'speed' | 'stamina' | 'power' | 'guts' | 'wisdom' | 'friend';
  rarity: 'R' | 'SR' | 'SSR';
  effects: Record<string, any>;
  skills: string[];
  events?: string[];
  image_url?: string;
}

interface SupportCardCardProps {
  card: SupportCard;
}

export default function SupportCardCard({ card }: SupportCardCardProps) {
  const typeColors = {
    speed: 'bg-red-500',
    stamina: 'bg-green-500',
    power: 'bg-orange-500',
    guts: 'bg-purple-500',
    wisdom: 'bg-blue-500',
    friend: 'bg-pink-500'
  };

  const typeIcons = {
    speed: Zap,
    stamina: Heart,
    power: Sparkles,
    guts: Star,
    wisdom: Brain,
    friend: Users
  };

  const TypeIcon = typeIcons[card.type];

  const rarityColors = {
    SSR: 'rarity-ssr',
    SR: 'rarity-sr',
    R: 'rarity-r'
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-lg card-hover">
      {/* Rarity Badge */}
      <div className={`absolute top-2 left-2 z-20 px-3 py-1 rounded-full text-white font-bold text-sm ${rarityColors[card.rarity]}`}>
        {card.rarity}
      </div>

      {/* Type Badge */}
      <div className={`absolute top-2 right-2 z-20 w-10 h-10 rounded-full ${typeColors[card.type]} flex items-center justify-center`}>
        <TypeIcon className="w-5 h-5 text-white" />
      </div>

      {/* Card Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-uma-primary/10 to-uma-secondary/10">
        {card.image_url ? (
          <img 
            src={card.image_url} 
            alt={card.name_en}
            className="absolute inset-0 w-full h-full object-contain object-center"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage 
            type="card" 
            name={card.name_en} 
            rarity={card.rarity}
            className="absolute inset-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg drop-shadow-lg">{card.name_en}</h3>
          <p className="text-white/90 text-sm font-jp drop-shadow-lg">{card.name_jp}</p>
        </div>
      </div>

      {/* Effects */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Effects</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(card.effects).slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-semibold text-uma-primary">+{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="p-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Skills</h4>
        <div className="flex flex-wrap gap-1">
          {card.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-uma-accent/20 text-uma-dark rounded-full">
              {skill}
            </span>
          ))}
          {card.skills.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
              +{card.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Events (if any) */}
      {card.events && card.events.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500">
            {card.events.length} unique events
          </div>
        </div>
      )}

      {/* Hover Overlay - Make entire overlay clickable */}
      <a 
        href={`/cards/${card.id}`} 
        className="absolute inset-0 bg-gradient-to-t from-uma-primary/90 to-uma-secondary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer z-30"
      >
        <span className="btn-secondary pointer-events-none">View Details</span>
      </a>
    </div>
  );
}