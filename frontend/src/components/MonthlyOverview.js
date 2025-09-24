import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Plus, X, Edit3, Sparkles, Play, Pause, RotateCcw } from "lucide-react";
import { defaultContentPillars, mockMonthlyData } from "../data/mock";

const MonthlyOverview = ({ monthKey, monthlyData, setMonthlyData }) => {
  const [contentPillars, setContentPillars] = useState([]);
  const [newPillar, setNewPillar] = useState("");
  const [isAddingPillar, setIsAddingPillar] = useState(false);
  
  // Breathwork session state
  const [breathworkActive, setBreathworkActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold1, exhale, hold2
  const [breathCount, setBreathCount] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [customAffirmations, setCustomAffirmations] = useState("");
  
  // Posting plan state
  const [postingPlan, setPostingPlan] = useState({
    totalFeedPosts: "",
    totalStories: "",
    formats: {
      staticPhotos: { enabled: false, count: "", subcategories: { lifestyle: false, product: false, behindScenes: false }, notes: "" },
      carousels: { enabled: false, count: "", subcategories: { 
        educational: false, storytelling: false, photoDump: false, tipsList: false, 
        processBts: false, caseStudy: false, mythVsTruth: false, quoteStack: false,
        infographic: false, promoLaunch: false, comparison: false, visionBoard: false 
      }, notes: "" },
      graphics: { enabled: false, count: "", subcategories: { quotes: false, tips: false, announcements: false, stats: false }, notes: "" },
      reels: { enabled: false, count: "", subcategories: { talkingToCamera: false, voiceover: false, bRoll: false, trendingAudio: false }, notes: "" },
      lives: { enabled: false, count: "", subcategories: { qna: false, interviews: false, workshops: false }, notes: "" },
      signatureSeries: { enabled: false, count: "", subcategories: { weeklySeries: false, podcastClips: false }, notes: "" },
      memes: { enabled: false, count: "", notes: "" },
      ugc: { enabled: false, count: "", subcategories: { clientResults: false, reviews: false }, notes: "" },
      collaborations: { enabled: false, count: "", subcategories: { coCreated: false, collabs: false }, notes: "" },
      ads: { enabled: false, count: "", notes: "" }
    },
    storyFormats: {
      faq: { enabled: false, count: "", notes: "" },
      tips: { enabled: false, count: "", notes: "" },
      promo: { enabled: false, count: "", notes: "" },
      leadMagnet: { enabled: false, count: "", notes: "" },
      poll: { enabled: false, count: "", notes: "" },
      behindScenes: { enabled: false, count: "", notes: "" },
      dayInLife: { enabled: false, count: "", notes: "" },
      repost: { enabled: false, count: "", notes: "" },
      memesEntertainment: { enabled: false, count: "", notes: "" },
      connection: { enabled: false, count: "", notes: "" }
    }
  });

  const currentData = monthlyData[monthKey] || {
    goals: mockMonthlyData.goals,
    themes: mockMonthlyData.themes,
    metrics: mockMonthlyData.metrics,
    events: mockMonthlyData.events,
    notes: mockMonthlyData.notes,
    revenueGoals: mockMonthlyData.revenueGoals,
    contentPillars: [...defaultContentPillars]
  };

  useEffect(() => {
    setContentPillars(currentData.contentPillars || [...defaultContentPillars]);
    
    // Load posting plan data
    if (currentData.postingPlan) {
      setPostingPlan(currentData.postingPlan);
    }
    
    // Load custom affirmations if saved
    if (currentData.customAffirmations) {
      setCustomAffirmations(currentData.customAffirmations);
    }
  }, [monthKey]);

  const updateField = (field, value) => {
    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: {
        ...currentData,
        [field]: value
      }
    }));
  };

  // Posting plan functions
  const updatePostingPlan = (field, value) => {
    const newPlan = { ...postingPlan, [field]: value };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const updateFormatEnabled = (formatKey, enabled) => {
    const newPlan = {
      ...postingPlan,
      formats: {
        ...postingPlan.formats,
        [formatKey]: {
          ...postingPlan.formats[formatKey],
          enabled: enabled
        }
      }
    };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const updateFormatCount = (formatKey, count) => {
    const newPlan = {
      ...postingPlan,
      formats: {
        ...postingPlan.formats,
        [formatKey]: {
          ...postingPlan.formats[formatKey],
          count: count
        }
      }
    };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const updateFormatNotes = (formatKey, notes) => {
    const newPlan = {
      ...postingPlan,
      formats: {
        ...postingPlan.formats,
        [formatKey]: {
          ...postingPlan.formats[formatKey],
          notes: notes
        }
      }
    };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const updateSubcategory = (formatKey, subcategoryKey, enabled) => {
    const newPlan = {
      ...postingPlan,
      formats: {
        ...postingPlan.formats,
        [formatKey]: {
          ...postingPlan.formats[formatKey],
          subcategories: {
            ...postingPlan.formats[formatKey].subcategories,
            [subcategoryKey]: enabled
          }
        }
      }
    };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const calculateTotalPosts = () => {
    return Object.values(postingPlan.formats).reduce((total, format) => {
      if (format.enabled && format.count) {
        return total + (parseInt(format.count) || 0);
      }
      return total;
    }, 0);
  };

  const updateStoryFormatEnabled = (formatKey, enabled) => {
    const newPlan = {
      ...postingPlan,
      storyFormats: {
        ...postingPlan.storyFormats,
        [formatKey]: {
          ...postingPlan.storyFormats[formatKey],
          enabled: enabled
        }
      }
    };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const updateStoryFormatCount = (formatKey, count) => {
    const newPlan = {
      ...postingPlan,
      storyFormats: {
        ...postingPlan.storyFormats,
        [formatKey]: {
          ...postingPlan.storyFormats[formatKey],
          count: count
        }
      }
    };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const updateStoryFormatNotes = (formatKey, notes) => {
    const newPlan = {
      ...postingPlan,
      storyFormats: {
        ...postingPlan.storyFormats,
        [formatKey]: {
          ...postingPlan.storyFormats[formatKey],
          notes: notes
        }
      }
    };
    setPostingPlan(newPlan);
    updateField('postingPlan', newPlan);
  };

  const calculateTotalStories = () => {
    return Object.values(postingPlan.storyFormats).reduce((total, format) => {
      if (format.enabled && format.count) {
        return total + (parseInt(format.count) || 0);
      }
      return total;
    }, 0);
  };

  const addContentPillar = () => {
    if (newPillar.trim()) {
      const updatedPillars = [...contentPillars, newPillar.trim()];
      setContentPillars(updatedPillars);
      updateField('contentPillars', updatedPillars);
      setNewPillar("");
      setIsAddingPillar(false);
    }
  };

  const removePillar = (index) => {
    const updatedPillars = contentPillars.filter((_, i) => i !== index);
    setContentPillars(updatedPillars);
    updateField('contentPillars', updatedPillars);
  };

  const editPillar = (index, newValue) => {
    const updatedPillars = [...contentPillars];
    updatedPillars[index] = newValue;
    setContentPillars(updatedPillars);
    updateField('contentPillars', updatedPillars);
  };

  // Breathwork functions
  const startBreathwork = () => {
    setBreathworkActive(true);
    setBreathPhase('inhale');
    setBreathCount(4);
    setCycleCount(0);
    setTimeRemaining(180);
  };

  const stopBreathwork = () => {
    setBreathworkActive(false);
    setBreathPhase('inhale');
    setBreathCount(4);
    setCycleCount(0);
    setTimeRemaining(180);
  };

  useEffect(() => {
    if (!breathworkActive) return;

    const interval = setInterval(() => {
      // Countdown overall timer
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setBreathworkActive(false);
          return 180;
        }
        return prev - 1;
      });

      // Handle breath phase timing (4 seconds per phase)
      setBreathCount(prev => {
        if (prev <= 1) {
          // Move to next phase after 4 seconds
          setBreathPhase(currentPhase => {
            switch (currentPhase) {
              case 'inhale': return 'hold1';
              case 'hold1': return 'exhale';
              case 'exhale': return 'hold2';
              case 'hold2': 
                setCycleCount(c => c + 1); // Complete cycle (16 seconds total)
                return 'inhale';
              default: return 'inhale';
            }
          });
          return 4; // Reset to 4 seconds for next phase
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathworkActive]);

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return 'Breathe In';
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Regulation Section */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#bb9477]/10 to-[#472816]/10">
        <CardHeader className="bg-gradient-to-r from-[#bb9477] to-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Content Regulation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#472816] mb-2">
                "Regulate before you create"
              </h3>
              <div className="text-[#3f2d1d] space-y-3 max-w-2xl mx-auto">
                <p>
                  Remember — a grounded nervous system is the key to creating aligned content, 
                  breaking through success blocks, and putting out the energy your dream audience 
                  is waiting to connect with.
                </p>
                <p>
                  Before you start planning, take a moment to reset. Do a quick 3-minute breathwork 
                  exercise to regulate and activate your energy so you can show up fully aligned.
                </p>
                <p>
                  Tap the button below to begin your breathwork session. While you breathe, gently 
                  tap your collarbone or wrist and repeat these affirmations (or add your own to 
                  anchor the energy you want to create):
                </p>
              </div>
            </div>
            
            {/* Affirmations */}
            <div className="bg-white/60 rounded-lg p-4 border border-[#bb9477]/30">
              <h4 className="font-semibold text-[#472816] mb-3 text-center">Suggested Affirmations:</h4>
              <div className="italic text-[#472816] text-sm space-y-1 text-center mb-4">
                <p>"My content makes me bank."</p>
                <p>"I know exactly what I need to post to attract my dream clients."</p>
                <p>"It's safe for me to be seen and have a successful business."</p>
                <p>"It's fun and easy for me to plan my content."</p>
                <p>"Everything I desire is unfolding for me in divine timing."</p>
              </div>
              
              <div className="border-t border-[#bb9477]/30 pt-4">
                <label className="block text-sm font-medium text-[#472816] mb-2">
                  Add Your Own Affirmations:
                </label>
                <Textarea
                  value={customAffirmations}
                  onChange={(e) => setCustomAffirmations(e.target.value)}
                  placeholder="Write your personal affirmations here... (e.g., 'I attract my ideal clients effortlessly', 'My content creates abundance')"
                  className="border-[#bb9477]/50 focus:border-[#472816] resize-none"
                  rows={3}
                />
                <p className="text-xs text-[#3f2d1d]/60 mt-1">
                  These will be displayed during your breathwork session for you to repeat.
                </p>
              </div>
            </div>

            {/* Breathwork Session */}
            {!breathworkActive ? (
              <div className="text-center">
                <Button
                  onClick={startBreathwork}
                  className="bg-gradient-to-r from-[#bb9477] to-[#472816] hover:from-[#a67c5a] hover:to-[#3f2d1d] text-white text-lg px-8 py-3 rounded-full shadow-lg transform transition hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Begin 3-Minute Breathwork Session
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white/80 rounded-lg p-6 border-2 border-[#bb9477]">
                  <div className="text-6xl font-bold text-[#472816] mb-2">
                    {breathCount}
                  </div>
                  <div className="text-xl font-semibold text-[#3f2d1d] mb-4">
                    {getBreathInstruction()}
                  </div>
                  <div className="flex justify-center items-center gap-4 text-sm text-[#3f2d1d] mb-4">
                    <span>Cycle: {cycleCount}</span>
                    <span>•</span>
                    <span>Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                  </div>
                  
                  {/* Display affirmations during session */}
                  {customAffirmations && (
                    <div className="bg-[#bb9477]/10 rounded-lg p-3 mt-4">
                      <p className="text-xs text-[#472816] font-medium mb-2">Your Affirmations:</p>
                      <div className="text-sm italic text-[#3f2d1d] leading-relaxed">
                        {customAffirmations.split('\n').map((line, index) => (
                          line.trim() && (
                            <p key={index} className="mb-1">"{line.trim()}"</p>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-[#3f2d1d]/60 mt-3">
                    💫 Gently tap your collarbone or wrist while repeating your affirmations
                  </div>
                </div>
                <Button
                  onClick={stopBreathwork}
                  variant="outline"
                  className="border-[#bb9477] text-[#472816] hover:bg-[#bb9477]/10"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Pillars */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Content Pillars
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 mb-4">
            {contentPillars.map((pillar, index) => (
              <div key={index} className="group relative">
                <Badge 
                  variant="outline" 
                  className="bg-[#bb9477]/10 text-[#3f2d1d] border-[#bb9477] px-4 py-2 text-sm hover:bg-[#bb9477]/20 transition-colors"
                >
                  <input
                    className="bg-transparent border-none outline-none min-w-0"
                    value={pillar}
                    onChange={(e) => editPillar(index, e.target.value)}
                    onBlur={() => updateField('contentPillars', contentPillars)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePillar(index)}
                    className="ml-2 h-4 w-4 p-0 text-[#3f2d1d] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              </div>
            ))}
          </div>
          
          {isAddingPillar ? (
            <div className="flex gap-2 items-center">
              <Input
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                placeholder="Enter new content pillar..."
                className="flex-1 border-[#bb9477]/50 focus:border-[#472816]"
                onKeyPress={(e) => e.key === 'Enter' && addContentPillar()}
              />
              <Button onClick={addContentPillar} className="bg-[#bb9477] hover:bg-[#472816] text-white">
                Add
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingPillar(false)}
                className="border-[#bb9477] text-[#3f2d1d]"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsAddingPillar(true)}
              className="border-[#bb9477] text-[#3f2d1d] hover:bg-[#bb9477]/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pillar
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Posting Plan */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Posting Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Total Goals for Feed Posts Only */}
          <div className="mb-6">
            <div>
              <label className="block text-sm font-medium text-[#472816] mb-2">
                Total Feed Posts This Month
              </label>
              <Input
                type="number"
                value={postingPlan.totalFeedPosts}
                onChange={(e) => updatePostingPlan('totalFeedPosts', e.target.value)}
                placeholder="e.g., 20"
                className="border-[#bb9477]/50 focus:border-[#472816] max-w-xs"
              />
            </div>
          </div>

          {/* Content Formats */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#472816] border-b border-[#bb9477]/30 pb-2">
              Content Formats & Types
            </h3>

            {/* Static Photos */}
            <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={postingPlan.formats.staticPhotos.enabled}
                    onChange={(e) => updateFormatEnabled('staticPhotos', e.target.checked)}
                    className="rounded border-[#bb9477] text-[#472816]"
                  />
                  <h4 className="font-semibold text-[#472816]">Static Photos</h4>
                </div>
                {postingPlan.formats.staticPhotos.enabled && (
                  <Input
                    type="number"
                    value={postingPlan.formats.staticPhotos.count}
                    onChange={(e) => updateFormatCount('staticPhotos', e.target.value)}
                    placeholder="Count"
                    className="w-20 h-8 text-sm border-[#bb9477]/50"
                  />
                )}
              </div>
              
              {postingPlan.formats.staticPhotos.enabled && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { key: 'lifestyle', label: 'Lifestyle' },
                      { key: 'product', label: 'Product' },
                      { key: 'behindScenes', label: 'Behind-the-scenes' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={postingPlan.formats.staticPhotos.subcategories[key]}
                          onChange={(e) => updateSubcategory('staticPhotos', key, e.target.checked)}
                          className="rounded text-[#472816]"
                        />
                        <span className="text-[#3f2d1d]">{label}</span>
                      </label>
                    ))}
                  </div>
                  <Textarea
                    value={postingPlan.formats.staticPhotos.notes}
                    onChange={(e) => updateFormatNotes('staticPhotos', e.target.value)}
                    placeholder="Notes & ideas for static photos..."
                    className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                    rows={2}
                  />
                </>
              )}
            </div>

            {/* Carousels */}
            <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={postingPlan.formats.carousels.enabled}
                    onChange={(e) => updateFormatEnabled('carousels', e.target.checked)}
                    className="rounded border-[#bb9477] text-[#472816]"
                  />
                  <h4 className="font-semibold text-[#472816]">Carousels</h4>
                </div>
                {postingPlan.formats.carousels.enabled && (
                  <Input
                    type="number"
                    value={postingPlan.formats.carousels.count}
                    onChange={(e) => updateFormatCount('carousels', e.target.value)}
                    placeholder="Count"
                    className="w-20 h-8 text-sm border-[#bb9477]/50"
                  />
                )}
              </div>
              
              {postingPlan.formats.carousels.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {[
                      { key: 'educational', label: 'Educational / How-To – step-by-step guides, frameworks, tutorials' },
                      { key: 'storytelling', label: 'Storytelling / Journey – personal story, client case studies, before/after' },
                      { key: 'photoDump', label: 'Photo Dump / Lifestyle – casual behind-the-scenes, event recaps, authentic moments' },
                      { key: 'tipsList', label: 'Tips / Lists – "5 Ways To…", "3 Mistakes To Avoid", quick hacks' },
                      { key: 'processBts', label: 'Process / Behind-the-Scenes – how you work, creative process, product creation' },
                      { key: 'caseStudy', label: 'Case Study / Proof – results, testimonials, transformations' },
                      { key: 'mythVsTruth', label: 'Myth vs. Truth – debunking industry misconceptions' },
                      { key: 'quoteStack', label: 'Quote Stack – multiple motivational or thought-leader quotes in one swipe' },
                      { key: 'infographic', label: 'Infographic / Data – stats, charts, visual breakdowns' },
                      { key: 'promoLaunch', label: 'Promo / Launch – highlight your offer, event, or announcement in swipes' },
                      { key: 'comparison', label: 'Comparison / Before & After – side-by-sides or "then vs. now" moments' },
                      { key: 'visionBoard', label: 'Vision / Manifestation Boards – inspiration carousels to attract dream clients' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-start gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={postingPlan.formats.carousels.subcategories[key]}
                          onChange={(e) => updateSubcategory('carousels', key, e.target.checked)}
                          className="rounded text-[#472816] mt-1 flex-shrink-0"
                        />
                        <span className="text-[#3f2d1d] leading-tight">{label}</span>
                      </label>
                    ))}
                  </div>
                  <Textarea
                    value={postingPlan.formats.carousels.notes}
                    onChange={(e) => updateFormatNotes('carousels', e.target.value)}
                    placeholder="Notes & ideas for carousels..."
                    className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                    rows={2}
                  />
                </>
              )}
            </div>

            {/* Graphics/Infographics */}
            <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={postingPlan.formats.graphics.enabled}
                    onChange={(e) => updateFormatEnabled('graphics', e.target.checked)}
                    className="rounded border-[#bb9477] text-[#472816]"
                  />
                  <h4 className="font-semibold text-[#472816]">Graphics / Infographics</h4>
                </div>
                {postingPlan.formats.graphics.enabled && (
                  <Input
                    type="number"
                    value={postingPlan.formats.graphics.count}
                    onChange={(e) => updateFormatCount('graphics', e.target.value)}
                    placeholder="Count"
                    className="w-20 h-8 text-sm border-[#bb9477]/50"
                  />
                )}
              </div>
              
              {postingPlan.formats.graphics.enabled && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { key: 'quotes', label: 'Quotes' },
                      { key: 'tips', label: 'Tips' },
                      { key: 'announcements', label: 'Announcements' },
                      { key: 'stats', label: 'Stats' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={postingPlan.formats.graphics.subcategories[key]}
                          onChange={(e) => updateSubcategory('graphics', key, e.target.checked)}
                          className="rounded text-[#472816]"
                        />
                        <span className="text-[#3f2d1d]">{label}</span>
                      </label>
                    ))}
                  </div>
                  <Textarea
                    value={postingPlan.formats.graphics.notes}
                    onChange={(e) => updateFormatNotes('graphics', e.target.value)}
                    placeholder="Notes & ideas for graphics/infographics..."
                    className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                    rows={2}
                  />
                </>
              )}
            </div>

            {/* Reels */}
            <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={postingPlan.formats.reels.enabled}
                    onChange={(e) => updateFormatEnabled('reels', e.target.checked)}
                    className="rounded border-[#bb9477] text-[#472816]"
                  />
                  <h4 className="font-semibold text-[#472816]">Reels (Short-Form Video)</h4>
                </div>
                {postingPlan.formats.reels.enabled && (
                  <Input
                    type="number"
                    value={postingPlan.formats.reels.count}
                    onChange={(e) => updateFormatCount('reels', e.target.value)}
                    placeholder="Count"
                    className="w-20 h-8 text-sm border-[#bb9477]/50"
                  />
                )}
              </div>
              
              {postingPlan.formats.reels.enabled && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { key: 'talkingToCamera', label: 'Talking to Camera' },
                      { key: 'voiceover', label: 'Voiceover' },
                      { key: 'bRoll', label: 'B-Roll Style' },
                      { key: 'trendingAudio', label: 'Trending Audio / Lip-Syncs' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={postingPlan.formats.reels.subcategories[key]}
                          onChange={(e) => updateSubcategory('reels', key, e.target.checked)}
                          className="rounded text-[#472816]"
                        />
                        <span className="text-[#3f2d1d]">{label}</span>
                      </label>
                    ))}
                  </div>
                  <Textarea
                    value={postingPlan.formats.reels.notes}
                    onChange={(e) => updateFormatNotes('reels', e.target.value)}
                    placeholder="Notes & ideas for reels..."
                    className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                    rows={2}
                  />
                </>
              )}
            </div>

            {/* Lives */}
            <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={postingPlan.formats.lives.enabled}
                    onChange={(e) => updateFormatEnabled('lives', e.target.checked)}
                    className="rounded border-[#bb9477] text-[#472816]"
                  />
                  <h4 className="font-semibold text-[#472816]">Lives</h4>
                </div>
                {postingPlan.formats.lives.enabled && (
                  <Input
                    type="number"
                    value={postingPlan.formats.lives.count}
                    onChange={(e) => updateFormatCount('lives', e.target.value)}
                    placeholder="Count"
                    className="w-20 h-8 text-sm border-[#bb9477]/50"
                  />
                )}
              </div>
              
              {postingPlan.formats.lives.enabled && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { key: 'qna', label: 'Q&A' },
                      { key: 'interviews', label: 'Interviews' },
                      { key: 'workshops', label: 'Workshops' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={postingPlan.formats.lives.subcategories[key]}
                          onChange={(e) => updateSubcategory('lives', key, e.target.checked)}
                          className="rounded text-[#472816]"
                        />
                        <span className="text-[#3f2d1d]">{label}</span>
                      </label>
                    ))}
                  </div>
                  <Textarea
                    value={postingPlan.formats.lives.notes}
                    onChange={(e) => updateFormatNotes('lives', e.target.value)}
                    placeholder="Notes & ideas for lives..."
                    className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                    rows={2}
                  />
                </>
              )}
            </div>

            {/* Signature Series */}
            <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={postingPlan.formats.signatureSeries.enabled}
                    onChange={(e) => updateFormatEnabled('signatureSeries', e.target.checked)}
                    className="rounded border-[#bb9477] text-[#472816]"
                  />
                  <h4 className="font-semibold text-[#472816]">Signature Series</h4>
                </div>
                {postingPlan.formats.signatureSeries.enabled && (
                  <Input
                    type="number"
                    value={postingPlan.formats.signatureSeries.count}
                    onChange={(e) => updateFormatCount('signatureSeries', e.target.value)}
                    placeholder="Count"
                    className="w-20 h-8 text-sm border-[#bb9477]/50"
                  />
                )}
              </div>
              
              {postingPlan.formats.signatureSeries.enabled && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { key: 'weeklySeries', label: 'Weekly series' },
                      { key: 'podcastClips', label: 'Podcast clips' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={postingPlan.formats.signatureSeries.subcategories[key]}
                          onChange={(e) => updateSubcategory('signatureSeries', key, e.target.checked)}
                          className="rounded text-[#472816]"
                        />
                        <span className="text-[#3f2d1d]">{label}</span>
                      </label>
                    ))}
                  </div>
                  <Textarea
                    value={postingPlan.formats.signatureSeries.notes}
                    onChange={(e) => updateFormatNotes('signatureSeries', e.target.value)}
                    placeholder="Notes & ideas for signature series..."
                    className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                    rows={2}
                  />
                </>
              )}
            </div>

            {/* Remaining formats without subcategories */}
            {[
              { key: 'memes', label: 'Memes / Relatable Content' },
              { key: 'ads', label: 'Ads / Promo Graphics' }
            ].map(({ key, label }) => (
              <div key={key} className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={postingPlan.formats[key].enabled}
                      onChange={(e) => updateFormatEnabled(key, e.target.checked)}
                      className="rounded border-[#bb9477] text-[#472816]"
                    />
                    <h4 className="font-semibold text-[#472816]">{label}</h4>
                  </div>
                  {postingPlan.formats[key].enabled && (
                    <Input
                      type="number"
                      value={postingPlan.formats[key].count}
                      onChange={(e) => updateFormatCount(key, e.target.value)}
                      placeholder="Count"
                      className="w-20 h-8 text-sm border-[#bb9477]/50"
                    />
                  )}
                </div>
                
                {postingPlan.formats[key].enabled && (
                  <Textarea
                    value={postingPlan.formats[key].notes}
                    onChange={(e) => updateFormatNotes(key, e.target.value)}
                    placeholder={`Notes & ideas for ${label.toLowerCase()}...`}
                    className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                    rows={2}
                  />
                )}
              </div>
            ))}

            {/* UGC and Collaborations with subcategories */}
            {[
              { 
                key: 'ugc', 
                label: 'UGC / Testimonials', 
                subcategories: [
                  { key: 'clientResults', label: 'Client results' },
                  { key: 'reviews', label: 'Reviews' }
                ]
              },
              { 
                key: 'collaborations', 
                label: 'Collaborations', 
                subcategories: [
                  { key: 'coCreated', label: 'Co-created posts' },
                  { key: 'collabs', label: 'Collabs with other accounts' }
                ]
              }
            ].map(({ key, label, subcategories }) => (
              <div key={key} className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={postingPlan.formats[key].enabled}
                      onChange={(e) => updateFormatEnabled(key, e.target.checked)}
                      className="rounded border-[#bb9477] text-[#472816]"
                    />
                    <h4 className="font-semibold text-[#472816]">{label}</h4>
                  </div>
                  {postingPlan.formats[key].enabled && (
                    <Input
                      type="number"
                      value={postingPlan.formats[key].count}
                      onChange={(e) => updateFormatCount(key, e.target.value)}
                      placeholder="Count"
                      className="w-20 h-8 text-sm border-[#bb9477]/50"
                    />
                  )}
                </div>
                
                {postingPlan.formats[key].enabled && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {subcategories.map(({ key: subKey, label: subLabel }) => (
                        <label key={subKey} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={postingPlan.formats[key].subcategories[subKey]}
                            onChange={(e) => updateSubcategory(key, subKey, e.target.checked)}
                            className="rounded text-[#472816]"
                          />
                          <span className="text-[#3f2d1d]">{subLabel}</span>
                        </label>
                      ))}
                    </div>
                    <Textarea
                      value={postingPlan.formats[key].notes}
                      onChange={(e) => updateFormatNotes(key, e.target.value)}
                      placeholder={`Notes & ideas for ${label.toLowerCase()}...`}
                      className="text-sm border-[#bb9477]/50 focus:border-[#472816] resize-none"
                      rows={2}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Total Counter */}
          <div className="mt-6 bg-gradient-to-r from-[#bb9477]/20 to-[#472816]/20 rounded-lg p-4 border-2 border-[#bb9477]/30">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#472816] mb-1">
                Total Planned Posts
              </h3>
              <div className="text-3xl font-bold text-[#472816]">
                {calculateTotalPosts()}
              </div>
              <p className="text-sm text-[#3f2d1d]/60">
                posts planned from selected formats
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planning Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="text-base md:text-lg">Monthly Goals</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Textarea
              value={currentData.goals}
              onChange={(e) => updateField('goals', e.target.value)}
              placeholder="What are your main goals for this month?"
              className="min-h-24 md:min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="text-base md:text-lg">Key Themes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Textarea
              value={currentData.themes}
              onChange={(e) => updateField('themes', e.target.value)}
              placeholder="What themes will you focus on?"
              className="min-h-24 md:min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="text-base md:text-lg">Success Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Textarea
              value={currentData.metrics}
              onChange={(e) => updateField('metrics', e.target.value)}
              placeholder="How will you measure success?"
              className="min-h-24 md:min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="text-base md:text-lg">Special Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Textarea
              value={currentData.events}
              onChange={(e) => updateField('events', e.target.value)}
              placeholder="Any special events, launches, or promotions?"
              className="min-h-24 md:min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="text-base md:text-lg">Revenue Goals</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Textarea
              value={currentData.revenueGoals}
              onChange={(e) => updateField('revenueGoals', e.target.value)}
              placeholder="What are your revenue targets?"
              className="min-h-24 md:min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="text-base md:text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Textarea
              value={currentData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any other thoughts or reminders?"
              className="min-h-24 md:min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyOverview;