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

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-[#472816] mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-[#3f2d1d] mb-4">
          Track your Instagram performance and growth metrics
        </p>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-[#bb9477]/30 hover:border-[#bb9477]/50 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#472816]" />
              {previousMetrics.followers !== undefined && (
                <Badge 
                  variant={calculateGrowth(metrics.followers, previousMetrics.followers).isPositive ? "default" : "destructive"} 
                  className={`text-xs ${calculateGrowth(metrics.followers, previousMetrics.followers).isPositive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                >
                  {calculateGrowth(metrics.followers, previousMetrics.followers).isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {calculateGrowth(metrics.followers, previousMetrics.followers).percentage}%
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3f2d1d] block">Followers</label>
              <Input
                type="number"
                value={metrics.followers}
                onChange={(e) => handleMetricChange('followers', e.target.value)}
                placeholder="0"
                className="text-lg md:text-xl font-semibold border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            {previousMetrics.followers !== undefined && (
              <div className="mt-2 text-xs text-[#3f2d1d]/60">
                Previous: {previousMetrics.followers.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-[#bb9477]/30 hover:border-[#bb9477]/50 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <Eye className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              {previousMetrics.reach !== undefined && (
                <Badge 
                  variant={calculateGrowth(metrics.reach, previousMetrics.reach).isPositive ? "default" : "destructive"} 
                  className={`text-xs ${calculateGrowth(metrics.reach, previousMetrics.reach).isPositive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                >
                  {calculateGrowth(metrics.reach, previousMetrics.reach).isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {calculateGrowth(metrics.reach, previousMetrics.reach).percentage}%
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3f2d1d] block">Reach</label>
              <Input
                type="number"
                value={metrics.reach}
                onChange={(e) => handleMetricChange('reach', e.target.value)}
                placeholder="0"
                className="text-lg md:text-xl font-semibold border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            {previousMetrics.reach !== undefined && (
              <div className="mt-2 text-xs text-[#3f2d1d]/60">
                Previous: {previousMetrics.reach.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-[#bb9477]/30 hover:border-[#bb9477]/50 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              {previousMetrics.impressions !== undefined && (
                <Badge 
                  variant={calculateGrowth(metrics.impressions, previousMetrics.impressions).isPositive ? "default" : "destructive"} 
                  className={`text-xs ${calculateGrowth(metrics.impressions, previousMetrics.impressions).isPositive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                >
                  {calculateGrowth(metrics.impressions, previousMetrics.impressions).isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {calculateGrowth(metrics.impressions, previousMetrics.impressions).percentage}%
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3f2d1d] block">Impressions</label>
              <Input
                type="number"
                value={metrics.impressions}
                onChange={(e) => handleMetricChange('impressions', e.target.value)}
                placeholder="0"
                className="text-lg md:text-xl font-semibold border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            {previousMetrics.impressions !== undefined && (
              <div className="mt-2 text-xs text-[#3f2d1d]/60">
                Previous: {previousMetrics.impressions.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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