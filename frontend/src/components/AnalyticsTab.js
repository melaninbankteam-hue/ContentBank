import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Users, Eye, MousePointer, Mail, MessageCircle, BarChart3 } from "lucide-react";
import { mockAnalytics } from "../data/mock";

const AnalyticsTab = ({ monthKey, monthlyData, setMonthlyData }) => {
  const currentData = monthlyData[monthKey] || {};
  const analytics = currentData.analytics || { ...mockAnalytics };

  const updateField = (field, value) => {
    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: {
        ...currentData,
        analytics: {
          ...analytics,
          [field]: value
        }
      }
    }));
  };

  const updateGrowthPercentage = (field, value) => {
    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: {
        ...currentData,
        analytics: {
          ...analytics,
          growthPercentage: {
            ...analytics.growthPercentage,
            [field]: value
          }
        }
      }
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getGrowthIcon = (percentage) => {
    if (percentage > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (percentage < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (percentage) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-gray-500";
  };

  const metricCards = [
    {
      title: "Followers",
      value: analytics.followers,
      growth: analytics.growthPercentage?.followers || 0,
      icon: <Users className="w-5 h-5" />,
      color: "from-[#472816] to-[#3f2d1d]",
      field: "followers",
      growthField: "followers"
    },
    {
      title: "Total Views",
      value: analytics.views,
      growth: analytics.growthPercentage?.views || 0,
      icon: <Eye className="w-5 h-5" />,
      color: "from-[#bb9477] to-[#472816]",
      field: "views",
      growthField: "views"
    },
    {
      title: "Non-Follower Views",
      value: analytics.nonFollowerViews,
      growth: 0, // Static for this metric
      icon: <Eye className="w-5 h-5" />,
      color: "from-[#3f2d1d] to-[#bb9477]",
      field: "nonFollowerViews",
      showGrowth: false
    },
    {
      title: "Reach",
      value: analytics.reach,
      growth: analytics.growthPercentage?.reach || 0,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "from-[#bb9477]/80 to-[#3f2d1d]",
      field: "reach",
      growthField: "reach"
    },
    {
      title: "Profile Visits",
      value: analytics.profileVisits,
      growth: 0,
      icon: <MousePointer className="w-5 h-5" />,
      color: "from-[#472816]/80 to-[#bb9477]",
      field: "profileVisits",
      showGrowth: false
    },
    {
      title: "Website Clicks",
      value: analytics.websiteClicks,
      growth: 0,
      icon: <MousePointer className="w-5 h-5" />,
      color: "from-[#3f2d1d]/80 to-[#472816]",
      field: "websiteClicks",
      showGrowth: false
    },
    {
      title: "Email Subscribers",
      value: analytics.emailSubscribers,
      growth: 0,
      icon: <Mail className="w-5 h-5" />,
      color: "from-[#bb9477] to-[#3f2d1d]/80",
      field: "emailSubscribers",
      showGrowth: false
    },
    {
      title: "DM Messages",
      value: analytics.dmMessages,
      growth: 0,
      icon: <MessageCircle className="w-5 h-5" />,
      color: "from-[#3f2d1d] to-[#472816]/80",
      field: "dmMessages",
      showGrowth: false
    },
    {
      title: "Total Interactions",
      value: analytics.interactions,
      growth: analytics.growthPercentage?.interactions || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-[#472816] to-[#bb9477]/80",
      field: "interactions",
      growthField: "interactions"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="border-[#bb9477]/30 shadow-lg overflow-hidden">
            <div className={`bg-gradient-to-br ${metric.color} text-[#fffaf1] p-4`}>
              <div className="flex items-center justify-between mb-2">
                {metric.icon}
                {metric.showGrowth !== false && (
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(metric.growth)}
                    <Input
                      type="number"
                      value={metric.growth}
                      onChange={(e) => updateGrowthPercentage(metric.growthField, parseFloat(e.target.value) || 0)}
                      className="w-16 h-6 text-xs bg-white/20 border-white/30 text-white placeholder-white/70"
                      placeholder="0"
                      step="0.1"
                    />
                    <span className="text-xs">%</span>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold">{formatNumber(metric.value)}</div>
              <div className="text-sm text-[#fffaf1]/80">{metric.title}</div>
            </div>
            <CardContent className="p-4">
              <Input
                type="number"
                value={metric.value}
                onChange={(e) => updateField(metric.field, parseInt(e.target.value) || 0)}
                className="border-[#bb9477]/50 focus:border-[#472816]"
                placeholder={`Enter ${metric.title.toLowerCase()}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Summary */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/5">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#472816]" />
                <span className={`text-lg font-bold ${getGrowthColor(analytics.growthPercentage?.followers)}`}>
                  {analytics.growthPercentage?.followers > 0 ? '+' : ''}{analytics.growthPercentage?.followers}%
                </span>
              </div>
              <div className="text-sm text-[#3f2d1d]/70">Followers Growth</div>
            </div>

            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-[#472816]" />
                <span className={`text-lg font-bold ${getGrowthColor(analytics.growthPercentage?.views)}`}>
                  {analytics.growthPercentage?.views > 0 ? '+' : ''}{analytics.growthPercentage?.views}%
                </span>
              </div>
              <div className="text-sm text-[#3f2d1d]/70">Views Growth</div>
            </div>

            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[#472816]" />
                <span className={`text-lg font-bold ${getGrowthColor(analytics.growthPercentage?.reach)}`}>
                  {analytics.growthPercentage?.reach > 0 ? '+' : ''}{analytics.growthPercentage?.reach}%
                </span>
              </div>
              <div className="text-sm text-[#3f2d1d]/70">Reach Growth</div>
            </div>

            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#472816]" />
                <span className={`text-lg font-bold ${getGrowthColor(analytics.growthPercentage?.interactions)}`}>
                  {analytics.growthPercentage?.interactions > 0 ? '+' : ''}{analytics.growthPercentage?.interactions}%
                </span>
              </div>
              <div className="text-sm text-[#3f2d1d]/70">Engagement Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals and Notes */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle>Growth Goals</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              value={currentData.growthGoals || "Increase followers by 15% this month\nImprove engagement rate to 4%+\nGrow email list to 1000 subscribers\nIncrease course sales by 25%"}
              onChange={(e) => updateField('growthGoals', e.target.value)}
              placeholder="What are your growth goals for this month?"
              className="min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none"
            />
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle>Performance Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              value={currentData.performanceNotes || "Educational Reels are performing best\nPosts with faces get 40% more engagement\nCarousel posts have highest save rates\nStory highlights driving profile visits"}
              onChange={(e) => updateField('performanceNotes', e.target.value)}
              placeholder="Track what's working and what isn't..."
              className="min-h-32 border-[#bb9477]/50 focus:border-[#472816] resize-none"
            />
          </CardContent>
        </Card>
    </div>
  );
};

export default AnalyticsTab;