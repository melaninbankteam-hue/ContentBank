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
      {/* Header with Background Image */}
      <div className="relative bg-[#472816] text-[#fffaf1] py-16 px-6 shadow-lg overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://customer-assets.emergentagent.com/job_insta-content-hub-1/artifacts/2g8c6i4z_Melanin%20bank%20event%20flyers%20%284%29.jpg')"
          }}
        ></div>
        
        {/* Content overlay */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-3">Content Strategy Planner</h1>
              <p className="text-[#fffaf1]/80 text-lg mt-2 max-w-2xl">
                Empowering business owners and entrepreneurs to plan, create and execute their social media strategy with more ease and clarity.
              </p>
            </div>
            
            {/* Logo and Personality Image */}
            <div className="hidden md:flex items-start gap-4">
              {/* Melanin Bank Logo */}
              <div className="flex-shrink-0">
                <img 
                  src="https://customer-assets.emergentagent.com/job_insta-content-hub-1/artifacts/dof2dns5_Melanin%20bank%20sublogo.png"
                  alt="Melanin Bank"
                  className="w-16 h-16 object-contain filter brightness-0 invert"
                />
              </div>
              
              {/* Personality Image */}
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#bb9477]/30 shadow-xl">
                <img 
                  src="https://customer-assets.emergentagent.com/job_insta-content-hub-1/artifacts/2g8c6i4z_Melanin%20bank%20event%20flyers%20%284%29.jpg"
                  alt="Content Strategy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-[#3f2d1d]/50 backdrop-blur-sm rounded-lg px-6 py-4">
            <Button 
              variant="ghost" 
              onClick={() => navigateMonth('prev')}
              className="text-[#fffaf1] hover:bg-[#bb9477]/20 transition-colors"
            >
              ← Previous Month
            </Button>
            <h2 className="text-2xl font-semibold">{formatMonthYear(currentMonth)}</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigateMonth('next')}
              className="text-[#fffaf1] hover:bg-[#bb9477]/20 transition-colors"
            >
              Next Month →
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