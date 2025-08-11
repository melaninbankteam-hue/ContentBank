import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { BarChart3, TrendingUp, Target, Users, Heart, MessageCircle } from "lucide-react";

const ContentTracker = ({ monthlyData }) => {
  // Calculate content statistics from all posts in the current month
  const calculateStats = () => {
    let totalPosts = 0;
    let totalStories = 0;
    let totalReels = 0;
    let categoryBreakdown = { Credibility: 0, Connection: 0, Community: 0, Conversion: 0 };
    let pillarUsage = {};

    Object.values(monthlyData).forEach(monthData => {
      if (monthData.posts) {
        Object.values(monthData.posts).forEach(dayPosts => {
          dayPosts.forEach(post => {
            if (post.type === 'Post') totalPosts++;
            else if (post.type === 'Story') totalStories++;
            else if (post.type === 'Reel') totalReels++;

            if (post.category && categoryBreakdown[post.category] !== undefined) {
              categoryBreakdown[post.category]++;
            }

            if (post.pillar) {
              pillarUsage[post.pillar] = (pillarUsage[post.pillar] || 0) + 1;
            }
          });
        });
      }
    });

    return {
      totalPosts,
      totalStories,
      totalReels,
      categoryBreakdown,
      pillarUsage,
      totalContent: totalPosts + totalStories + totalReels
    };
  };

  const stats = calculateStats();

  const optimalMix = {
    Connection: 40,
    Credibility: 30,
    Community: 20,
    Conversion: 10
  };

  const calculateCategoryPercentage = (category) => {
    if (stats.totalContent === 0) return 0;
    return Math.round((stats.categoryBreakdown[category] / stats.totalContent) * 100);
  };

  const getRecommendationColor = (category) => {
    const actual = calculateCategoryPercentage(category);
    const optimal = optimalMix[category];
    const diff = Math.abs(actual - optimal);
    
    if (diff <= 5) return "text-green-600";
    if (diff <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#472816] to-[#3f2d1d] text-[#fffaf1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#bb9477] text-sm font-medium">Total Posts</p>
                <p className="text-3xl font-bold">{stats.totalPosts}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#bb9477]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#bb9477] to-[#472816] text-[#fffaf1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#fffaf1]/80 text-sm font-medium">Stories</p>
                <p className="text-3xl font-bold">{stats.totalStories}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-[#fffaf1]/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#3f2d1d] to-[#bb9477] text-[#fffaf1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#fffaf1]/80 text-sm font-medium">Reels</p>
                <p className="text-3xl font-bold">{stats.totalReels}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#fffaf1]/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#bb9477]/80 to-[#3f2d1d] text-[#fffaf1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#fffaf1]/80 text-sm font-medium">Total Content</p>
                <p className="text-3xl font-bold">{stats.totalContent}</p>
              </div>
              <Target className="w-8 h-8 text-[#fffaf1]/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Category Breakdown */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Content Category Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {Object.entries(optimalMix).map(([category, optimalPercent]) => {
              const actualPercent = calculateCategoryPercentage(category);
              const actualCount = stats.categoryBreakdown[category];
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#3f2d1d]">{category}</span>
                      <Badge variant="outline" className="bg-[#bb9477]/10 text-[#3f2d1d] border-[#bb9477]">
                        {actualCount} posts
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getRecommendationColor(category)}`}>
                        {actualPercent}%
                      </span>
                      <span className="text-sm text-[#3f2d1d]/60">
                        (target: {optimalPercent}%)
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={actualPercent} 
                    max={50}
                    className="h-3 bg-[#bb9477]/20"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-[#bb9477]/5 rounded-lg border border-[#bb9477]/20">
            <h4 className="font-semibold text-[#472816] mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Content Mix Recommendations
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#3f2d1d]"><strong>Connection (40%):</strong> Personal stories, behind-the-scenes content</p>
                <p className="text-[#3f2d1d]"><strong>Credibility (30%):</strong> Educational content, expertise showcase</p>
              </div>
              <div>
                <p className="text-[#3f2d1d]"><strong>Community (20%):</strong> User-generated content, engagement posts</p>
                <p className="text-[#3f2d1d]"><strong>Conversion (10%):</strong> Product promotions, sales content</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Pillar Usage */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#bb9477] to-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Content Pillar Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {Object.keys(stats.pillarUsage).length === 0 ? (
            <div className="text-center text-[#3f2d1d]/60 py-8">
              <Target className="w-12 h-12 mx-auto mb-3 text-[#bb9477]/50" />
              <p>No content pillars tracked yet. Start creating posts to see pillar distribution.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.pillarUsage)
                .sort(([,a], [,b]) => b - a)
                .map(([pillar, count]) => (
                  <Card key={pillar} className="border-[#bb9477]/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-[#472816] mb-1">{count}</div>
                      <div className="text-sm text-[#3f2d1d] font-medium">{pillar}</div>
                      <div className="text-xs text-[#3f2d1d]/60 mt-1">
                        {Math.round((count / stats.totalContent) * 100)}% of content
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/5">
        <CardHeader className="bg-gradient-to-r from-[#3f2d1d] to-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Content Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {stats.totalContent === 0 ? (
              <p className="text-[#3f2d1d]/60">Start planning your content to see personalized insights and recommendations.</p>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Content Volume</p>
                    <p className="text-sm text-blue-700">
                      You've planned {stats.totalContent} pieces of content. 
                      {stats.totalContent < 15 && " Consider increasing your content frequency for better engagement."}
                      {stats.totalContent >= 15 && stats.totalContent < 30 && " Great consistency! You're on track for strong engagement."}
                      {stats.totalContent >= 30 && " Excellent content planning! You're set up for maximum reach and engagement."}
                    </p>
                  </div>
                </div>
                
                {stats.totalReels / stats.totalContent < 0.3 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Reel Opportunity</p>
                      <p className="text-sm text-yellow-700">
                        Consider creating more Reels - they typically get higher reach and engagement on Instagram.
                      </p>
                    </div>
                  </div>
                )}

                {calculateCategoryPercentage('Conversion') > 20 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                    <Heart className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Balance Alert</p>
                      <p className="text-sm text-red-700">
                        You have a high percentage of conversion content. Consider adding more connection and value-driven posts.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentTracker;