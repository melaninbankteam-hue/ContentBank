import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, X, Lightbulb, Eye, PenTool, Link, Trash2, Search, Calendar } from "lucide-react";
import { mockBrainstormIdeas, contentCategories } from "../data/mock";

const BrainstormTab = ({ monthKey, monthlyData, setMonthlyData }) => {
  const [newIdea, setNewIdea] = useState("");
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPillar, setSelectedPillar] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAllIdeas, setShowAllIdeas] = useState(false);

  const currentData = monthlyData[monthKey] || {};
  const brainstormIdeas = currentData.brainstormIdeas || [...mockBrainstormIdeas];
  const visualConcepts = currentData.visualConcepts || "Color palette inspiration, Behind-the-scenes office setup, Student success celebration graphics, Course module preview designs, Motivational quote backgrounds";
  const captionDrafts = currentData.captionDrafts || "Ready to turn your expertise into income? 🚀 Swipe for 5 game-changing steps → \n\nPOV: You just launched your first digital course ✨ Comment your niche below! \n\nMYTH: You need thousands of followers to make money online REALITY: I made $10K with just 500 engaged followers 💰";
  const resourcesLinks = currentData.resourcesLinks || "Canva templates: canva.com/templates\nUnsplash photos: unsplash.com\nTrending audio: instagram.com/reels/audio\nHashtag research: hashtagify.me\nAnalytics tool: later.com";

  // Get content pillars from current month data
  const contentPillars = currentData.contentPillars || [];

  // Compile all ideas from all months for the master list
  const getAllIdeas = () => {
    const allIdeas = [];
    Object.entries(monthlyData).forEach(([key, data]) => {
      if (data.brainstormIdeas) {
        data.brainstormIdeas.forEach((idea, index) => {
          const ideaText = typeof idea === 'string' ? idea : idea.text || idea;
          const ideaPillar = typeof idea === 'object' ? idea.pillar || "" : "";
          const ideaCategory = typeof idea === 'object' ? idea.category || "" : "";
          
          allIdeas.push({
            id: `${key}-${index}`,
            text: ideaText,
            pillar: ideaPillar,
            category: ideaCategory,
            monthKey: key
          });
        });
      }
    });
    return allIdeas;
  };

  // Filter ideas based on search and filters
  const filterIdeas = (ideas) => {
    return ideas.filter(idea => {
      const matchesSearch = idea.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPillar = !selectedPillar || idea.pillar === selectedPillar;
      const matchesCategory = !selectedCategory || idea.category === selectedCategory;
      return matchesSearch && matchesPillar && matchesCategory;
    });
  };

  const updateField = (field, value) => {
    setMonthlyData(prev => ({
      ...prev,
      [monthKey]: {
        ...currentData,
        [field]: value
      }
    }));
  };

  const addIdea = () => {
    if (newIdea.trim()) {
      const updatedIdeas = [...brainstormIdeas, newIdea.trim()];
      updateField('brainstormIdeas', updatedIdeas);
      setNewIdea("");
      setIsAddingIdea(false);
    }
  };

  const removeIdea = (index) => {
    const updatedIdeas = brainstormIdeas.filter((_, i) => i !== index);
    updateField('brainstormIdeas', updatedIdeas);
  };

  const editIdea = (index, newValue) => {
    const updatedIdeas = [...brainstormIdeas];
    updatedIdeas[index] = newValue;
    updateField('brainstormIdeas', updatedIdeas);
  };

  return (
    <div className="space-y-6">
      {/* Content Ideas Master List */}
      {showAllIdeas ? (
        <Card className="border-[#bb9477]/30 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Master Content Ideas Library
              </CardTitle>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowAllIdeas(false)}
                className="bg-[#bb9477] text-[#3f2d1d] hover:bg-[#fffaf1]"
              >
                Back to Current Month
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search all content ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-[#bb9477]/50 focus:border-[#472816]"
                />
              </div>
              <Select value={selectedPillar} onValueChange={setSelectedPillar}>
                <SelectTrigger className="w-48 border-[#bb9477]/50 focus:border-[#472816]">
                  <SelectValue placeholder="Filter by pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-pillars">All Pillars</SelectItem>
                  {contentPillars.map(pillar => (
                    <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 border-[#bb9477]/50 focus:border-[#472816]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {contentCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* All Ideas List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filterIdeas(getAllIdeas()).map((idea) => (
                <div key={idea.id} className="p-4 bg-[#bb9477]/5 rounded-lg border border-[#bb9477]/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-[#3f2d1d] font-medium">{idea.text}</p>
                      <div className="flex gap-2 mt-2">
                        {idea.pillar && (
                          <Badge variant="outline" className="bg-[#472816]/10 text-[#472816] border-[#472816]/30 text-xs">
                            {idea.pillar}
                          </Badge>
                        )}
                        {idea.category && (
                          <Badge variant="outline" className="bg-[#bb9477]/10 text-[#3f2d1d] border-[#bb9477] text-xs">
                            {idea.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-3 border-[#bb9477] text-[#3f2d1d] hover:bg-[#bb9477]/10"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Use in Calendar
                    </Button>
                  </div>
                </div>
              ))}
              {filterIdeas(getAllIdeas()).length === 0 && (
                <div className="text-center text-[#3f2d1d]/60 py-8">
                  <Search className="w-12 h-12 mx-auto mb-3 text-[#bb9477]/50" />
                  <p>No ideas found matching your search criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Month Content Ideas */}
          <Card className="border-[#bb9477]/30 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Content Ideas Bank
                </CardTitle>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setShowAllIdeas(true)}
                  className="bg-[#bb9477] text-[#3f2d1d] hover:bg-[#fffaf1]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  View All Ideas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Ideas List */}
                <div className="space-y-3">
                  {brainstormIdeas.map((idea, index) => {
                    const ideaText = typeof idea === 'string' ? idea : idea.text || idea;
                    return (
                      <div key={index} className="group flex items-center justify-between p-3 bg-[#bb9477]/5 rounded-lg border border-[#bb9477]/20 hover:bg-[#bb9477]/10 transition-colors">
                        <input
                          className="flex-1 bg-transparent text-[#3f2d1d] font-medium outline-none border-none"
                          value={ideaText}
                          onChange={(e) => editIdea(index, e.target.value)}
                          placeholder="Enter content idea..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIdea(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Idea */}
                {isAddingIdea ? (
                  <div className="flex gap-2">
                    <Input
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      placeholder="Enter your content idea..."
                      className="flex-1 border-[#bb9477]/50 focus:border-[#472816]"
                      onKeyPress={(e) => e.key === 'Enter' && addIdea()}
                    />
                    <Button 
                      onClick={addIdea} 
                      className="bg-[#bb9477] hover:bg-[#472816] text-white"
                    >
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {setIsAddingIdea(false); setNewIdea("");}}
                      className="border-[#bb9477] text-[#3f2d1d]"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingIdea(true)}
                    className="w-full border-[#bb9477] text-[#3f2d1d] hover:bg-[#bb9477]/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Idea
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Creative Resources Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Visual Concepts */}
        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="w-4 h-4" />
              Visual Concepts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              value={visualConcepts}
              onChange={(e) => updateField('visualConcepts', e.target.value)}
              placeholder="Visual inspiration, color schemes, photo ideas..."
              className="min-h-40 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>

        {/* Caption Drafts */}
        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-base">
              <PenTool className="w-4 h-4" />
              Caption Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              value={captionDrafts}
              onChange={(e) => updateField('captionDrafts', e.target.value)}
              placeholder="Draft captions, hooks, call-to-actions..."
              className="min-h-40 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>

        {/* Resources & Links */}
        <Card className="border-[#bb9477]/30 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#bb9477] text-[#3f2d1d] rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="w-4 h-4" />
              Resources & Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              value={resourcesLinks}
              onChange={(e) => updateField('resourcesLinks', e.target.value)}
              placeholder="Useful links, tools, references..."
              className="min-h-40 border-[#bb9477]/50 focus:border-[#472816] resize-none text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Brainstorming Prompts */}
      <Card className="border-[#bb9477]/30 shadow-lg bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/5">
        <CardHeader className="bg-gradient-to-r from-[#3f2d1d] to-[#472816] text-[#fffaf1] rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Content Brainstorming Prompts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-[#472816] text-sm">Educational Content Ideas</h4>
              <ul className="space-y-2 text-sm text-[#3f2d1d]">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"5 mistakes I made when starting my course business"</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"The exact process I use to validate course ideas"</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"Why most people fail at online courses (and how to avoid it)"</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"Behind the scenes: My course creation process"</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-[#472816] text-sm">Engagement Content Ideas</h4>
              <ul className="space-y-2 text-sm text-[#3f2d1d]">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"This or That: Course platforms edition"</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"Tell me your biggest business challenge in the comments"</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"Rate my morning routine from 1-10"</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bb9477] rounded-full mt-2 flex-shrink-0"></div>
                  <span>"What questions do you have about digital courses?"</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#bb9477]/10 rounded-lg border border-[#bb9477]/20">
            <h4 className="font-semibold text-[#472816] mb-2 text-sm">💡 Pro Tip</h4>
            <p className="text-sm text-[#3f2d1d]">
              Keep a running list of content ideas as they come to you. The best content often comes from real conversations 
              with your audience, common questions you receive, or challenges you've personally overcome.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrainstormTab;