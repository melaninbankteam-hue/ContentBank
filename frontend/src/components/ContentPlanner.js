import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, BarChart3, Lightbulb, Instagram, Target, Plus } from "lucide-react";
import MonthlyOverview from "./MonthlyOverview";
import ContentCalendar from "./ContentCalendar";
import ContentTracker from "./ContentTracker";
import InstagramPreview from "./InstagramPreview";
import BrainstormTab from "./BrainstormTab";
import AnalyticsTab from "./AnalyticsTab";

const ContentPlanner = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  // Load data from localStorage
  const [monthlyData, setMonthlyData] = useState(() => {
    const saved = localStorage.getItem('melaninbank-monthly');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('melaninbank-monthly', JSON.stringify(monthlyData));
  }, [monthlyData]);

  const currentMonthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/10">
      {/* Header */}
      <div className="bg-[#472816] text-[#fffaf1] py-8 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">The Melanin Bank</h1>
          <p className="text-[#bb9477] text-lg">Content Planner</p>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mt-6 bg-[#3f2d1d]/50 rounded-lg px-4 py-3">
            <Button 
              variant="ghost" 
              onClick={() => navigateMonth('prev')}
              className="text-[#fffaf1] hover:bg-[#bb9477]/20"
            >
              ← Previous
            </Button>
            <h2 className="text-2xl font-semibold">{formatMonthYear(currentMonth)}</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigateMonth('next')}
              className="text-[#fffaf1] hover:bg-[#bb9477]/20"
            >
              Next →
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#3f2d1d] mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              <Target className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="tracker" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tracker
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              <Instagram className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="brainstorm" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              <Lightbulb className="w-4 h-4 mr-2" />
              Brainstorm
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <MonthlyOverview 
              monthKey={currentMonthKey}
              monthlyData={monthlyData}
              setMonthlyData={setMonthlyData}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <ContentCalendar 
              currentMonth={currentMonth}
              monthlyData={monthlyData}
              setMonthlyData={setMonthlyData}
            />
          </TabsContent>

          <TabsContent value="tracker">
            <ContentTracker 
              monthlyData={monthlyData}
            />
          </TabsContent>

          <TabsContent value="preview">
            <InstagramPreview 
              monthlyData={monthlyData}
              currentMonth={currentMonth}
            />
          </TabsContent>

          <TabsContent value="brainstorm">
            <BrainstormTab 
              monthKey={currentMonthKey}
              monthlyData={monthlyData}
              setMonthlyData={setMonthlyData}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab 
              monthKey={currentMonthKey}
              monthlyData={monthlyData}
              setMonthlyData={setMonthlyData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentPlanner;