import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, Plus, Move } from "lucide-react";
import PostPlanningModal from "./PostPlanningModal";
import { mockPosts } from "../data/mock";
import { useToast } from "../hooks/use-toast";

const ContentCalendar = ({ currentMonth, monthlyData, setMonthlyData, onPostUpdate }) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedPost, setDraggedPost] = useState(null);
  const [draggedFromDate, setDraggedFromDate] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
  const currentPosts = monthlyData[monthKey]?.posts || mockPosts;

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getPostsForDate = (day) => {
    const dateKey = formatDateKey(day);
    return currentPosts[dateKey] || [];
  };

  const handlePostClick = (post, dateKey) => {
    setEditingPost(post);
    const dayOfMonth = parseInt(dateKey.split('-')[2]);
    setSelectedDate(dayOfMonth);
    setIsModalOpen(true);
  };

  const handleDateClick = (day) => {
    setEditingPost(null);
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  // Drag and drop handlers for posts
  const handlePostDragStart = (e, post, fromDate) => {
    e.stopPropagation();
    setDraggedPost(post);
    setDraggedFromDate(fromDate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDateDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDateDrop = (e, targetDay) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedPost || !draggedFromDate) return;

    const targetDateKey = formatDateKey(targetDay);
    const fromDateKey = draggedFromDate;

    if (targetDateKey === fromDateKey) {
      setDraggedPost(null);
      setDraggedFromDate(null);
      return;
    }

    // Move post to new date
    setMonthlyData(prev => {
      const currentData = prev[monthKey] || {};
      const posts = currentData.posts || {};
      
      // Remove post from original date
      const fromPosts = (posts[fromDateKey] || []).filter(p => p.id !== draggedPost.id);
      
      // Add post to target date with updated dateKey
      const updatedPost = { ...draggedPost, dateKey: targetDateKey };
      const toPosts = [...(posts[targetDateKey] || []), updatedPost];
      
      const updatedPosts = { ...posts };
      if (fromPosts.length === 0) {
        delete updatedPosts[fromDateKey];
      } else {
        updatedPosts[fromDateKey] = fromPosts;
      }
      updatedPosts[targetDateKey] = toPosts;

      return {
        ...prev,
        [monthKey]: {
          ...currentData,
          posts: updatedPosts
        }
      };
    });

    toast({
      title: "Post Moved!",
      description: `"${draggedPost.topic}" moved to ${new Date(targetDateKey).toLocaleDateString()}`,
    });

    setDraggedPost(null);
    setDraggedFromDate(null);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32"></div>);
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const posts = getPostsForDate(day);
      const hasContent = posts.length > 0;

      days.push(
        <div
          key={day}
          className={`h-20 md:h-32 border border-[#bb9477]/20 rounded-lg p-1 md:p-2 cursor-pointer transition-all hover:bg-[#bb9477]/5 hover:shadow-md ${
            hasContent ? 'bg-[#bb9477]/10' : 'bg-white'
          } ${draggedPost && draggedFromDate !== formatDateKey(day) ? 'border-[#bb9477] border-2 border-dashed' : ''}`}
          onClick={() => handleDateClick(day)}
          onDragOver={handleDateDragOver}
          onDrop={(e) => handleDateDrop(e, day)}
        >
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <span className={`text-xs md:text-sm font-medium ${
              hasContent ? 'text-[#472816]' : 'text-[#3f2d1d]/70'
            }`}>
              {day}
            </span>
            {hasContent && (
              <Badge variant="secondary" className="bg-[#472816] text-[#fffaf1] text-xs scale-75 md:scale-100">
                {posts.length}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            {posts.slice(0, 1).map((post, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handlePostDragStart(e, post, formatDateKey(day))}
                onClick={() => handlePostClick(post, formatDateKey(day))}
                className="text-xs bg-[#bb9477]/20 rounded px-1 py-1 truncate text-[#3f2d1d] leading-tight relative cursor-pointer hover:bg-[#bb9477]/40 transition-colors group"
              >
                <Move className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-[#472816] bg-white rounded-full p-0.5" />
                <span className="hidden md:inline">{post.type}: </span>{post.topic}
                {post.reelCover?.url && (
                  <span className="absolute -top-1 -left-1 w-2 h-2 bg-[#472816] rounded-full" title="Has cover image"></span>
                )}
              </div>
            ))}
            {posts.length > 1 && (
              <div className="text-xs text-[#472816] font-medium">
                +{posts.length - 1}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#bb9477]/30 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="text-center text-2xl">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-[#472816] py-2 text-xs md:text-sm">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-4">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-[#bb9477]/20 rounded"></div>
              <span className="text-[#3f2d1d]">No content planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#bb9477]/10 border border-[#bb9477]/20 rounded"></div>
              <span className="text-[#3f2d1d]">Content scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#472816]" />
              <span className="text-[#3f2d1d]">Click any date to plan content</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Planning Modal */}
      <PostPlanningModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        selectedDate={selectedDate}
        currentMonth={currentMonth}
        monthlyData={monthlyData}
        setMonthlyData={setMonthlyData}
        onPostUpdate={onPostUpdate}
        editingPost={editingPost}
      />
    </div>
  );
};

export default ContentCalendar;