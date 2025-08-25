import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, BarChart3, Lightbulb, Instagram, Target, Plus, LogOut, User } from "lucide-react";
import MonthlyOverview from "./MonthlyOverview";
import ContentCalendar from "./ContentCalendar";
import ContentTracker from "./ContentTracker";
import InstagramPreview from "./InstagramPreview";
import BrainstormTab from "./BrainstormTab";
import AnalyticsTab from "./AnalyticsTab";
import { useAuth } from "./LoginForm";

const ContentPlanner = () => {
  const { user, logout } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  // Load data from localStorage with user-specific key
  const [monthlyData, setMonthlyData] = useState(() => {
    const saved = localStorage.getItem(`csp-monthly-${user?.id}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage with user-specific key whenever data changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`csp-monthly-${user.id}`, JSON.stringify(monthlyData));
    }
  }, [monthlyData, user?.id]);

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
      {/* Header with Background Image - Mobile Optimized */}
      <div className="relative bg-[#472816] text-[#fffaf1] py-8 md:py-16 px-4 md:px-6 shadow-lg overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://customer-assets.emergentagent.com/job_insta-content-hub-1/artifacts/2g8c6i4z_Melanin%20bank%20event%20flyers%20%284%29.jpg')"
          }}
        ></div>
        
        {/* Content overlay */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 md:mb-8">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-3">Content Strategy Planner</h1>
              <p className="text-[#fffaf1]/80 text-sm md:text-lg mt-2 max-w-2xl">
                Empowering business owners and entrepreneurs to plan, create and execute their social media strategy with more ease and clarity.
              </p>
            </div>
            
            {/* Logo, User Info and Personality Image */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Mobile User Info */}
              <div className="flex md:hidden items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-[#bb9477] text-[#fffaf1] hover:bg-[#bb9477]/20"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout
                </Button>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-start gap-4">
                {/* Melanin Bank Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_insta-content-hub-1/artifacts/dof2dns5_Melanin%20bank%20sublogo.png"
                    alt="Melanin Bank"
                    className="w-16 h-16 object-contain filter brightness-0 invert"
                  />
                </div>
                
                {/* User Info */}
                <div className="text-right text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-[#bb9477] text-[#fffaf1] hover:bg-[#bb9477]/20"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Logout
                  </Button>
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

              {/* Mobile Logo */}
              <div className="flex md:hidden">
                <img 
                  src="https://customer-assets.emergentagent.com/job_insta-content-hub-1/artifacts/dof2dns5_Melanin%20bank%20sublogo.png"
                  alt="Melanin Bank"
                  className="w-12 h-12 object-contain filter brightness-0 invert"
                />
              </div>
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-[#3f2d1d]/50 backdrop-blur-sm rounded-lg px-4 md:px-6 py-3 md:py-4">
            <Button 
              variant="ghost" 
              onClick={() => navigateMonth('prev')}
              className="text-[#fffaf1] hover:bg-[#bb9477]/20 transition-colors text-sm md:text-base"
            >
              ← <span className="hidden sm:inline">Previous Month</span><span className="sm:hidden">Prev</span>
            </Button>
            <h2 className="text-lg md:text-2xl font-semibold text-center">{formatMonthYear(currentMonth)}</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigateMonth('next')}
              className="text-[#fffaf1] hover:bg-[#bb9477]/20 transition-colors text-sm md:text-base"
            >
              <span className="hidden sm:inline">Next Month</span><span className="sm:hidden">Next</span> →
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
            <TabsTrigger value="brainstorm" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              <Lightbulb className="w-4 h-4 mr-2" />
              Brainstorm
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

          <TabsContent value="brainstorm">
            <BrainstormTab 
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