import React, { useState, useEffect } from 'react';
import { Target, Check, AlertCircle, Trophy, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface Goal {
  id: string;
  year: string;
  half: string;
  description: string;
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CharacterGoals {
  id: string;
  name: string;
  goals: Goal[];
}

const CHARACTER_GOALS: CharacterGoals[] = [
  {
    id: 'special_week',
    name: 'Special Week',
    goals: [
      {
        id: 'sw1',
        year: 'Junior',
        half: 'First Half',
        description: 'Make debut race',
        tips: ['Focus on Speed training', 'Aim for 300+ Speed stat'],
        difficulty: 'easy'
      },
      {
        id: 'sw2',
        year: 'Junior',
        half: 'Second Half',
        description: 'Win Hopeful Stakes (G1, 2000m)',
        tips: ['Need 400+ Speed, 300+ Stamina', 'Get acceleration skills'],
        difficulty: 'medium'
      },
      {
        id: 'sw3',
        year: 'Classic',
        half: 'First Half',
        description: 'Win Japanese Derby (G1, 2400m)',
        tips: ['Aim for 600+ Speed, 400+ Stamina', 'Power is important for this race'],
        difficulty: 'hard'
      },
      {
        id: 'sw4',
        year: 'Classic',
        half: 'Second Half',
        description: 'Win Japan Cup (G1, 2400m)',
        tips: ['Need balanced stats', 'Recovery skills help'],
        difficulty: 'hard'
      },
      {
        id: 'sw5',
        year: 'Senior',
        half: 'First Half',
        description: 'Win Tenno Sho Spring (G1, 3200m)',
        tips: ['Stamina > 600 required', 'Get stamina recovery skills'],
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'silence_suzuka',
    name: 'Silence Suzuka',
    goals: [
      {
        id: 'ss1',
        year: 'Junior',
        half: 'First Half',
        description: 'Make debut race',
        tips: ['Focus on Speed training', 'Escape strategy works best'],
        difficulty: 'easy'
      },
      {
        id: 'ss2',
        year: 'Junior',
        half: 'Second Half',
        description: '5th place or better in Asahi Hai (G1, 1600m)',
        tips: ['Speed focus', 'Escape position bonus'],
        difficulty: 'easy'
      },
      {
        id: 'ss3',
        year: 'Classic',
        half: 'First Half',
        description: 'Win Yasuda Kinen (G1, 1600m)',
        tips: ['700+ Speed recommended', 'Mile specialist skills'],
        difficulty: 'medium'
      },
      {
        id: 'ss4',
        year: 'Classic',
        half: 'Second Half',
        description: 'Win Mile Championship (G1, 1600m)',
        tips: ['Maintain high speed', 'Position keeping skills'],
        difficulty: 'medium'
      },
      {
        id: 'ss5',
        year: 'Senior',
        half: 'Full Year',
        description: 'Win 3 G1 races',
        tips: ['Focus on mile/medium races', 'Keep motivation high'],
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'tokai_teio',
    name: 'Tokai Teio',
    goals: [
      {
        id: 'tt1',
        year: 'Junior',
        half: 'First Half',
        description: 'Make debut race',
        tips: ['Balanced training', 'Guts training helps'],
        difficulty: 'easy'
      },
      {
        id: 'tt2',
        year: 'Junior',
        half: 'Second Half',
        description: 'Win Hopeful Stakes (G1, 2000m)',
        tips: ['Need good stamina', 'Lead or Betweener strategy'],
        difficulty: 'medium'
      },
      {
        id: 'tt3',
        year: 'Classic',
        half: 'First Half',
        description: 'Win Satsuki Sho (G1, 2000m)',
        tips: ['Balanced stats important', 'Get recovery skills'],
        difficulty: 'hard'
      },
      {
        id: 'tt4',
        year: 'Classic',
        half: 'Second Half',
        description: 'Win Japanese Derby (G1, 2400m)',
        tips: ['600+ Speed, 500+ Stamina', 'Guts helps in final stretch'],
        difficulty: 'hard'
      },
      {
        id: 'tt5',
        year: 'Senior',
        half: 'First Half',
        description: 'Win Arima Kinen (G1, 2500m)',
        tips: ['High stamina required', 'Never Give Up skill recommended'],
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'oguri_cap',
    name: 'Oguri Cap',
    goals: [
      {
        id: 'oc1',
        year: 'Junior',
        half: 'First Half',
        description: 'Make debut race',
        tips: ['Power training focus', 'Both turf and dirt aptitude helps'],
        difficulty: 'easy'
      },
      {
        id: 'oc2',
        year: 'Junior',
        half: 'Second Half',
        description: '3rd place or better in Mile Championship',
        tips: ['Mile aptitude important', 'Power and speed balance'],
        difficulty: 'medium'
      },
      {
        id: 'oc3',
        year: 'Classic',
        half: 'First Half',
        description: 'Win Yasuda Kinen (G1, 1600m)',
        tips: ['High speed required', 'Between runner position'],
        difficulty: 'medium'
      },
      {
        id: 'oc4',
        year: 'Classic',
        half: 'Second Half',
        description: 'Win Arima Kinen (G1, 2500m)',
        tips: ['Need stamina training', 'All-rounder build works'],
        difficulty: 'hard'
      },
      {
        id: 'oc5',
        year: 'Senior',
        half: 'Full Year',
        description: 'Win both Mile and Medium/Long G1 races',
        tips: ['Versatile build required', 'Focus on both speed and stamina'],
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'gold_ship',
    name: 'Gold Ship',
    goals: [
      {
        id: 'gs1',
        year: 'Junior',
        half: 'First Half',
        description: 'Make debut race',
        tips: ['Stamina and Power focus', 'Chase position preferred'],
        difficulty: 'easy'
      },
      {
        id: 'gs2',
        year: 'Junior',
        half: 'Second Half',
        description: 'Win Hopeful Stakes (G1, 2000m)',
        tips: ['Balanced stats', 'Random nature - save before race'],
        difficulty: 'medium'
      },
      {
        id: 'gs3',
        year: 'Classic',
        half: 'First Half',
        description: 'Win Satsuki Sho (G1, 2000m)',
        tips: ['High power helps', 'Chase skills recommended'],
        difficulty: 'hard'
      },
      {
        id: 'gs4',
        year: 'Classic',
        half: 'Second Half',
        description: 'Win Kikka Sho (G1, 3000m)',
        tips: ['700+ Stamina needed', 'Long distance skills crucial'],
        difficulty: 'hard'
      },
      {
        id: 'gs5',
        year: 'Senior',
        half: 'Full Year',
        description: 'Win Tenno Sho Spring and Takarazuka Kinen',
        tips: ['Focus on long races', 'Stamina recovery skills essential'],
        difficulty: 'hard'
      }
    ]
  }
];

export default function TrainingGoals() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterGoals>(CHARACTER_GOALS[0]);
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [showTips, setShowTips] = useState(true);

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
    const characterGoalIds = selectedCharacter.goals.map(g => g.id);
    const completed = characterGoalIds.filter(id => completedGoals.has(id)).length;
    return Math.round((completed / characterGoalIds.length) * 100);
  };

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
          <div className="flex items-center gap-4">
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {CHARACTER_GOALS.map(character => (
            <button
              key={character.id}
              onClick={() => setSelectedCharacter(character)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedCharacter.id === character.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{character.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {character.goals.filter(g => completedGoals.has(g.id)).length}/{character.goals.length} completed
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">{selectedCharacter.name} Training Goals</h3>
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
                          Goal {index + 1}: {goal.description}
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