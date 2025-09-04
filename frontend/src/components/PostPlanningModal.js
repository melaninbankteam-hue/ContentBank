import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Upload, Trash2, Download, Copy, Calendar, Clock, Image as ImageIcon } from "lucide-react";
import { contentCategories, contentTypes, mockBrainstormIdeas } from "../data/mock";
import { useToast } from "../hooks/use-toast";
import axios from "axios";

const PostPlanningModal = ({ isOpen, onClose, selectedDate, currentMonth, monthlyData, setMonthlyData, onPostUpdate, editingPost }) => {
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
    reelCover: null,
    scheduledDate: "",
    scheduledTime: "09:00"
  });
  const [uploading, setUploading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
        reelCover: null,
        scheduledDate: "",
        scheduledTime: "09:00"
      });
    } else if (isOpen && editingPost) {
      // Pre-populate form with editing post data
      setFormData({
        type: editingPost.type || "",
        category: editingPost.category || "",
        pillar: editingPost.pillar || "",
        topic: editingPost.topic || "",
        caption: editingPost.caption || "",
        audioLink: editingPost.audioLink || "",
        notes: editingPost.notes || "",
        image: editingPost.image || null,
        reelCover: editingPost.reelCover || null,
        scheduledDate: editingPost.scheduledDate || "",
        scheduledTime: editingPost.scheduledTime || "09:00"
      });
    } else if (isOpen && selectedDate) {
      // Set default scheduled date to selected date
      const defaultDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
      setFormData(prev => ({
        ...prev,
        scheduledDate: defaultDate
      }));
    }
  }, [isOpen, selectedDate, currentMonth, editingPost]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadToCloudinary = async (file, type = "image") => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'content_planner');

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/media/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        return response.data.media;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFromCloudinary = async (publicId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/media/${encodeURIComponent(publicId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast({
        title: "File Deleted",
        description: "File has been removed successfully.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image (JPG, PNG, GIF) or video (MP4, MOV).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    const uploadResult = await uploadToCloudinary(file, type);
    if (uploadResult) {
      handleInputChange(type, uploadResult);
      toast({
        title: "Upload Successful",
        description: `${type === 'image' ? 'Main content' : 'Reel cover'} uploaded successfully!`,
      });
    }
  };

  const handleDeleteMedia = async (type) => {
    const mediaData = formData[type];
    if (mediaData && mediaData.public_id) {
      await deleteFromCloudinary(mediaData.public_id);
    }
    handleInputChange(type, null);
  };

  const handleSavePost = () => {
    if (!formData.type || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the content type and category.",
        variant: "destructive"
      });
      return;
    }

    const updatedData = { ...monthlyData };
    if (!updatedData[monthKey]) {
      updatedData[monthKey] = {};
    }
    if (!updatedData[monthKey].posts) {
      updatedData[monthKey].posts = {};
    }
    if (!updatedData[monthKey].posts[dateKey]) {
      updatedData[monthKey].posts[dateKey] = [];
    }

    if (editingPost) {
      // Update existing post
      const postIndex = updatedData[monthKey].posts[dateKey].findIndex(post => post.id === editingPost.id);
      if (postIndex !== -1) {
        updatedData[monthKey].posts[dateKey][postIndex] = {
          ...editingPost,
          ...formData,
          updatedAt: new Date().toISOString()
        };
      }
      
      toast({
        title: "Post Updated!",
        description: "Your content has been updated successfully.",
      });
    } else {
      // Create new post
      const newPost = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      updatedData[monthKey].posts[dateKey].push(newPost);
      
      toast({
        title: "Post Saved!",
        description: "Your content has been planned successfully.",
      });
    }

    setMonthlyData(updatedData);

    // Trigger preview update
    if (onPostUpdate) {
      onPostUpdate();
    }

    onClose();
  };

  const handleDeletePost = () => {
    if (!editingPost) return;

    const updatedData = { ...monthlyData };
    if (updatedData[monthKey]?.posts?.[dateKey]) {
      updatedData[monthKey].posts[dateKey] = updatedData[monthKey].posts[dateKey].filter(
        post => post.id !== editingPost.id
      );
      
      // Remove empty date entries
      if (updatedData[monthKey].posts[dateKey].length === 0) {
        delete updatedData[monthKey].posts[dateKey];
      }
    }

    setMonthlyData(updatedData);

    // Trigger preview update
    if (onPostUpdate) {
      onPostUpdate();
    }

    toast({
      title: "Post Deleted!",
      description: "The post has been removed from your calendar.",
    });

    onClose();
  };

  const selectBrainstormIdea = (ideaText) => {
    handleInputChange('caption', ideaText);
    toast({
      title: "Idea Added!",
      description: "Brainstorm idea has been added to your caption.",
    });
  };

  const downloadImage = (imageUrl, filename) => {
    if (!imageUrl) return;
    
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

  const copyCaption = (caption) => {
    navigator.clipboard.writeText(caption).then(() => {
      toast({
        title: "Caption Copied!",
        description: "The caption has been copied to your clipboard.",
      });
    }).catch(() => {
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
      <DialogContent className="max-w-full md:max-w-4xl max-h-[90vh] overflow-y-auto bg-[#fffaf1] border-[#bb9477] m-0 md:m-6">
        <DialogHeader className="bg-[#472816] text-[#fffaf1] -mx-6 -mt-6 px-4 md:px-6 py-4 mb-6">
          <DialogTitle className="text-lg md:text-2xl">
            Plan Content - {currentMonth.toLocaleDateString('en-US', { month: 'long' })} {selectedDate}, {currentMonth.getFullYear()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0">
          {/* Content Planning Form */}
          <div className="space-y-4 md:space-y-6">
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

            {/* Schedule Date and Time */}
            <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
              <h4 className="text-sm font-semibold text-[#472816] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Post
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bb9477]" />
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                      className="border-[#bb9477]/50 focus:border-[#472816] pl-10"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#3f2d1d]/60 mt-2">
                📅 You can reschedule this post to any date and time
              </p>
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

            {/* Media Upload Section */}
            <div className="space-y-4">
              {/* Main Content Upload */}
              <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
                <h4 className="text-sm font-semibold text-[#472816] mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Main Content Upload
                </h4>
                <div className="border-2 border-dashed border-[#bb9477]/50 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {formData.image ? (
                      <div className="relative">
                        <img src={formData.image.url} alt="Preview" className="max-w-full h-24 object-cover rounded mx-auto" />
                        <div className="flex gap-2 mt-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadImage(formData.image.url, 'main-content')}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMedia('image')}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Upload className="w-8 h-8 mx-auto text-[#bb9477] mb-2" />
                        <p className="text-sm text-[#3f2d1d]">
                          {uploading ? "Uploading..." : "Click to upload image or video"}
                        </p>
                        <p className="text-xs text-[#3f2d1d]/60 mt-1">
                          Supports JPG, PNG, GIF, MP4, MOV (max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Reel Cover Upload */}
              <div className="bg-[#bb9477]/5 rounded-lg p-4 border border-[#bb9477]/20">
                <h4 className="text-sm font-semibold text-[#472816] mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Cover Image for Feed Preview
                </h4>
                <p className="text-xs text-[#3f2d1d]/60 mb-3">
                  Optional - will use main content if not provided<br />
                  Cover image for Instagram preview<br />
                  Perfect for Reels, Carousels, or custom thumbnails
                </p>
                <div className="border-2 border-dashed border-[#bb9477]/50 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="reel-cover-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'reelCover')}
                    disabled={uploading}
                  />
                  <label htmlFor="reel-cover-upload" className="cursor-pointer">
                    {formData.reelCover ? (
                      <div className="relative">
                        <img src={formData.reelCover.url} alt="Cover Preview" className="max-w-full h-24 object-cover rounded mx-auto" />
                        <div className="flex gap-2 mt-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadImage(formData.reelCover.url, 'reel-cover')}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMedia('reelCover')}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6">
                        <Upload className="w-6 h-6 mx-auto text-[#bb9477] mb-2" />
                        <p className="text-sm text-[#3f2d1d]">
                          {uploading ? "Uploading..." : "Click to upload cover image"}
                        </p>
                        <p className="text-xs text-[#3f2d1d]/60 mt-1">
                          JPG, PNG, GIF (max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Caption</label>
              <Textarea
                value={formData.caption}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="Write your caption here..."
                className="min-h-24 border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Audio Link (Optional)</label>
              <Input
                value={formData.audioLink}
                onChange={(e) => handleInputChange('audioLink', e.target.value)}
                placeholder="Add audio link for reels..."
                className="border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3f2d1d] mb-2 block">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes..."
                className="min-h-20 border-[#bb9477]/50 focus:border-[#472816]"
              />
            </div>
          </div>

          {/* Existing Posts Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg font-semibold text-[#472816]">
              Planned Posts ({existingPosts.length})
            </h3>
            
            {existingPosts.length === 0 ? (
              <Card className="border-[#bb9477]/30">
                <CardContent className="p-6 text-center">
                  <p className="text-[#3f2d1d]/60">No posts planned for this date yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {existingPosts.map((post, index) => (
                  <Card key={index} className="border-[#bb9477]/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="border-[#472816] text-[#472816]">
                            {post.type}
                          </Badge>
                          <Badge variant="secondary" className="bg-[#bb9477]/20 text-[#3f2d1d]">
                            {post.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          {post.caption && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCaption(post.caption)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                          {(post.image || post.reelCover) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadImage(
                                post.reelCover?.url || post.image?.url, 
                                `${post.topic || 'content'}-${index}`
                              )}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {post.topic && (
                        <h4 className="font-medium text-[#472816] mb-2">{post.topic}</h4>
                      )}
                      
                      {(post.image || post.reelCover) && (
                        <div className="mb-2">
                          <img 
                            src={post.reelCover?.url || post.image?.url} 
                            alt="Content preview" 
                            className="w-full h-32 object-cover rounded"
                          />
                          {post.reelCover && post.image && (
                            <p className="text-xs text-[#3f2d1d]/60 mt-1">📸 Custom cover image</p>
                          )}
                        </div>
                      )}
                      
                      {post.caption && (
                        <p className="text-sm text-[#3f2d1d] line-clamp-3 mb-2">
                          {post.caption}
                        </p>
                      )}
                      
                      {post.pillar && (
                        <Badge variant="outline" className="mr-2 text-xs">
                          {post.pillar}
                        </Badge>
                      )}
                      
                      {post.scheduledTime && (
                        <p className="text-xs text-[#3f2d1d]/60 mt-2">
                          ⏰ Scheduled for {post.scheduledTime}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-6 pt-4 border-t border-[#bb9477]/20 px-4 md:px-0">
          <div>
            {editingPost && (
              <Button 
                variant="destructive" 
                onClick={handleDeletePost}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Post
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="border-[#bb9477] text-[#472816]">
              Cancel
            </Button>
            <Button 
              onClick={handleSavePost} 
              className="bg-[#472816] hover:bg-[#3f2d1d] text-[#fffaf1]"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : editingPost ? "Update Post" : "Save Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPlanningModal;