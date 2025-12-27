import React, { useState, useEffect } from 'react';
import { Target, Check, AlertCircle, Trophy, Calendar, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface Goal {
  id: string;
  year: string;
  half: string;
  description_en: string;
  description_jp?: string;
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CharacterGoals {
  id: string;
  name_en: string;
  name_jp?: string;
  goals: Goal[];
}

// Fallback data in case JSON fails to load
const FALLBACK_CHARACTER_GOALS: CharacterGoals[] = [
  {
    id: 'special_week',
    name_en: 'Special Week',
    name_jp: 'スペシャルウィーク',
    goals: [
      {
        id: 'sw1',
        year: 'Junior',
        half: 'First Half',
        description_en: 'Make debut race',
        description_jp: 'デビュー戦',
        tips: ['Focus on Speed training', 'Aim for 300+ Speed stat'],
        difficulty: 'easy'
      },
      {
        id: 'sw2',
        year: 'Junior',
        half: 'Second Half',
        description_en: 'Win Hopeful Stakes (G1, 2000m)',
        description_jp: 'ホープフルS (G1, 2000m) 勝利',
        tips: ['Need 400+ Speed, 300+ Stamina', 'Get acceleration skills'],
        difficulty: 'medium'
      },
      {
        id: 'sw3',
        year: 'Classic',
        half: 'First Half',
        description_en: 'Win Japanese Derby (G1, 2400m)',
        description_jp: '日本ダービー (G1, 2400m) 勝利',
        tips: ['Aim for 600+ Speed, 400+ Stamina', 'Power is important for this race'],
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'silence_suzuka',
    name_en: 'Silence Suzuka',
    name_jp: 'サイレンススズカ',
    goals: [
      {
        id: 'ss1',
        year: 'Junior',
        half: 'First Half',
        description_en: 'Make debut race',
        description_jp: 'デビュー戦',
        tips: ['Focus on Speed training', 'Front Runner strategy works best'],
        difficulty: 'easy'
      },
      {
        id: 'ss2',
        year: 'Classic',
        half: 'First Half',
        description_en: 'Win Yasuda Kinen (G1, 1600m)',
        description_jp: '安田記念 (G1, 1600m) 勝利',
        tips: ['700+ Speed recommended', 'Mile specialist skills'],
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'tokai_teio',
    name_en: 'Tokai Teio',
    name_jp: 'トウカイテイオー',
    goals: [
      {
        id: 'tt1',
        year: 'Junior',
        half: 'First Half',
        description_en: 'Make debut race',
        description_jp: 'デビュー戦',
        tips: ['Balanced training', 'Guts training helps'],
        difficulty: 'easy'
      },
      {
        id: 'tt2',
        year: 'Classic',
        half: 'First Half',
        description_en: 'Win Satsuki Sho (G1, 2000m)',
        description_jp: '皐月賞 (G1, 2000m) 勝利',
        tips: ['Balanced stats important', 'Get recovery skills'],
        difficulty: 'hard'
      }
    ]
  }
];

export default function TrainingGoals() {
  const [characterGoals, setCharacterGoals] = useState<CharacterGoals[]>(FALLBACK_CHARACTER_GOALS);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterGoals | null>(null);
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [showTips, setShowTips] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showJapanese, setShowJapanese] = useState(false);

  // Load training goals from JSON
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const response = await fetch('/data/training-goals.json');
        if (response.ok) {
          const data = await response.json();
          setCharacterGoals(data);
          setSelectedCharacter(data[0]);
        } else {
          console.warn('Failed to load training goals, using fallback');
          setSelectedCharacter(FALLBACK_CHARACTER_GOALS[0]);
        }
      } catch (error) {
        console.warn('Error loading training goals:', error);
        setSelectedCharacter(FALLBACK_CHARACTER_GOALS[0]);
      } finally {
        setIsLoading(false);
      }
    };
    loadGoals();
  }, []);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('completedGoals');
    if (saved) {
      setCompletedGoals(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleGoalCompletion = (goalId: string) => {
    const newCompleted = new Set(completedGoals);
    if (newCompleted.has(goalId)) {
      newCompleted.delete(goalId);
    } else {
      newCompleted.add(goalId);
    }
    setCompletedGoals(newCompleted);
    localStorage.setItem('completedGoals', JSON.stringify(Array.from(newCompleted)));
  };

  const toggleGoalExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const getCompletionRate = () => {
    if (!selectedCharacter) return 0;
    const characterGoalIds = selectedCharacter.goals.map(g => g.id);
    const completed = characterGoalIds.filter(id => completedGoals.has(id)).length;
    return Math.round((completed / characterGoalIds.length) * 100);
  };

  const getGoalDescription = (goal: Goal) => {
    if (showJapanese && goal.description_jp) {
      return goal.description_jp;
    }
    return goal.description_en;
  };

  const getCharacterName = (character: CharacterGoals) => {
    if (showJapanese && character.name_jp) {
      return character.name_jp;
    }
    return character.name_en;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading training goals...</span>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div className="text-center py-12 text-gray-500">
        No training goals available
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getYearColor = (year: string) => {
    switch (year) {
      case 'Junior': return 'bg-blue-500';
      case 'Classic': return 'bg-purple-500';
      case 'Senior': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Select Character
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showJapanese}
                onChange={(e) => setShowJapanese(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">日本語</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTips}
                onChange={(e) => setShowTips(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Tips</span>
            </label>
            <button
              onClick={() => {
                setCompletedGoals(new Set());
                localStorage.removeItem('completedGoals');
              }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Reset All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
          {characterGoals.map(character => (
            <button
              key={character.id}
              onClick={() => setSelectedCharacter(character)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedCharacter?.id === character.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{getCharacterName(character)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {character.goals.filter(g => completedGoals.has(g.id)).length}/{character.goals.length} completed
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h3 className="text-xl font-bold">{getCharacterName(selectedCharacter)} Training Goals</h3>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">Progress:</div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${getCompletionRate()}%` }}
              />
            </div>
            <span className="font-bold text-sm">{getCompletionRate()}%</span>
          </div>
        </div>

        <div className="space-y-4">
          {selectedCharacter.goals.map((goal, index) => (
            <div
              key={goal.id}
              className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all ${
                completedGoals.has(goal.id) ? 'opacity-75' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleGoalCompletion(goal.id)}
                      className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                        completedGoals.has(goal.id)
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {completedGoals.has(goal.id) && <Check className="w-4 h-4 text-white" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${getYearColor(goal.year)}`}>
                          {goal.year}
                        </span>
                        <span className="text-xs text-gray-500">{goal.half}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(goal.difficulty)}`}>
                          {goal.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${completedGoals.has(goal.id) ? 'line-through text-gray-500' : ''}`}>
                          Goal {index + 1}: {getGoalDescription(goal)}
                        </p>
                        
                        {goal.tips.length > 0 && showTips && (
                          <button
                            onClick={() => toggleGoalExpansion(goal.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedGoals.has(goal.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {showTips && expandedGoals.has(goal.id) && goal.tips.length > 0 && (
                  <div className="mt-3 pl-9">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          {goal.tips.map((tip, i) => (
                            <p key={i} className="text-sm text-gray-700">• {tip}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-600" />
            Training Schedule Overview
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600">Junior Year</div>
              <div className="text-gray-600">Foundation building, debut race</div>
            </div>
            <div>
              <div className="font-medium text-purple-600">Classic Year</div>
              <div className="text-gray-600">Triple Crown races, peak performance</div>
            </div>
            <div>
              <div className="font-medium text-orange-600">Senior Year</div>
              <div className="text-gray-600">Final challenges, legacy races</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}