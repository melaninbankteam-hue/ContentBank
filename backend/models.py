from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_active: bool
    created_at: datetime

# Analytics Model
class Analytics(BaseModel):
    followers: int = 0
    views: int = 0
    non_follower_views: int = 0
    reach: int = 0
    profile_visits: int = 0
    website_clicks: int = 0
    email_subscribers: int = 0
    dm_messages: int = 0
    interactions: int = 0
    growth_percentage: Dict[str, float] = Field(default_factory=dict)

# Monthly Data Model
class MonthlyData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month_key: str  # "YYYY-MM"
    goals: str = ""
    themes: str = ""
    metrics: str = ""
    events: str = ""
    notes: str = ""
    revenue_goals: str = ""
    content_pillars: List[str] = Field(default_factory=list)
    visual_concepts: str = ""
    caption_drafts: str = ""
    resources_links: str = ""
    growth_goals: str = ""
    performance_notes: str = ""
    analytics: Analytics = Field(default_factory=Analytics)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MonthlyDataCreate(BaseModel):
    month_key: str
    goals: Optional[str] = ""
    themes: Optional[str] = ""
    metrics: Optional[str] = ""
    events: Optional[str] = ""
    notes: Optional[str] = ""
    revenue_goals: Optional[str] = ""
    content_pillars: Optional[List[str]] = Field(default_factory=list)
    visual_concepts: Optional[str] = ""
    caption_drafts: Optional[str] = ""
    resources_links: Optional[str] = ""
    growth_goals: Optional[str] = ""
    performance_notes: Optional[str] = ""
    analytics: Optional[Analytics] = Field(default_factory=Analytics)

# Content Ideas Model
class ContentIdea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month_key: str
    text: str
    pillar: str = ""
    category: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContentIdeaCreate(BaseModel):
    month_key: str
    text: str
    pillar: Optional[str] = ""
    category: Optional[str] = ""

class ContentIdeaUpdate(BaseModel):
    text: Optional[str] = None
    pillar: Optional[str] = None
    category: Optional[str] = None

# Posts Model
class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month_key: str
    date_key: str  # "YYYY-MM-DD"
    type: str  # "Post", "Story", "Reel", "Carousel"
    category: str = ""  # "Credibility", "Connection", "Community", "Conversion"
    pillar: str = ""
    topic: str
    caption: str = ""
    image_url: str = ""
    audio_link: str = ""
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    month_key: str
    date_key: str
    type: str
    category: Optional[str] = ""
    pillar: Optional[str] = ""
    topic: str
    caption: Optional[str] = ""
    image_url: Optional[str] = ""
    audio_link: Optional[str] = ""
    notes: Optional[str] = ""

class PostUpdate(BaseModel):
    type: Optional[str] = None
    category: Optional[str] = None
    pillar: Optional[str] = None
    topic: Optional[str] = None
    caption: Optional[str] = None
    image_url: Optional[str] = None
    audio_link: Optional[str] = None
    notes: Optional[str] = None