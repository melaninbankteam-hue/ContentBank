import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
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
      <Card className="border-[#bb9477]/30 shadow-lg bg-white max-w-md mx-auto">
        {/* Instagram Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full p-0.5">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#bb9477] rounded-full"></div>
                </div>
              </div>
              <span className="font-semibold text-gray-900 text-sm">{mockUser.username}</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-900" />
          </div>
        </div>

        {/* Profile Section */}
        <CardContent className="p-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full p-1">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-[#bb9477] rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-3 gap-4 text-center mb-3">
                <div>
                  <div className="font-semibold text-gray-900">{posts.length}</div>
                  <div className="text-xs text-gray-500">posts</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{mockUser.followers}</div>
                  <div className="text-xs text-gray-500">followers</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{mockUser.following}</div>
                  <div className="text-xs text-gray-500">following</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">{mockUser.displayName}</h3>
            <p className="text-sm text-gray-900 mt-1">{mockUser.bio}</p>
            <a href="#" className="text-sm text-blue-900 font-medium">{mockUser.website}</a>
          </div>

          {/* Posts Grid - 10 rows x 3 columns = 30 posts */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-1">
              {gridPosts.map((post, index) => (
                <div key={index} className="aspect-square relative">
                  {post ? (
                    <div className="group relative w-full h-full">
                      <img 
                        src={post.image} 
                        alt={post.topic}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <Heart className="w-5 h-5 fill-white" />
                            <span className="text-sm font-semibold">125</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-5 h-5 fill-white" />
                            <span className="text-sm font-semibold">12</span>
                          </div>
                        </div>
                      </div>
                      {post.type === 'Reel' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-black/60 text-white text-xs">
                            Reel
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-xs text-center p-2">
                        Upload content to preview
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/5 max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-[#472816] mb-2">Instagram Feed Preview</h3>
          <p className="text-sm text-[#3f2d1d]/70 mb-4">
            This shows how your scheduled posts will appear in your Instagram grid. 
            Only posts with uploaded images are displayed.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-[#472816]">{posts.length}</div>
              <div className="text-[#3f2d1d]/60">Scheduled Posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-[#472816]">{posts.filter(p => p.type === 'Reel').length}</div>
              <div className="text-[#3f2d1d]/60">Reels</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-[#472816]">{9 - posts.length}</div>
              <div className="text-[#3f2d1d]/60">Empty Spots</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posting Tips */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm max-w-md mx-auto">
        <CardContent className="p-6">
          <h4 className="font-semibold text-[#472816] mb-3">Grid Optimization Tips</h4>
          <ul className="space-y-2 text-sm text-[#3f2d1d]">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
              <span>Maintain consistent color palette and style</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
              <span>Mix content types: photos, graphics, behind-the-scenes</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
              <span>Plan your grid in rows of 3 for visual cohesion</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
              <span>Include faces and people for higher engagement</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramPreview;