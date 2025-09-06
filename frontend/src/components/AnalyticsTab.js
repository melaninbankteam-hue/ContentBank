import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Users, Eye, MessageCircle, TrendingUp, Share, Mail, Target, BarChart3 } from "lucide-react";

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
    growthGoals: analytics.growthGoals || "",
    performanceNotes: analytics.performanceNotes || "",
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
    // Auto-save analytics data
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
  }, [metrics]);

  const handleInputChange = (field, value) => {
    setMetrics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const MetricCard = ({ title, icon: Icon, value, field, previousValue, showGrowth = false }) => {
    const growth = calculateGrowth(value, previousValue);
    
    return (
      <Card className="border-[#bb9477]/30 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#8B6F47] to-[#A0845C] text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{title}</span>
            </div>
            {showGrowth && previousValue !== undefined && previousValue !== "" && (
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-1 ${
                  growth.isPositive ? 'bg-green-500/20 text-green-100 border-green-400' : 'bg-red-500/20 text-red-100 border-red-400'
                }`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {growth.percentage}%
              </Badge>
            )}
          </div>
          <div className="text-2xl font-bold mt-2">
            {value ? (parseInt(value) || 0).toLocaleString() : '0'}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder="0"
            className="border-[#bb9477]/50 focus:border-[#472816]"
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Metrics Grid - 3x3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Followers"
          icon={Users}
          value={metrics.followers}
          field="followers"
          previousValue={previousMetrics.followers}
          showGrowth={true}
        />
        
        <MetricCard
          title="Total Views"
          icon={Eye}
          value={metrics.totalViews}
          field="totalViews"
          previousValue={previousMetrics.totalViews}
          showGrowth={true}
        />
        
        <MetricCard
          title="Non-Follower Views"
          icon={Target}
          value={metrics.nonFollowerViews}
          field="nonFollowerViews"
          previousValue={previousMetrics.nonFollowerViews}
        />
        
        <MetricCard
          title="Reach"
          icon={BarChart3}
          value={metrics.reach}
          field="reach"
          previousValue={previousMetrics.reach}
          showGrowth={true}
        />
        
        <MetricCard
          title="Profile Visits"
          icon={Users}
          value={metrics.profileVisits}
          field="profileVisits"
          previousValue={previousMetrics.profileVisits}
        />
        
        <MetricCard
          title="Website Clicks"
          icon={Share}
          value={metrics.websiteClicks}
          field="websiteClicks"
          previousValue={previousMetrics.websiteClicks}
        />
        
        <MetricCard
          title="Email Subscribers"
          icon={Mail}
          value={metrics.emailSubscribers}
          field="emailSubscribers"
          previousValue={previousMetrics.emailSubscribers}
        />
        
        <MetricCard
          title="DM Messages"
          icon={MessageCircle}
          value={metrics.dmMessages}
          field="dmMessages"
          previousValue={previousMetrics.dmMessages}
        />
        
        <MetricCard
          title="Total Interactions"
          icon={TrendingUp}
          value={metrics.totalInteractions}
          field="totalInteractions"
          previousValue={previousMetrics.totalInteractions}
          showGrowth={true}
        />
      </div>

      {/* Growth Summary */}
      <Card className="border-[#bb9477]/30">
        <CardHeader className="bg-gradient-to-r from-[#8B6F47] to-[#A0845C] text-white">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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

      {/* Growth Goals and Performance Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#bb9477]/30">
          <CardHeader className="bg-gradient-to-r from-[#8B6F47] to-[#A0845C] text-white">
            <CardTitle>Growth Goals</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <textarea
              value={metrics.growthGoals}
              onChange={(e) => handleInputChange('growthGoals', e.target.value)}
              placeholder="Increase followers by 15% this month&#10;Improve engagement rate to 4%+&#10;Grow email list to 1000 subscribers&#10;Increase course sales by 25%"
              rows={8}
              className="w-full p-3 border border-[#bb9477]/50 rounded-md focus:border-[#472816] focus:outline-none resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30">
          <CardHeader className="bg-gradient-to-r from-[#8B6F47] to-[#A0845C] text-white">
            <CardTitle>Performance Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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