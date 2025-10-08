import React, { useState } from 'react';
import { VoiceButton } from '@/components/VoiceButton';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Volume2,
  Eye,
  Hand,
  ThumbsUp,
  ThumbsDown,
  Play,
  Pause
} from 'lucide-react';

interface LearningModuleProps {
  currentTopic: string;
  modality: string;
  emotion: number;
  language: string;
  onEmotionFeedback: (feedback: 'up' | 'down', emotion?: string) => void;
  onModalitySwitch: (newModality: string) => void;
}

const modalityContent = {
  sound: {
    icon: Volume2,
    title: 'Audio Learning',
    description: 'Listen and learn with voice narration and audio cues',
    color: 'from-lavender to-lavender-deep',
  },
  visual: {
    icon: Eye,
    title: 'Visual Learning',
    description: 'Learn through text, animations, and visual content',
    color: 'from-mint to-mint-deep',
  },
  gesture: {
    icon: Hand,
    title: 'Interactive Learning',
    description: 'Learn through gestures, touch, and interactive elements',
    color: 'from-peach to-peach-deep',
  },
};

const emotionTags = [
  { id: 'confused', emoji: '😕', label: 'Confused' },
  { id: 'frustrated', emoji: '😤', label: 'Frustrated' },
  { id: 'curious', emoji: '🤔', label: 'Curious' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
];

export const LearningModule: React.FC<LearningModuleProps> = ({
  currentTopic,
  modality,
  emotion,
  language,
  onEmotionFeedback,
  onModalitySwitch,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(45);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const currentModality = modalityContent[modality as keyof typeof modalityContent];

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    onEmotionFeedback('up', emotionId);
  };

  const getContentForModality = () => {
    switch (modality) {
      case 'sound':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-lavender-soft to-lavender p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Audio Content</h3>
                <VoiceButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:scale-110"
                  voiceLabel={isPlaying ? "Pause audio" : "Play audio"}
                  voiceDescription={isPlaying ? "Pause the current audio content" : "Start playing the audio content"}
                  language={language}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </VoiceButton>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gradient-to-r from-lavender to-lavender-deep rounded-full flex items-center px-4">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-white">Voice narration active...</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            <p className="text-muted-foreground">
              Audio cues and voice narration guide you through the content.
              Use headphones for the best experience.
            </p>
          </div>
        );

      case 'visual':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-mint-soft to-mint p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">Visual Content</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 p-4 rounded-xl">
                  <div className="w-full h-20 bg-gradient-to-r from-mint-soft to-mint rounded-lg mb-2"></div>
                  <p className="text-sm">Interactive diagram</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <div className="w-full h-20 bg-gradient-to-r from-mint to-mint-deep rounded-lg mb-2"></div>
                  <p className="text-sm">Animated explanation</p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              Visual content with animations and interactive diagrams.
              High contrast mode available in settings.
            </p>
          </div>
        );

      case 'gesture':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-peach-soft to-peach p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">Interactive Content</h3>
              <div className="flex items-center justify-center h-32 bg-white/20 rounded-xl">
                <Hand className="h-16 w-16 text-white animate-bounce" />
              </div>
              <p className="text-center mt-4 text-sm">
                Tap, swipe, or use gestures to interact
              </p>
            </div>
            <p className="text-muted-foreground">
              Interactive gestures combined with sound feedback.
              Touch-friendly interface optimized for engagement.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic Header */}
      <Card className="card-adaptive p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Current Topic: {currentTopic}</h1>
            <p className="text-muted-foreground">
              Learning mode: {currentModality?.title}
            </p>
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${currentModality?.color}`}>
            <currentModality.icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <Progress value={progress} className="h-3 mb-4" />
        <p className="text-sm text-muted-foreground">{progress}% complete</p>
      </Card>

      {/* Dynamic Content Panel */}
      <Card className="card-adaptive p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Learning Content</h2>
          <p className="text-muted-foreground">{currentModality?.description}</p>
        </div>

        {getContentForModality()}

        {/* Try Different Mode Button */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Not working for you? Try a different learning mode:
          </p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(modalityContent).map(([key, modal]) => (
              key !== modality && (
                <VoiceButton
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => onModalitySwitch(key)}
                  className="hover:scale-105"
                  voiceLabel={`Switch to ${modal.title}`}
                  voiceDescription={modal.description}
                  language={language}
                >
                  <modal.icon className="h-4 w-4 mr-2" />
                  {modal.title}
                </VoiceButton>
              )
            ))}
          </div>
        </div>
      </Card>

      {/* Emotion Feedback */}
      <Card className="card-adaptive p-6">
        <h2 className="text-lg font-semibold mb-4">How are you feeling about this content?</h2>

        {/* Quick Thumbs */}
        <div className="flex gap-4 mb-6">
          <VoiceButton
            variant="outline"
            onClick={() => onEmotionFeedback('up')}
            className="hover:scale-110 hover:bg-green-50"
            voiceLabel="Good"
            voiceDescription="Mark this content as helpful and easy to understand"
            language={language}
          >
            <ThumbsUp className="h-5 w-5 mr-2" />
            Good
          </VoiceButton>
          <VoiceButton
            variant="outline"
            onClick={() => onEmotionFeedback('down')}
            className="hover:scale-110 hover:bg-red-50"
            voiceLabel="Needs Help"
            voiceDescription="Mark this content as difficult or confusing"
            language={language}
          >
            <ThumbsDown className="h-5 w-5 mr-2" />
            Needs Help
          </VoiceButton>
        </div>

        {/* Emotion Tags */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Or tell us more specifically:</p>
          <div className="flex gap-2 flex-wrap">
            {emotionTags.map((tag) => (
              <VoiceButton
                key={tag.id}
                variant={selectedEmotion === tag.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleEmotionSelect(tag.id)}
                className="hover:scale-105"
                voiceLabel={tag.label}
                voiceDescription={`Select ${tag.label} to express how you feel about this content`}
                language={language}
              >
                <span className="mr-2">{tag.emoji}</span>
                {tag.label}
              </VoiceButton>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};