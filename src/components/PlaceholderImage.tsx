import React from 'react';

interface PlaceholderImageProps {
  type: 'character' | 'card';
  name: string;
  className?: string;
  rarity?: string | number;
}

export default function PlaceholderImage({ type, name, className = '', rarity }: PlaceholderImageProps) {
  // Generate a consistent color based on the name
  const getColorFromName = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const bgColor = getColorFromName(name);
  const initials = name.split(/[\s_-]/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Get gradient colors based on rarity
  const getGradientColors = () => {
    if (type === 'card') {
      if (rarity === 'SSR') return 'from-yellow-400 to-yellow-600';
      if (rarity === 'SR') return 'from-purple-400 to-purple-600';
      if (rarity === 'R') return 'from-gray-400 to-gray-600';
    }
    if (type === 'character') {
      if (Number(rarity) === 3) return 'from-yellow-400 to-amber-600';
      if (Number(rarity) === 2) return 'from-blue-400 to-blue-600';
      if (Number(rarity) === 1) return 'from-gray-400 to-gray-600';
    }
    return 'from-uma-primary to-uma-secondary';
  };

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${getGradientColors()} ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg"
            style={{ backgroundColor: bgColor }}
          >
            {initials}
          </div>
          <p className="mt-2 text-white/80 text-xs md:text-sm font-medium px-2">
            {type === 'character' ? '★'.repeat(Number(rarity) || 1) : rarity}
          </p>
        </div>
      </div>
      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
    </div>
  );
}