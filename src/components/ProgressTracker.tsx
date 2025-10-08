import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Award,
  Target,
  Calendar,
  Brain,
  Heart,
  Zap
} from 'lucide-react';

interface ProgressData {
  emotionalEngagement: number;
  learningMilestones: number;
  totalSessions: number;
  currentStreak: number;
  completedModules: string[];
  emotionalJourney: Array<{ date: string; emotion: number; topic: string }>;
}

interface ProgressTrackerProps {
  data: ProgressData;
  language: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ data, language }) => {
  const celebrateAchievement = () => {
    // Trigger confetti animation
    const confetti = document.createElement('div');
    confetti.className = 'fixed inset-0 pointer-events-none z-50';
    confetti.innerHTML = Array.from({ length: 50 }, (_, i) =>
      `<div class="absolute animate-bounce" style="
        left: ${Math.random() * 100}%; 
        top: ${Math.random() * 100}%; 
        animation-delay: ${i * 0.1}s;
        color: hsl(${Math.random() * 360}, 70%, 60%);
        font-size: ${Math.random() * 20 + 10}px;
      ">✨</div>`
    ).join('');

    document.body.appendChild(confetti);
    setTimeout(() => document.body.removeChild(confetti), 3000);
  };

  const getEmotionColor = (emotion: number) => {
    if (emotion <= 1) return 'from-emotion-sad to-sky-soft';
    if (emotion <= 2) return 'from-emotion-neutral to-mint-soft';
    return 'from-emotion-happy to-peach-soft';
  };

  const getEmotionEmoji = (emotion: number) => {
    const emojis = ['😞', '😔', '😐', '😊', '😄'];
    return emojis[Math.min(emotion, 4)];
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-adaptive p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emotional Engagement</p>
              <p className="text-2xl font-bold">{data.emotionalEngagement}%</p>
            </div>
            <div className="bg-gradient-to-r from-mint to-mint-deep p-3 rounded-2xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
          <Progress value={data.emotionalEngagement} className="mt-4 h-2" />
        </Card>

        <Card className="card-adaptive p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Learning Milestones</p>
              <p className="text-2xl font-bold">{data.learningMilestones}</p>
            </div>
            <div className="bg-gradient-to-r from-lavender to-lavender-deep p-3 rounded-2xl">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
          <Button
            onClick={celebrateAchievement}
            variant="ghost"
            size="sm"
            className="mt-4 w-full hover:scale-105"
          >
            🎉 Celebrate Achievement
          </Button>
        </Card>

        <Card className="card-adaptive p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{data.totalSessions}</p>
            </div>
            <div className="bg-gradient-to-r from-mint to-mint-deep p-3 rounded-2xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="card-adaptive p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{data.currentStreak} days</p>
            </div>
            <div className="bg-gradient-to-r from-peach to-peach-deep p-3 rounded-2xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Emotional Journey Graph */}
      <Card className="card-adaptive p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Emotional Learning Journey</h2>
            <p className="text-muted-foreground">Track your feelings and engagement over time</p>
          </div>
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>

        <div className="space-y-4">
          {/* Animated Graph Representation */}
          <div className="h-48 bg-gradient-adaptive rounded-2xl p-6 relative overflow-hidden">
            <div className="grid grid-cols-7 gap-2 h-full">
              {data.emotionalJourney.slice(-7).map((entry, index) => (
                <div key={index} className="flex flex-col items-center justify-end">
                  <div
                    className={`w-8 bg-gradient-to-t ${getEmotionColor(entry.emotion)} rounded-t-lg transition-all duration-1000 ease-out animate-fade-in-up`}
                    style={{
                      height: `${((entry.emotion + 1) / 5) * 100}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  ></div>
                  <div className="mt-2 text-center">
                    <div className="text-lg">{getEmotionEmoji(entry.emotion)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString([], { weekday: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SVG overlay for smooth curves */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--lavender))" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="hsl(var(--mint))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--peach))" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d={`M 50 ${200 - (data.emotionalJourney[0]?.emotion || 2) * 30} ${data.emotionalJourney.slice(1, 7).map((entry, i) =>
                  `L ${50 + (i + 1) * 50} ${200 - entry.emotion * 30}`
                ).join(' ')
                  }`}
                stroke="url(#emotionGradient)"
                strokeWidth="3"
                fill="none"
                className="animate-fade-in"
              />
            </svg>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emotion-sad rounded-full mr-2"></div>
              <span>Needs Support</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emotion-neutral rounded-full mr-2"></div>
              <span>Learning</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emotion-happy rounded-full mr-2"></div>
              <span>Thriving</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Completed Modules */}
      <Card className="card-adaptive p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Completed Modules</h2>
            <p className="text-muted-foreground">{data.completedModules.length} modules completed</p>
          </div>
          <Target className="h-6 w-6 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.completedModules.map((module, index) => (
            <div
              key={index}
              className="bg-gradient-adaptive p-4 rounded-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{module}</h3>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="bg-green-500 p-2 rounded-full">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          ))}

          {/* Add more modules placeholder */}
          <div className="border-2 border-dashed border-border p-4 rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">More modules coming soon!</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Goal */}
      <Card className="card-adaptive p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Weekly Goal</h2>
            <p className="text-muted-foreground">Keep up the great work!</p>
          </div>
          <Calendar className="h-6 w-6 text-primary" />
        </div>

        <div className="bg-gradient-emotional p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">5 of 7 sessions this week</span>
            <span className="text-white text-sm">71%</span>
          </div>
          <Progress value={71} className="h-3" />
        </div>
      </Card>
    </div>
  );
};