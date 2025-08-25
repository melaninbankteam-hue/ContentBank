import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Upload, Trash2, Download, Copy } from "lucide-react";
import { contentCategories, contentTypes, mockBrainstormIdeas } from "../data/mock";
import { useToast } from "../hooks/use-toast";

const PostPlanningModal = ({ isOpen, onClose, selectedDate, currentMonth, monthlyData, setMonthlyData }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    pillar: "",
    topic: "",
    caption: "",
    audioLink: "",
    notes: "",
    image: null,
    reelCover: null
  });

  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
  const dateKey = selectedDate ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : null;
  
  const currentData = monthlyData[monthKey] || {};
  const contentPillars = currentData.contentPillars || [];
  const brainstormIdeas = currentData.brainstormIdeas || mockBrainstormIdeas;
  const posts = currentData.posts || {};
  const existingPosts = dateKey ? posts[dateKey] || [] : [];

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        type: "",
        category: "",
        pillar: "",
        topic: "",
        caption: "",
        audioLink: "",
        notes: "",
        image: null,
        reelCover: null
      });
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e, type = 'image') => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, [type]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePost = () => {
    if (!formData.type || !formData.topic) return;

    const newPost = {
      id: Date.now(),
      ...formData,
      date: dateKey
    };

    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: {
        ...currentData,
        posts: {
          ...posts,
          [dateKey]: [...existingPosts, newPost]
        }
      }
    }));

    setFormData({
      type: "",
      category: "",
      pillar: "",
      topic: "",
      caption: "",
      audioLink: "",
      format: "",
      notes: "",
      image: null
    });
  };

  const handleDeletePost = (postId) => {
    const updatedPosts = existingPosts.filter(post => post.id !== postId);
    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: {
        ...currentData,
        posts: {
          ...posts,
          [dateKey]: updatedPosts
        }
      }
    }));
  };

  const selectBrainstormIdea = (idea) => {
    setFormData(prev => ({ ...prev, topic: idea }));
  };

  // Download image function
  const downloadImage = (imageUrl, filename) => {
    if (!imageUrl) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || 'content-image.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your image download has begun.",
    });
  };

  // Copy caption function
  const copyCaption = (caption) => {
    navigator.clipboard.writeText(caption).then(() => {
      toast({
        title: "Caption Copied!",
        description: "The caption has been copied to your clipboard.",
      });
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = caption;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Caption Copied!",
        description: "The caption has been copied to your clipboard.",
      });
    });
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#fffaf1] border-[#bb9477]">
        <DialogHeader className="bg-[#472816] text-[#fffaf1] -mx-6 -mt-6 px-6 py-4 mb-6">
          <DialogTitle className="text-2xl">
            Plan Content - {currentMonth.toLocaleDateString('en-US', { month: 'long' })} {selectedDate}, {currentMonth.getFullYear()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Content Planning Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#472816]">Add New Post</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Content Type</label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="border-[#bb9477]/50 focus:border-[#472816]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Category</label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="border-[#bb9477]/50 focus:border-[#472816]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Content Pillar</label>
              <Select value={formData.pillar} onValueChange={(value) => handleInputChange('pillar', value)}>
                <SelectTrigger className="border-[#bb9477]/50 focus:border-[#472816]">
                  <SelectValue placeholder="Select pillar" />
                </SelectTrigger>
                <SelectContent>
                  {contentPillars.map(pillar => (
                    <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Content Topic/Hook</label>
              <Input
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="Enter your content topic or hook..."
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Brainstorm Ideas</label>
              <Select value="" onValueChange={selectBrainstormIdea}>
                <SelectTrigger className="border-[#bb9477]/50 focus:border-[#472816]">
                  <SelectValue placeholder="Choose from your brainstorm ideas" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {brainstormIdeas.map((idea, index) => {
                    const ideaText = typeof idea === 'string' ? idea : idea.text || idea;
                    return (
                      <SelectItem key={index} value={ideaText}>
                        {ideaText.length > 60 ? `${ideaText.substring(0, 60)}...` : ideaText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Image/Video Upload</label>
                <div className="border-2 border-dashed border-[#bb9477]/50 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {formData.image ? (
                      <div className="relative">
                        <img src={formData.image} alt="Preview" className="max-w-full h-24 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleInputChange('image', null)}
                          className="absolute top-1 right-1"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-6 h-6 text-[#bb9477] mx-auto mb-2" />
                        <p className="text-[#3f2d1d] text-sm">Main content image/video</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {formData.type === 'Reel' && (
                <div>
                  <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Reel Cover Image</label>
                  <div className="border-2 border-dashed border-[#bb9477]/50 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="reel-cover-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'reelCover')}
                    />
                    <label htmlFor="reel-cover-upload" className="cursor-pointer">
                      {formData.reelCover ? (
                        <div className="relative">
                          <img src={formData.reelCover} alt="Reel Cover" className="max-w-full h-24 object-cover rounded" />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleInputChange('reelCover', null)}
                            className="absolute top-1 right-1"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-6 h-6 text-[#bb9477] mx-auto mb-2" />
                          <p className="text-[#3f2d1d] text-sm">Reel cover image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Caption</label>
              <Textarea
                value={formData.caption}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="Write your caption..."
                className="min-h-24 border-[#bb9477]/50 focus:border-[#472816] resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Audio Link (for Reels)</label>
              <Input
                value={formData.audioLink}
                onChange={(e) => handleInputChange('audioLink', e.target.value)}
                placeholder="Audio/music link..."
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or reminders..."
                className="min-h-16 border-[#bb9477]/50 focus:border-[#472816] resize-none"
              />
            </div>

            <Button 
              onClick={handleSavePost}
              disabled={!formData.type || !formData.topic}
              className="w-full bg-[#bb9477] hover:bg-[#472816] text-white"
            >
              Save Post
            </Button>
          </div>

          {/* Existing Posts for Selected Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#472816]">
              Scheduled Posts ({existingPosts.length})
            </h3>
            
            {existingPosts.length === 0 ? (
              <Card className="border-[#bb9477]/30">
                <CardContent className="p-6 text-center text-[#3f2d1d]/60">
                  No posts scheduled for this date yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {existingPosts.map(post => (
                  <Card key={post.id} className="border-[#bb9477]/30 bg-white/80">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-[#bb9477]/10 text-[#3f2d1d] border-[#bb9477]">
                            {post.type}
                          </Badge>
                          {post.category && (
                            <Badge variant="outline" className="bg-[#472816]/10 text-[#472816] border-[#472816]/30">
                              {post.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <h4 className="font-semibold text-[#3f2d1d] mb-2">{post.topic}</h4>
                      
                      {post.pillar && (
                        <p className="text-sm text-[#3f2d1d]/70 mb-2">
                          <strong>Pillar:</strong> {post.pillar}
                        </p>
                      )}
                      
                      {post.caption && (
                        <div className="relative mt-2">
                          <p className="text-sm text-[#3f2d1d]/70 mb-2 line-clamp-2">
                            <strong>Caption:</strong> {post.caption}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyCaption(post.caption)}
                            className="text-xs border-[#bb9477] text-[#3f2d1d] hover:bg-[#bb9477]/10"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Caption
                          </Button>
                        </div>
                      )}
                      
                      {post.image && (
                        <div className="relative">
                          <img src={post.image} alt="Post preview" className="w-full h-24 object-cover rounded mt-2" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadImage(post.image, `${post.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_image`)}
                            className="absolute top-1 right-1 bg-white/80 hover:bg-white text-[#3f2d1d] border-[#bb9477]"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      {post.notes && (
                        <p className="text-xs text-[#3f2d1d]/60 mt-2 italic">
                          {post.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPlanningModal;