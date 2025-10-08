import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Volume2, Eye, Hand, Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
];

const modalities = [
  { id: 'sound', icon: Volume2, label: '🔊 Sound', description: 'Audio-based learning' },
  { id: 'visual', icon: Eye, label: '👁️ Visual', description: 'Text and visual content' },
  { id: 'gesture', icon: Hand, label: '🖐️ Gesture/Sound', description: 'Interactive gestures' },
];

const emotionEmojis = ['😞', '😔', '😐', '😊', '😄'];
const emotionMessages = [
  "We're here for you 💙",
  "Gentle pace, gentle space 🌿",
  "Neutral is a great place to begin 🌈",
  "Feeling good—let's build on that ☀️",
  "You're glowing! Let's channel that energy 🚀",
];

interface WelcomeScreenProps {
  onComplete: (settings: {
    language: string;
    modality: string;
    emotion: number;
  }) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedModality, setSelectedModality] = useState('');
  const [emotionLevel, setEmotionLevel] = useState([2]);

  const handleContinue = () => {
    if (selectedLanguage && selectedModality) {
      onComplete({
        language: selectedLanguage,
        modality: selectedModality,
        emotion: emotionLevel[0],
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white text-black">
      <Card className="max-w-2xl w-full p-8 rounded-3xl shadow-xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">✨ Welcome to LearnAble ✨</h1>
          <p className="text-lg text-gray-600">
            Let's learn your way. We’ll adapt to your needs, emotions, and preferred learning style—
            whether you thrive with sound 🔊, visuals 👁️, or gestures 🖐️.
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">🌍 Choose your language</h2>
          <p className="text-sm text-gray-500 mb-4">Pick the voice that feels most like home.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="ghost"
                className={`group p-4 h-auto flex-col gap-2 border rounded-xl transition-all duration-300 ${
                  selectedLanguage === lang.code
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white scale-105 shadow-md'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedLanguage(lang.code)}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Modality Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">🎭 Select your learning style</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sound, visuals, or gestures—choose what sparks your curiosity.
          </p>
          <div className="grid gap-4">
            {modalities.map((modality) => (
              <Button
                key={modality.id}
                variant="ghost"
                className={`group p-4 h-auto justify-start border rounded-xl transition-all duration-300 ${
                  selectedModality === modality.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white scale-102 shadow-md'
                    : 'bg-black text-white border-gray-700 hover:bg-gray-800'
                }`}
                onClick={() => setSelectedModality(modality.id)}
              >
                <modality.icon className="mr-3 h-6 w-6 text-white" />
                <div className="text-left">
                  <div className="font-medium">{modality.label}</div>
                  <div className="text-sm text-gray-300">{modality.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Emotion Slider */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">💖 How are you feeling today?</h2>
          <p className="text-sm text-gray-500 mb-4">
            Slide to share your vibe—from low-key 😞 to radiant 😄. We'll meet you there.
          </p>
          <div className="bg-black p-6 rounded-2xl border border-gray-700">
            <div className="flex justify-between mb-4 text-2xl">
              {emotionEmojis.map((emoji, index) => (
                <span
                  key={index}
                  className={`transition-all duration-300 ${
                    emotionLevel[0] === index ? 'scale-125 text-yellow-400 animate-pulse' : 'scale-100 opacity-50'
                  }`}
                  title={emotionMessages[index]}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <Slider
              value={emotionLevel}
              onValueChange={setEmotionLevel}
              max={4}
              step={1}
              className="w-full"
            />
            <p className="mt-4 text-center text-sm italic text-gray-400">
              {emotionMessages[emotionLevel[0]]}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedLanguage || !selectedModality}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 transition-all duration-300 animate-gentle-bounce rounded-xl"
        >
          🚀 Continue to Learning
        </Button>

        <p className="mt-4 text-center text-sm text-gray-500 italic">
          ✨ Your journey starts here—with empathy, energy, and you.
        </p>
      </Card>
    </div>
  );
};
