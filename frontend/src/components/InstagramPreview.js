import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Upload } from "lucide-react";
import { mockUser } from "../data/mock";

const InstagramPreview = ({ monthlyData, currentMonth }) => {
  // Get all posts from current month and sort by date
  const getAllPosts = () => {
    const posts = [];
    const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
    const monthData = monthlyData[monthKey];
    
    if (monthData && monthData.posts) {
      Object.entries(monthData.posts).forEach(([dateKey, dayPosts]) => {
        dayPosts.forEach(post => {
          if (post.type === 'Post' && post.image) { // Only show posts with images in grid
            posts.push({
              ...post,
              dateKey
            });
          }
        });
      });
    }
    
    // Sort by date (newest first)
    return posts.sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey)).slice(0, 9);
  };

  const posts = getAllPosts();

  // Fill empty spots with placeholder posts
  const gridPosts = [...posts];
  while (gridPosts.length < 30) {
    gridPosts.push(null);
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#bb9477]/30 shadow-lg bg-white max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="text-center text-2xl">
            Instagram Feed Preview - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Posts Grid - 10 rows x 3 columns = 30 posts */}
          <div className="grid grid-cols-3 gap-2">
            {gridPosts.map((post, index) => (
              <div key={index} className="aspect-square relative">
                {post ? (
                  <div className="group relative w-full h-full">
                    <img 
                      src={post.image} 
                      alt={post.topic}
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center rounded">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center p-2">
                        <div className="text-xs font-semibold mb-1">{post.type}</div>
                        <div className="text-xs">{post.topic.length > 30 ? `${post.topic.substring(0, 30)}...` : post.topic}</div>
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
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded">
                    <div className="text-gray-400 text-xs text-center p-2">
                      <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <div>Upload content</div>
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
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-[#472816]">{posts.length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Scheduled Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#472816]">{posts.filter(p => p.type === 'Reel').length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Reels</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#472816]">{posts.filter(p => p.type === 'Carousel').length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Carousels</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#472816]">{30 - posts.length}</div>
              <div className="text-[#3f2d1d]/60 text-sm">Available Spots</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramPreview;