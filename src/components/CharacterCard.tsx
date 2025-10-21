import React from 'react';
import { Star, TrendingUp } from 'lucide-react';
import type { Character } from '@/types';
import PlaceholderImage from './PlaceholderImage';

interface CharacterCardProps {
  character: Character;
  tier?: string;
}

export default function CharacterCard({ character, tier }: CharacterCardProps) {
  const rarityStars = Array.from({ length: character.rarity }, (_, i) => i);
  
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-lg card-hover">
      {/* Tier Badge */}
      {tier && (
        <div className={`absolute top-2 right-2 z-20 px-3 py-1 rounded-full text-sm font-bold tier-${tier.toLowerCase()}`}>
          {tier}
        </div>
      )}
      
      {/* Character Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-uma-primary/10 to-uma-secondary/10">
        {character.image_url ? (
          <img 
            src={character.image_url} 
            alt={character.name_en}
            className="absolute inset-0 w-full h-full object-contain object-center"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage 
            type="character" 
            name={character.name_en} 
            rarity={character.rarity}
            className="absolute inset-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg drop-shadow-lg">{character.name_en}</h3>
          <p className="text-white/90 text-sm font-jp drop-shadow-lg">{character.name_jp}</p>
        </div>
      </div>

      {/* Rarity */}
      <div className="flex justify-center py-2 bg-gradient-to-r from-uma-primary/10 to-uma-secondary/10">
        {rarityStars.map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-uma-accent text-uma-accent" />
        ))}
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="space-y-2">
          <StatBar label="SPD" value={character.attributes?.speed || 0} max={120} color="bg-red-500" />
          <StatBar label="STA" value={character.attributes?.stamina || 0} max={120} color="bg-green-500" />
          <StatBar label="POW" value={character.attributes?.power || 0} max={120} color="bg-orange-500" />
          <StatBar label="GUT" value={character.attributes?.guts || 0} max={120} color="bg-purple-500" />
          <StatBar label="WIS" value={character.attributes?.wisdom || 0} max={120} color="bg-blue-500" />
        </div>
      </div>

      {/* Skills Preview */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-1">
          {character.skills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-uma-accent/20 text-uma-dark rounded-full">
              {skill}
            </span>
          ))}
          {character.skills?.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
              +{character.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Hover Overlay - Make entire overlay clickable */}
      <a
        href={`/characters/${character.id}/`}
        className="absolute inset-0 bg-gradient-to-t from-uma-primary/90 to-uma-secondary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer z-30"
      >
        <span className="btn-secondary pointer-events-none">View Details</span>
      </a>
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs font-medium w-8">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value}</span>
    </div>
  );
}
