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

  return (
    <div className="space-y-6">
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