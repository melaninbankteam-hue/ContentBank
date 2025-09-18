import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Users, Eye, MessageCircle, TrendingUp, Share, Mail, Target, BarChart3, MousePointer } from "lucide-react";

const AnalyticsTab = ({ monthKey, monthlyData, setMonthlyData }) => {
  const currentData = monthlyData[monthKey] || {};
  const analytics = currentData.analytics || {};
  
  const [metrics, setMetrics] = useState({
    followers: analytics.followers || "",
    totalViews: analytics.totalViews || "",
    nonFollowerViews: analytics.nonFollowerViews || "",
    reach: analytics.reach || "",
    profileVisits: analytics.profileVisits || "",
    websiteClicks: analytics.websiteClicks || "",
    emailSubscribers: analytics.emailSubscribers || "",
    dmMessages: analytics.dmMessages || "",
    totalInteractions: analytics.totalInteractions || "",
    growthGoals: analytics.growthGoals || "Increase followers by 15% this month\nImprove engagement rate to 4%+\nGrow email list to 1000 subscribers\nIncrease course sales by 25%",
    performanceNotes: analytics.performanceNotes || "Educational Reels are performing best\nPosts with faces get 40% more engagement\nCarousel posts have highest save rates\nStory highlights driving profile visits",
    ...analytics
  });

  // Get previous month's data for growth calculation
  const getPreviousMonthData = () => {
    const [year, month] = monthKey.split('-').map(Number);
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthKey = `${prevYear}-${prevMonth}`;
    
    const prevData = monthlyData[prevMonthKey];
    return prevData?.analytics || {};
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return { percentage: 0, isPositive: true };
    const currentNum = parseInt(current) || 0;
    const previousNum = parseInt(previous) || 0;
    const growth = ((currentNum - previousNum) / previousNum) * 100;
    return {
      percentage: Math.abs(growth).toFixed(1),
      isPositive: growth >= 0
    };
  };

  const previousMetrics = getPreviousMonthData();

  useEffect(() => {
    // Load analytics data from localStorage and monthly data
    const storedData = localStorage.getItem(`analytics_${monthKey}`);
    const savedMetrics = storedData ? JSON.parse(storedData) : {};
    
    const combinedMetrics = {
      followers: savedMetrics.followers || analytics.followers || "",
      totalViews: savedMetrics.totalViews || analytics.totalViews || "",
      nonFollowerViews: savedMetrics.nonFollowerViews || analytics.nonFollowerViews || "",
      reach: savedMetrics.reach || analytics.reach || "",
      profileVisits: savedMetrics.profileVisits || analytics.profileVisits || "",
      websiteClicks: savedMetrics.websiteClicks || analytics.websiteClicks || "",
      emailSubscribers: savedMetrics.emailSubscribers || analytics.emailSubscribers || "",
      dmMessages: savedMetrics.dmMessages || analytics.dmMessages || "",
      totalInteractions: savedMetrics.totalInteractions || analytics.totalInteractions || ""
    };
    
    setMetrics(combinedMetrics);
  }, [monthKey]); // Only depend on monthKey, not all the analytics data

  // Separate useEffect for auto-saving to monthly data
  useEffect(() => {
    // Only save if metrics have actual values to avoid infinite loops
    const hasValues = Object.values(metrics).some(value => value !== "");
    if (hasValues) {
      const updatedMonthlyData = {
        ...monthlyData,
        [monthKey]: {
          ...currentData,
          analytics: {
            ...analytics,
            ...metrics,
            lastUpdated: new Date().toISOString()
          }
        }
      };
      setMonthlyData(updatedMonthlyData);
    }
  }, [metrics]); // Only depend on metrics to avoid circular dependencies

  const handleInputChange = (field, value) => {
    setMetrics(prev => {
      const newMetrics = {
        ...prev,
        [field]: value
      };
      // Save to localStorage immediately for persistence
      localStorage.setItem(`analytics_${monthKey}`, JSON.stringify(newMetrics));
      return newMetrics;
    });
  };

  // Melanin Bank brown color variations for each card
  const cardStyles = [
    // Row 1
    { from: '#5D4037', to: '#6D4C41' }, // Followers - Deep brown
    { from: '#8D6E63', to: '#A1887F' }, // Total Views - Medium brown  
    { from: '#8A6F5E', to: '#9E7B68' }, // Non-Follower Views - Warm brown
    // Row 2
    { from: '#7B5E57', to: '#8D6E63' }, // Reach - Rich brown
    { from: '#6F4E3F', to: '#7D5A4B' }, // Profile Visits - Dark brown
    { from: '#9B7B6C', to: '#A68B7B' }, // Website Clicks - Light brown
    // Row 3
    { from: '#6B4F44', to: '#785A4F' }, // Email Subscribers - Mocha brown
    { from: '#7A5D52', to: '#8A6B60' }, // DM Messages - Coffee brown
    { from: '#8B6F5E', to: '#9D7B6A' }  // Total Interactions - Caramel brown
  ];

  const MetricCard = ({ title, icon: Icon, value, field, previousValue, showGrowth = false, colorIndex }) => {
    const growth = calculateGrowth(value, previousValue);
    const cardStyle = cardStyles[colorIndex];
    
    return (
      <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br text-[#fffaf1]" style={{ background: `linear-gradient(to bottom right, ${cardStyle.from}, ${cardStyle.to})` }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#fffaf1]/80 text-sm font-medium">{title}</p>
              <p className="text-3xl font-bold">{value ? (parseInt(value) || 0).toLocaleString() : '0'}</p>
            </div>
            <Icon className="w-8 h-8 text-[#fffaf1]/80" />
          </div>
          
          {showGrowth && previousValue !== undefined && previousValue !== "" && (
            <div className="mb-4">
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-white/20 text-white border-white/30"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {growth.percentage}%
              </Badge>
            </div>
          )}
          
          <div className="bg-white/90 rounded p-3">
            <Input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="Enter value"
              className="border-[#bb9477]/50 focus:border-[#472816] w-full text-[#3f2d1d]"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Metrics Grid - 3x3 with Melanin Bank brown variations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Followers"
          icon={Users}
          value={metrics.followers}
          field="followers"
          previousValue={previousMetrics.followers}
          showGrowth={true}
          colorIndex={0}
        />
        
        <MetricCard
          title="Total Views"
          icon={Eye}
          value={metrics.totalViews}
          field="totalViews"
          previousValue={previousMetrics.totalViews}
          showGrowth={true}
          colorIndex={1}
        />
        
        <MetricCard
          title="Non-Follower Views"
          icon={Target}
          value={metrics.nonFollowerViews}
          field="nonFollowerViews"
          previousValue={previousMetrics.nonFollowerViews}
          showGrowth={false}
          colorIndex={2}
        />
        
        <MetricCard
          title="Reach"
          icon={BarChart3}
          value={metrics.reach}
          field="reach"
          previousValue={previousMetrics.reach}
          showGrowth={true}
          colorIndex={3}
        />
        
        <MetricCard
          title="Profile Visits"
          icon={MousePointer}
          value={metrics.profileVisits}
          field="profileVisits"
          previousValue={previousMetrics.profileVisits}
          showGrowth={false}
          colorIndex={4}
        />
        
        <MetricCard
          title="Website Clicks"
          icon={Share}
          value={metrics.websiteClicks}
          field="websiteClicks"
          previousValue={previousMetrics.websiteClicks}
          showGrowth={false}
          colorIndex={5}
        />
        
        <MetricCard
          title="Email Subscribers"
          icon={Mail}
          value={metrics.emailSubscribers}
          field="emailSubscribers"
          previousValue={previousMetrics.emailSubscribers}
          showGrowth={false}
          colorIndex={6}
        />
        
        <MetricCard
          title="DM Messages"
          icon={MessageCircle}
          value={metrics.dmMessages}
          field="dmMessages"
          previousValue={previousMetrics.dmMessages}
          showGrowth={false}
          colorIndex={7}
        />
        
        <MetricCard
          title="Total Interactions"
          icon={TrendingUp}
          value={metrics.totalInteractions}
          field="totalInteractions"
          previousValue={previousMetrics.totalInteractions}
          showGrowth={true}
          colorIndex={8}
        />
      </div>

      {/* Growth Summary - Chocolate Brown Header */}
      <Card className="border-[#bb9477]/30 shadow-lg">
        <CardHeader 
          className="text-white"
          style={{
            background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 100%)'
          }}
        >
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{calculateGrowth(metrics.followers, previousMetrics.followers).percentage}%
              </div>
              <div className="text-sm text-[#3f2d1d]">Followers Growth</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{calculateGrowth(metrics.totalViews, previousMetrics.totalViews).percentage}%
              </div>
              <div className="text-sm text-[#3f2d1d]">Views Growth</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{calculateGrowth(metrics.reach, previousMetrics.reach).percentage}%
              </div>
              <div className="text-sm text-[#3f2d1d]">Reach Growth</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{calculateGrowth(metrics.totalInteractions, previousMetrics.totalInteractions).percentage}%
              </div>
              <div className="text-sm text-[#3f2d1d]">Engagement Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Goals and Performance Notes - Chocolate Brown Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#bb9477]/30 shadow-lg">
          <CardHeader 
            className="text-white"
            style={{
              background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 100%)'
            }}
          >
            <CardTitle>Growth Goals</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <textarea
              value={metrics.growthGoals}
              onChange={(e) => handleInputChange('growthGoals', e.target.value)}
              placeholder="Increase followers by 15% this month&#10;Improve engagement rate to 4%+&#10;Grow email list to 1000 subscribers&#10;Increase course sales by 25%"
              rows={8}
              className="w-full p-3 border border-[#bb9477]/50 rounded-md focus:border-[#472816] focus:outline-none resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg">
          <CardHeader 
            className="text-white"
            style={{
              background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 100%)'
            }}
          >
            <CardTitle>Performance Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <textarea
              value={metrics.performanceNotes}
              onChange={(e) => handleInputChange('performanceNotes', e.target.value)}
              placeholder="Educational Reels are performing best&#10;Posts with faces get 40% more engagement&#10;Carousel posts have highest save rates&#10;Story highlights driving profile visits"
              rows={8}
              className="w-full p-3 border border-[#bb9477]/50 rounded-md focus:border-[#472816] focus:outline-none resize-none text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;