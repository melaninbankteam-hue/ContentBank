import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Users, Eye, MessageCircle, TrendingUp } from "lucide-react";

const AnalyticsTab = ({ monthKey, monthlyData, setMonthlyData }) => {
  const currentData = monthlyData[monthKey] || {};
  const analytics = currentData.analytics || {};
  
  const [metrics, setMetrics] = useState({
    followers: analytics.followers || "",
    reach: analytics.reach || "",
    impressions: analytics.impressions || "",
    profileViews: analytics.profileViews || "",
    ...analytics
  });

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

  return (
    <div className="space-y-6">
      {/* Analytics Input Section */}
      <Card className="border-[#bb9477]/30">
        <CardHeader className="bg-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle>Instagram Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#3f2d1d] mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Followers
              </label>
              <Input
                type="number"
                value={metrics.followers}
                onChange={(e) => handleInputChange('followers', e.target.value)}
                placeholder="Enter follower count"
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3f2d1d] mb-2">
                <Eye className="w-4 h-4 inline mr-1" />
                Reach
              </label>
              <Input
                type="number"
                value={metrics.reach}
                onChange={(e) => handleInputChange('reach', e.target.value)}
                placeholder="Enter reach"
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3f2d1d] mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Impressions
              </label>
              <Input
                type="number"
                value={metrics.impressions}
                onChange={(e) => handleInputChange('impressions', e.target.value)}
                placeholder="Enter impressions"
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3f2d1d] mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Profile Views
              </label>
              <Input
                type="number"
                value={metrics.profileViews}
                onChange={(e) => handleInputChange('profileViews', e.target.value)}
                placeholder="Enter profile views"
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Performance Tracking */}
      <Card className="border-[#bb9477]/30">
        <CardHeader className="bg-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle>Content Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#3f2d1d] mb-2">Top Performing Post</label>
              <Input
                value={metrics.topPost || ""}
                onChange={(e) => handleInputChange('topPost', e.target.value)}
                placeholder="e.g., Skincare routine video"
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3f2d1d] mb-2">Engagement Rate</label>
              <Input
                value={metrics.engagementRate || ""}
                onChange={(e) => handleInputChange('engagementRate', e.target.value)}
                placeholder="e.g., 3.2%"
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3f2d1d] mb-2">Best Posting Time</label>
              <Input
                value={metrics.bestTime || ""}
                onChange={(e) => handleInputChange('bestTime', e.target.value)}
                placeholder="e.g., 7-9 PM"
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card className="border-[#bb9477]/30">
        <CardHeader className="bg-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle>Monthly Notes & Insights</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <textarea
            value={metrics.monthlyNotes || ""}
            onChange={(e) => handleInputChange('monthlyNotes', e.target.value)}
            placeholder="Record your insights, observations, and learnings for this month..."
            rows={4}
            className="w-full p-3 border border-[#bb9477]/50 rounded-md focus:border-[#472816] focus:outline-none resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;