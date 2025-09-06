import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Upload, RotateCcw, ArrowUpDown } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const InstagramPreview = ({ monthlyData, currentMonth, setMonthlyData, triggerRefresh }) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [selectedForSwap, setSelectedForSwap] = useState(null);
  const [swapMode, setSwapMode] = useState(false);

  // Get all posts from current month and sort in Instagram feed order (newest first)
  const getAllPostsFromMonth = useCallback(() => {
    const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
    const monthData = monthlyData[monthKey];
    const allPosts = [];
    
    if (monthData && monthData.posts) {
      Object.entries(monthData.posts).forEach(([dateKey, dayPosts]) => {
        dayPosts.forEach(post => {
          // Include all content types with images
          if ((post.type === 'Post' || post.type === 'Reel' || post.type === 'Carousel') && 
              (post.image?.url || post.reelCover?.url)) {
            allPosts.push({
              ...post,
              dateKey,
              originalDate: dateKey,
              // Priority: reel cover > main image for preview (as requested)
              previewImage: post.reelCover?.url || post.image?.url,
              // Use scheduled date/time for sorting, fallback to dateKey
              sortDate: new Date(post.scheduledDate || dateKey + 'T' + (post.scheduledTime || '09:00'))
            });
          }
        });
      });
    }
    
    // Sort by scheduled date/time in chronological order (oldest first)
    // Fill grid left-to-right, top-to-bottom, with newest posts at bottom-right
    return allPosts.sort((a, b) => a.sortDate - b.sortDate);
  }, [monthlyData, currentMonth]);

  // Update posts when month data changes or triggerRefresh is called
  useEffect(() => {
    const sortedPosts = getAllPostsFromMonth();
    setPosts(sortedPosts);
  }, [getAllPostsFromMonth, triggerRefresh]);

  // Auto-refresh effect - listen for content changes
  useEffect(() => {
    const sortedPosts = getAllPostsFromMonth();
    setPosts(sortedPosts);
  }, [monthlyData, currentMonth, getAllPostsFromMonth]);

  // Fill grid to 30 spots
  const gridPosts = [...posts];
  while (gridPosts.length < 30) {
    gridPosts.push(null);
  }

  // Handle post click functionality
  const handlePostClick = (clickedIndex) => {
    const post = posts[clickedIndex];
    if (!post) return;
    
    if (!swapMode) {
      // Click to edit post - show message to go to calendar
      toast({
        title: "Edit Post",
        description: "Go to Calendar tab to edit this post",
        duration: 3000,
      });
      return;
    }
    
    // Swap mode functionality
    if (selectedForSwap === null) {
      setSelectedForSwap(clickedIndex);
      toast({
        title: "Post Selected",
        description: "Click another post to swap positions",
      });
    } else if (selectedForSwap === clickedIndex) {
      setSelectedForSwap(null);
      toast({
        title: "Selection Cancelled",
        description: "Swap mode cancelled",
      });
    } else {
      // Perform swap
      const newPosts = [...posts];
      [newPosts[selectedForSwap], newPosts[clickedIndex]] = [newPosts[clickedIndex], newPosts[selectedForSwap]];
      setPosts(newPosts);
      updatePostPositions(newPosts);
      setSelectedForSwap(null);
      setSwapMode(false);
      toast({
        title: "Posts Swapped!",
        description: "Post positions have been updated",
      });
    }
  };

  const toggleSwapMode = () => {
    setSwapMode(!swapMode);
    setSelectedForSwap(null);
    if (!swapMode) {
      toast({
        title: "Swap Mode Enabled",
        description: "Click posts to swap their positions",
      });
    }
  };

  const updatePostPositions = (newPosts) => {
    // This would update the preview positions in the backend/localStorage
    // For now, we just update the local state
    // In a full implementation, you'd sync this with your data source
  };

  const updateCalendarWithNewOrder = (reorderedPosts) => {
    const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
    const monthData = monthlyData[monthKey];
    
    if (!monthData) return;

    // Clear existing posts from their original dates
    const clearedPosts = {};
    Object.keys(monthData.posts || {}).forEach(dateKey => {
      const remainingPosts = (monthData.posts[dateKey] || []).filter(post => 
        !(post.type === 'Post' && (post.image || post.reelCover))
      );
      if (remainingPosts.length > 0) {
        clearedPosts[dateKey] = remainingPosts;
      }
    });

    // Generate new dates for reordered posts
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const datesInMonth = [];
    
    for (let day = 1; day <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(); day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      datesInMonth.push(dateStr);
    }

    // Assign new dates to reordered posts
    reorderedPosts.forEach((post, index) => {
      if (post && index < datesInMonth.length) {
        const newDateKey = datesInMonth[index];
        post.dateKey = newDateKey;
        
        if (!clearedPosts[newDateKey]) {
          clearedPosts[newDateKey] = [];
        }
        clearedPosts[newDateKey].push(post);
      }
    });

    // Update the monthly data
    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: {
        ...monthData,
        posts: clearedPosts
      }
    }));
  };

  const resetToChronological = () => {
    const chronologicalPosts = getAllPostsFromMonth();
    setPosts(chronologicalPosts);
    
    toast({
      title: "Reset Complete!",
      description: "Posts are now in chronological order.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#bb9477]/30 shadow-lg bg-white max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl">
              Instagram Feed Preview - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={swapMode ? "default" : "secondary"}
                size="sm"
                onClick={toggleSwapMode}
                className={swapMode ? 
                  "bg-[#472816] text-[#fffaf1] hover:bg-[#3f2d1d]" : 
                  "bg-[#bb9477] text-[#3f2d1d] hover:bg-[#fffaf1]"
                }
              >
                <ArrowUpDown className="w-3 h-3 mr-1" />
                {swapMode ? 'Exit Swap' : 'Swap Mode'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={resetToChronological}
                className="bg-[#bb9477] text-[#3f2d1d] hover:bg-[#fffaf1]"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Order
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8">
          <div className="mb-4 text-center text-sm text-[#3f2d1d]/70">
            <p className="mb-2">📱 {swapMode ? 'Click posts to swap their positions' : 'Click posts to edit them (opens in Calendar tab)'}</p>
            <p>Grid shows posts in chronological order - oldest top-left, newest bottom-right</p>
          </div>

          {/* Posts Grid - 10 rows x 3 columns = 30 posts */}
          <div className="grid grid-cols-3 gap-2">
            {gridPosts.map((post, index) => (
              <div 
                key={index} 
                className="aspect-square relative"
              >
                {post ? (
                  <div 
                    className={`group relative w-full h-full ${
                      swapMode ? 'cursor-pointer' : 'cursor-pointer'
                    } ${
                      selectedForSwap === index ? 'ring-4 ring-[#bb9477] ring-opacity-70' : ''
                    }`}
                    onClick={() => handlePostClick(index)}
                  >
                    <img 
                      src={post.previewImage} 
                      alt={post.topic}
                      className="w-full h-full object-cover rounded border-2 border-transparent hover:border-[#bb9477] transition-all"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center rounded">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center p-2">
                        <div className="text-xs font-semibold mb-1">{post.type}</div>
                        <div className="text-xs mb-2">{post.topic.length > 30 ? `${post.topic.substring(0, 30)}...` : post.topic}</div>
                        <div className="text-xs text-[#bb9477] bg-black/50 rounded px-2 py-1">
                          {new Date(post.dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-white" />
                            <span className="text-xs">125</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 fill-white" />
                            <span className="text-xs">12</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {post.type === 'Reel' && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                          Reel
                        </Badge>
                      </div>
                    )}
                    {post.type === 'Carousel' && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                          📷
                        </Badge>
                      </div>
                    )}
                    {/* Swap indicator */}
                    {swapMode && (
                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/80 rounded p-1">
                          <ArrowUpDown className="w-3 h-3 text-[#472816]" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded hover:border-[#bb9477] transition-colors">
                    <div className="text-gray-400 text-xs text-center p-2">
                      <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <div>Plan content</div>
                      <div>in calendar</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Statistics */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/5 max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center gap-6 md:gap-8 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-[#472816]">{posts.length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Scheduled Posts</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-[#472816]">{posts.filter(p => p.type === 'Reel').length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Reels</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-[#472816]">{posts.filter(p => p.type === 'Carousel').length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Carousels</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-[#472816]">{30 - posts.length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Available Spots</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramPreview;