import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Users, Eye, Heart, MessageCircle, Share, Calendar } from "lucide-react";

const AnalyticsTab = ({ monthKey, monthlyData, setMonthlyData }) => {
  const currentData = monthlyData[monthKey] || {};
  const analytics = currentData.analytics || {};
  
  const [metrics, setMetrics] = useState({
    followers: analytics.followers || 0,
    reach: analytics.reach || 0,
    impressions: analytics.impressions || 0,
    profileViews: analytics.profileViews || 0,
    websiteClicks: analytics.websiteClicks || 0,
    emailContacts: analytics.emailContacts || 0,
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
    const growth = ((current - previous) / previous) * 100;
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

  const handleMetricChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setMetrics(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const MetricCard = ({ title, icon: Icon, value, field, previousValue, color = "text-[#472816]" }) => {
    const growth = calculateGrowth(value, previousValue);
    
    return (
      <Card className="border-[#bb9477]/30 hover:border-[#bb9477]/50 transition-colors">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
            {previousValue !== undefined && (
              <Badge 
                variant={growth.isPositive ? "default" : "destructive"} 
                className={`text-xs ${growth.isPositive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
              >
                {growth.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {growth.percentage}%
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3f2d1d] block">{title}</label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleMetricChange(field, e.target.value)}
              placeholder="0"
              className="text-lg md:text-xl font-semibold border-[#bb9477]/50 focus:border-[#472816]"
            />
          </div>
          
          {previousValue !== undefined && (
            <div className="mt-2 text-xs text-[#3f2d1d]/60">
              Previous: {previousValue.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const EngagementMetricCard = ({ title, icon: Icon, value, field, color = "text-[#472816]", suffix = "" }) => (
    <Card className="border-[#bb9477]/30 hover:border-[#bb9477]/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium text-[#3f2d1d]">{title}</span>
        </div>
        <Input
          type="number"
          value={value}
          onChange={(e) => handleMetricChange(field, e.target.value)}
          placeholder="0"
          className="text-base font-semibold border-[#bb9477]/50 focus:border-[#472816]"
        />
        {suffix && <span className="text-xs text-[#3f2d1d]/60">{suffix}</span>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-[#472816] mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-[#3f2d1d] mb-4">
          Track your Instagram performance and growth metrics
        </p>
        <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-[#3f2d1d]/60">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard
          title="Followers"
          icon={Users}
          value={metrics.followers}
          field="followers"
          previousValue={previousMetrics.followers}
          color="text-[#472816]"
        />
        
        <MetricCard
          title="Reach"
          icon={Eye}
          value={metrics.reach}
          field="reach"
          previousValue={previousMetrics.reach}
          color="text-blue-600"
        />
        
        <MetricCard
          title="Impressions"
          icon={TrendingUp}
          value={metrics.impressions}
          field="impressions"
          previousValue={previousMetrics.impressions}
          color="text-green-600"
        />
        
        <MetricCard
          title="Profile Views"
          icon={Eye}
          value={metrics.profileViews}
          field="profileViews"
          previousValue={previousMetrics.profileViews}
          color="text-purple-600"
        />
        
        <MetricCard
          title="Website Clicks"
          icon={Share}
          value={metrics.websiteClicks}
          field="websiteClicks"
          previousValue={previousMetrics.websiteClicks}
          color="text-orange-600"
        />
        
        <MetricCard
          title="Email Contacts"
          icon={MessageCircle}
          value={metrics.emailContacts}
          field="emailContacts"
          previousValue={previousMetrics.emailContacts}
          color="text-red-600"
        />
      </div>

      {/* Engagement Metrics */}
      <Card className="border-[#bb9477]/30">
        <CardHeader className="bg-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <EngagementMetricCard
              title="Avg Likes"
              icon={Heart}
              value={metrics.averageLikes || 0}
              field="averageLikes"
              color="text-red-500"
            />
            
            <EngagementMetricCard
              title="Avg Comments"
              icon={MessageCircle}
              value={metrics.averageComments || 0}
              field="averageComments"
              color="text-blue-500"
            />
            
            <EngagementMetricCard
              title="Avg Shares"
              icon={Share}
              value={metrics.averageShares || 0}
              field="averageShares"
              color="text-green-500"
            />
            
            <EngagementMetricCard
              title="Saves"
              icon={Users}
              value={metrics.averageSaves || 0}
              field="averageSaves"
              color="text-purple-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Growth Summary */}
      {Object.keys(previousMetrics).length > 0 && (
        <Card className="border-[#bb9477]/30">
          <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Month-over-Month Growth Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(metrics).map(([key, value]) => {
                const previousValue = previousMetrics[key];
                if (previousValue === undefined || typeof value !== 'number') return null;
                
                const growth = calculateGrowth(value, previousValue);
                const labels = {
                  followers: 'Followers',
                  reach: 'Reach', 
                  impressions: 'Impressions',
                  profileViews: 'Profile Views',
                  websiteClicks: 'Website Clicks',
                  emailContacts: 'Email Contacts'
                };
                
                if (!labels[key]) return null;
                
                return (
                  <div key={key} className="text-center p-3 rounded-lg bg-[#bb9477]/5">
                    <div className="text-sm font-medium text-[#3f2d1d] mb-1">{labels[key]}</div>
                    <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                      growth.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {growth.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {growth.percentage}%
                    </div>
                    <div className="text-xs text-[#3f2d1d]/60">
                      {previousValue.toLocaleString()} → {value.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-[#bb9477]/30 bg-[#bb9477]/5">
        <CardContent className="p-4 md:p-6">
          <div className="text-center text-sm text-[#3f2d1d]">
            <p className="font-medium mb-2">📊 How to use Analytics</p>
            <p>
              Enter your Instagram metrics manually to track your growth and performance. 
              Growth percentages are calculated automatically compared to the previous month.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;