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
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setBreathworkActive(false);
          return 180;
        }
        return prev - 1;
      });

      setBreathCount(prev => {
        if (prev <= 1) {
          // Move to next phase
          setBreathPhase(currentPhase => {
            switch (currentPhase) {
              case 'inhale': return 'hold1';
              case 'hold1': return 'exhale';
              case 'exhale': return 'hold2';
              case 'hold2': 
                setCycleCount(c => c + 1);
                return 'inhale';
              default: return 'inhale';
            }
          });
          return 4;
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
              <div className="italic text-[#472816] text-sm space-y-1 text-center">
                <p>"My content makes me bank."</p>
                <p>"I know exactly what I need to post to attract my dream clients."</p>
                <p>"It's safe for me to be seen and have a successful business."</p>
                <p>"It's fun and easy for me to plan my content."</p>
                <p>"Everything I desire is unfolding for me in divine timing."</p>
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
                  <div className="flex justify-center items-center gap-4 text-sm text-[#3f2d1d]">
                    <span>Cycle: {cycleCount}</span>
                    <span>•</span>
                    <span>Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
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