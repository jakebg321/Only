"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Sparkles, 
  MessageCircle, 
  Shield, 
  User,
  Zap
} from 'lucide-react';

export default function PersonalitySetup() {
  const [personality, setPersonality] = useState({
    displayName: '',
    age: '',
    location: '',
    tone: 'FLIRTY',
    personalityTraits: [] as string[],
    interests: [] as string[],
    hobbies: [] as string[],
    responseStyle: 'Sexy and seductive',
    vocabularyLevel: 'casual',
    humorStyle: 'playful',
    flirtLevel: 5,
    explicitLevel: 2,
    boundaries: [] as string[],
    neverMentions: [] as string[],
    contentTypes: [] as string[],
    priceRanges: {
      customPhoto: '$50',
      customVideo: '$100',
      voiceMessage: '$25'
    },
    responseLength: 'medium',
    enableEmojis: true,
    emojiFrequency: 'frequent',
    useSlang: true,
    usePetNames: true,
    petNames: ['babe', 'sexy', 'baby', 'hottie'],
    subscriptionAcknowledgment: true,
    fantasyFocus: [] as string[],
    backstory: '',
    relationship: '',
    customInstructions: ''
  });

  const [currentInput, setCurrentInput] = useState({
    trait: '',
    interest: '',
    hobby: '',
    boundary: '',
    neverMention: '',
    contentType: '',
    petName: '',
    fantasy: ''
  });

  const addToList = (listName: keyof typeof personality, inputName: keyof typeof currentInput) => {
    const value = currentInput[inputName].trim();
    if (value && Array.isArray(personality[listName])) {
      setPersonality({
        ...personality,
        [listName]: [...(personality[listName] as string[]), value]
      });
      setCurrentInput({ ...currentInput, [inputName]: '' });
    }
  };

  const removeFromList = (listName: keyof typeof personality, index: number) => {
    if (Array.isArray(personality[listName])) {
      const newList = [...(personality[listName] as string[])];
      newList.splice(index, 1);
      setPersonality({ ...personality, [listName]: newList });
    }
  };

  const savePersonality = async () => {
    try {
      const response = await fetch('/api/creator/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personality)
      });
      if (response.ok) {
        const result = await response.json();
        alert(`Personality "${personality.displayName}" saved successfully! You can now select it in the chat mood selector.`);
        
        // Notify the chat page about the new personality by triggering a storage event
        // This is a simple way to communicate between pages without complex state management
        window.dispatchEvent(new CustomEvent('personalityUpdated', { 
          detail: { personality: result.data } 
        }));
      }
    } catch (error) {
      console.error('Error saving personality:', error);
      alert('Failed to save personality. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Personality Configuration
        </h1>

        {/* Basic Info */}
        <Card className="mb-6 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={personality.displayName}
                onChange={(e) => setPersonality({ ...personality, displayName: e.target.value })}
                placeholder="Sophia Rose"
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                value={personality.age}
                onChange={(e) => setPersonality({ ...personality, age: e.target.value })}
                placeholder="25"
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={personality.location}
                onChange={(e) => setPersonality({ ...personality, location: e.target.value })}
                placeholder="Los Angeles"
                className="bg-gray-800 border-gray-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Personality Traits */}
        <Card className="mb-6 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Personality & Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Personality Traits</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentInput.trait}
                    onChange={(e) => setCurrentInput({ ...currentInput, trait: e.target.value })}
                    placeholder="e.g., adventurous, mysterious, caring"
                    className="bg-gray-800 border-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && addToList('personalityTraits', 'trait')}
                  />
                  <Button onClick={() => addToList('personalityTraits', 'trait')} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personality.personalityTraits.map((trait, i) => (
                    <span key={i} className="bg-purple-600 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeFromList('personalityTraits', i)}>
                      {trait} ×
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Interests</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentInput.interest}
                    onChange={(e) => setCurrentInput({ ...currentInput, interest: e.target.value })}
                    placeholder="e.g., fitness, travel, photography"
                    className="bg-gray-800 border-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && addToList('interests', 'interest')}
                  />
                  <Button onClick={() => addToList('interests', 'interest')} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personality.interests.map((interest, i) => (
                    <span key={i} className="bg-purple-600 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeFromList('interests', i)}>
                      {interest} ×
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Style */}
        <Card className="mb-6 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Communication Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tone</Label>
                <select 
                  className="w-full bg-gray-800 border-gray-600 rounded p-2"
                  value={personality.tone}
                  onChange={(e) => setPersonality({ ...personality, tone: e.target.value })}
                >
                  <option value="FLIRTY">Flirty</option>
                  <option value="FRIENDLY">Friendly</option>
                  <option value="MYSTERIOUS">Mysterious</option>
                  <option value="PLAYFUL">Playful</option>
                  <option value="DOMINANT">Dominant</option>
                  <option value="SUBMISSIVE">Submissive</option>
                </select>
              </div>

              <div>
                <Label>Flirt Level (0-5)</Label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  value={personality.flirtLevel}
                  onChange={(e) => setPersonality({ ...personality, flirtLevel: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-400">Current: {personality.flirtLevel} - {personality.flirtLevel === 0 ? 'Friendly' : personality.flirtLevel <= 2 ? 'Flirty' : personality.flirtLevel <= 4 ? 'Very Flirty' : 'Extremely Flirty'}</span>
              </div>

              <div>
                <Label>Explicit Level (0-3)</Label>
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  value={personality.explicitLevel}
                  onChange={(e) => setPersonality({ ...personality, explicitLevel: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-400">Current: {personality.explicitLevel} - {personality.explicitLevel === 0 ? 'Teasing Only' : personality.explicitLevel === 1 ? 'Suggestive' : personality.explicitLevel === 2 ? 'Explicit' : 'Very Explicit'}</span>
              </div>

              <div>
                <Label>Response Length</Label>
                <select 
                  className="w-full bg-gray-800 border-gray-600 rounded p-2"
                  value={personality.responseLength}
                  onChange={(e) => setPersonality({ ...personality, responseLength: e.target.value as any })}
                >
                  <option value="short">Short & Sweet</option>
                  <option value="medium">Medium</option>
                  <option value="long">Detailed</option>
                </select>
              </div>

              <div>
                <Label>Emoji Usage</Label>
                <select 
                  className="w-full bg-gray-800 border-gray-600 rounded p-2"
                  value={personality.emojiFrequency}
                  onChange={(e) => setPersonality({ ...personality, emojiFrequency: e.target.value as any })}
                >
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="frequent">Frequent</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Label>Pet Names</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentInput.petName}
                  onChange={(e) => setCurrentInput({ ...currentInput, petName: e.target.value })}
                  placeholder="e.g., baby, darling, love"
                  className="bg-gray-800 border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('petNames', 'petName')}
                />
                <Button onClick={() => addToList('petNames', 'petName')} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {personality.petNames.map((name, i) => (
                  <span key={i} className="bg-pink-600 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeFromList('petNames', i)}>
                    {name} ×
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Label>Fantasy Specialties</Label>
              
              {/* Preset fantasy options */}
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'BDSM', 'Dominant', 'Submissive', 'Roleplay', 'Teasing', 
                    'Feet', 'Lingerie', 'Cosplay', 'GFE (Girlfriend Experience)', 
                    'Findom', 'JOI', 'CEI', 'Humiliation', 'Worship', 'Voyeur'
                  ].map((fantasy) => (
                    <button
                      key={fantasy}
                      onClick={() => {
                        if (!personality.fantasyFocus.includes(fantasy)) {
                          setPersonality({
                            ...personality,
                            fantasyFocus: [...personality.fantasyFocus, fantasy]
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        personality.fantasyFocus.includes(fantasy)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {fantasy}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <Input
                  value={currentInput.fantasy}
                  onChange={(e) => setCurrentInput({ ...currentInput, fantasy: e.target.value })}
                  placeholder="Add custom fantasy..."
                  className="bg-gray-800 border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('fantasyFocus', 'fantasy')}
                />
                <Button onClick={() => addToList('fantasyFocus', 'fantasy')} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {personality.fantasyFocus.map((fantasy, i) => (
                  <span key={i} className="bg-purple-600 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeFromList('fantasyFocus', i)}>
                    {fantasy} ×
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="subscriptionAck"
                checked={personality.subscriptionAcknowledgment}
                onChange={(e) => setPersonality({ ...personality, subscriptionAcknowledgment: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="subscriptionAck" className="cursor-pointer">
                Acknowledge subscribers are paying premium (builds gratitude & tension)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Boundaries */}
        <Card className="mb-6 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Boundaries & Safety
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Boundaries (What you won't discuss)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentInput.boundary}
                    onChange={(e) => setCurrentInput({ ...currentInput, boundary: e.target.value })}
                    placeholder="e.g., personal meetups, real phone number"
                    className="bg-gray-800 border-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && addToList('boundaries', 'boundary')}
                  />
                  <Button onClick={() => addToList('boundaries', 'boundary')} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personality.boundaries.map((boundary, i) => (
                    <span key={i} className="bg-red-600 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeFromList('boundaries', i)}>
                      {boundary} ×
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Never Mention (Forbidden topics)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentInput.neverMention}
                    onChange={(e) => setCurrentInput({ ...currentInput, neverMention: e.target.value })}
                    placeholder="e.g., ex-boyfriends, competitors"
                    className="bg-gray-800 border-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && addToList('neverMentions', 'neverMention')}
                  />
                  <Button onClick={() => addToList('neverMentions', 'neverMention')} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personality.neverMentions.map((item, i) => (
                    <span key={i} className="bg-red-600 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeFromList('neverMentions', i)}>
                      {item} ×
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backstory */}
        <Card className="mb-6 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Backstory & Custom Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backstory">Your Backstory</Label>
                <Textarea
                  id="backstory"
                  value={personality.backstory}
                  onChange={(e) => setPersonality({ ...personality, backstory: e.target.value })}
                  placeholder="Tell your story... What brought you to OnlyFans? What makes you unique?"
                  className="bg-gray-800 border-gray-600 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="customInstructions">Custom Instructions</Label>
                <Textarea
                  id="customInstructions"
                  value={personality.customInstructions}
                  onChange={(e) => setPersonality({ ...personality, customInstructions: e.target.value })}
                  placeholder="Any specific behaviors or responses you want your AI to follow..."
                  className="bg-gray-800 border-gray-600 min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button 
            onClick={savePersonality}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Personality Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}