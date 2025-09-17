import React, { useState, useMemo } from 'react';
import { Calculator, Star, Sparkles, TrendingUp, Heart, Zap } from 'lucide-react';

interface Factor {
  type: 'stat' | 'aptitude' | 'unique';
  name: string;
  stars: number;
  parent: 'parent1' | 'parent2' | 'grandparent';
}

interface InheritanceResult {
  factor: string;
  probability: number;
  stars: number;
}

const FACTOR_TYPES = {
  stat: ['Speed', 'Stamina', 'Power', 'Guts', 'Wisdom'],
  aptitude: ['Turf', 'Dirt', 'Sprint', 'Mile', 'Medium', 'Long', 'Escape', 'Lead', 'Between', 'Chase'],
  unique: ['URA Factor', 'Scenario Factor', 'Character Factor']
};

const INHERITANCE_RATES = {
  parent1: { 1: 0.70, 2: 0.60, 3: 0.50 },
  parent2: { 1: 0.70, 2: 0.60, 3: 0.50 },
  grandparent: { 1: 0.21, 2: 0.18, 3: 0.15 }
};

const COMPATIBILITY_BONUS = {
  '◎': 1.1,
  '○': 1.05,
  '△': 1.0,
  '×': 0.95
};

export default function FactorCalculator() {
  const [parent1Factors, setParent1Factors] = useState<Factor[]>([]);
  const [parent2Factors, setParent2Factors] = useState<Factor[]>([]);
  const [grandparentFactors, setGrandparentFactors] = useState<Factor[]>([]);
  const [compatibility, setCompatibility] = useState<'◎' | '○' | '△' | '×'>('○');
  const [showingAddFactor, setShowingAddFactor] = useState<'parent1' | 'parent2' | 'grandparent' | null>(null);

  const calculateInheritance = useMemo(() => {
    const results: InheritanceResult[] = [];
    const compatBonus = COMPATIBILITY_BONUS[compatibility];

    const allFactors = [
      ...parent1Factors.map(f => ({ ...f, source: 'parent1' as const })),
      ...parent2Factors.map(f => ({ ...f, source: 'parent2' as const })),
      ...grandparentFactors.map(f => ({ ...f, source: 'grandparent' as const }))
    ];

    const factorMap = new Map<string, { probability: number; stars: number }>();

    allFactors.forEach(factor => {
      const baseRate = INHERITANCE_RATES[factor.source][factor.stars as 1 | 2 | 3] || 0;
      const probability = Math.min(baseRate * compatBonus, 1.0);
      
      const key = `${factor.type}-${factor.name}`;
      const existing = factorMap.get(key);
      
      if (existing) {
        factorMap.set(key, {
          probability: 1 - (1 - existing.probability) * (1 - probability),
          stars: Math.max(existing.stars, factor.stars)
        });
      } else {
        factorMap.set(key, { probability, stars: factor.stars });
      }
    });

    factorMap.forEach((value, key) => {
      const [type, name] = key.split('-');
      results.push({
        factor: name,
        probability: value.probability * 100,
        stars: value.stars
      });
    });

    return results.sort((a, b) => b.probability - a.probability);
  }, [parent1Factors, parent2Factors, grandparentFactors, compatibility]);

  const addFactor = (parent: 'parent1' | 'parent2' | 'grandparent', type: 'stat' | 'aptitude' | 'unique', name: string, stars: number) => {
    const newFactor: Factor = { type, name, stars, parent };
    
    if (parent === 'parent1') {
      setParent1Factors([...parent1Factors, newFactor]);
    } else if (parent === 'parent2') {
      setParent2Factors([...parent2Factors, newFactor]);
    } else {
      setGrandparentFactors([...grandparentFactors, newFactor]);
    }
    
    setShowingAddFactor(null);
  };

  const removeFactor = (parent: 'parent1' | 'parent2' | 'grandparent', index: number) => {
    if (parent === 'parent1') {
      setParent1Factors(parent1Factors.filter((_, i) => i !== index));
    } else if (parent === 'parent2') {
      setParent2Factors(parent2Factors.filter((_, i) => i !== index));
    } else {
      setGrandparentFactors(grandparentFactors.filter((_, i) => i !== index));
    }
  };

  const FactorInput = ({ parent, factors }: { parent: 'parent1' | 'parent2' | 'grandparent'; factors: Factor[] }) => {
    const parentLabels = {
      parent1: 'Parent 1',
      parent2: 'Parent 2',
      grandparent: 'Grandparents'
    };

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          {parent === 'grandparent' ? <Heart className="w-4 h-4 text-pink-500" /> : <Sparkles className="w-4 h-4 text-blue-500" />}
          {parentLabels[parent]}
        </h3>
        
        <div className="space-y-2 mb-3">
          {factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{factor.name}</span>
                <div className="flex">
                  {[...Array(factor.stars)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <button
                onClick={() => removeFactor(parent, index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {showingAddFactor === parent ? (
          <div className="border rounded-lg p-3 space-y-2">
            <select 
              className="w-full border rounded p-2"
              onChange={(e) => {
                const [type, name, stars] = e.target.value.split('|');
                if (type && name && stars) {
                  addFactor(parent, type as any, name, parseInt(stars));
                }
              }}
            >
              <option value="">Select Factor</option>
              <optgroup label="Stat Factors">
                {FACTOR_TYPES.stat.map(stat => (
                  [1, 2, 3].map(star => (
                    <option key={`${stat}-${star}`} value={`stat|${stat}|${star}`}>
                      {stat} ★{star}
                    </option>
                  ))
                )).flat()}
              </optgroup>
              <optgroup label="Aptitude Factors">
                {FACTOR_TYPES.aptitude.map(apt => (
                  [1, 2, 3].map(star => (
                    <option key={`${apt}-${star}`} value={`aptitude|${apt}|${star}`}>
                      {apt} ★{star}
                    </option>
                  ))
                )).flat()}
              </optgroup>
              <optgroup label="Unique Factors">
                {FACTOR_TYPES.unique.map(unique => (
                  [1, 2, 3].map(star => (
                    <option key={`${unique}-${star}`} value={`unique|${unique}|${star}`}>
                      {unique} ★{star}
                    </option>
                  ))
                )).flat()}
              </optgroup>
            </select>
            <button
              onClick={() => setShowingAddFactor(null)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowingAddFactor(parent)}
            className="w-full text-sm bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition"
          >
            + Add Factor
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Factor Setup
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <FactorInput parent="parent1" factors={parent1Factors} />
          <FactorInput parent="parent2" factors={parent2Factors} />
          <FactorInput parent="grandparent" factors={grandparentFactors} />
        </div>

        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold mb-2">Compatibility</h3>
          <div className="flex gap-2">
            {(['◎', '○', '△', '×'] as const).map(level => (
              <button
                key={level}
                onClick={() => setCompatibility(level)}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  compatibility === level 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {level} {(COMPATIBILITY_BONUS[level] * 100 - 100).toFixed(0)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Inheritance Probability
        </h2>
        
        {calculateInheritance.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Add factors above to see inheritance probabilities</p>
        ) : (
          <div className="space-y-3">
            {calculateInheritance.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{result.factor}</span>
                  <div className="flex">
                    {[...Array(result.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${result.probability}%` }}
                    />
                  </div>
                  <span className="font-bold text-sm w-12 text-right">
                    {result.probability.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Breeding Tips
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Higher star factors have lower base inheritance rates but stronger effects</li>
                <li>• Compatibility (◎ {'>'} ○ {'>'} △ {'>'} ×) affects all inheritance rates</li>
                <li>• Same factors from multiple sources stack their probabilities</li>
                <li>• Grandparent factors have significantly lower rates (~30% of parent rates)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}