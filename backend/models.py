from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
import uuid

# Status Check Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    social_handle: Optional[str] = None
    password_hash: str
    is_active: bool = True
    is_admin: bool = False
    approval_status: str = "pending"  # pending, approved, denied
    last_active: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str
    socialHandle: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    social_handle: Optional[str] = None
    is_active: bool
    is_admin: bool = False
    approval_status: str = "pending"
    last_active: Optional[datetime] = None
    created_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    approval_status: Optional[str] = None

# Monthly Data Models
class MonthlyData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month_key: str
    goals: str = ""
    themes: str = ""
    content_pillars: List[str] = Field(default_factory=list)
    brainstorm_ideas: List[str] = Field(default_factory=list)
    posts: Dict[str, List[Dict]] = Field(default_factory=dict)
    analytics: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MonthlyDataCreate(BaseModel):
    goals: Optional[str] = ""
    themes: Optional[str] = ""
    content_pillars: Optional[List[str]] = Field(default_factory=list)
    brainstorm_ideas: Optional[List[str]] = Field(default_factory=list)
    analytics: Optional[Dict[str, Any]] = Field(default_factory=dict)

# Content Idea Models
class ContentIdea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month_key: str = ""
    text: str
    pillar: str = ""
    category: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContentIdeaCreate(BaseModel):
    month_key: Optional[str] = ""
    text: str
    pillar: Optional[str] = ""
    category: Optional[str] = ""

class ContentIdeaUpdate(BaseModel):
    text: Optional[str] = None
    pillar: Optional[str] = None
    category: Optional[str] = None

# Post Models
class MediaUpload(BaseModel):
    url: str
    public_id: str
    width: Optional[int] = None
    height: Optional[int] = None

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month_key: str
    date_key: str
    content_type: str
    category: str = ""
    pillar: str = ""
    topic: str = ""
    caption: str = ""
    audio_link: str = ""
    notes: str = ""
    image: Optional[MediaUpload] = None
    reel_cover: Optional[MediaUpload] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = "09:00"
    instagram_preview_position: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    month_key: str
    date_key: str
    content_type: str
    category: Optional[str] = ""
    pillar: Optional[str] = ""
    topic: Optional[str] = ""
    caption: Optional[str] = ""
    audio_link: Optional[str] = ""
    notes: Optional[str] = ""
    image: Optional[MediaUpload] = None
    reel_cover: Optional[MediaUpload] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = "09:00"
    instagram_preview_position: Optional[int] = None

class PostUpdate(BaseModel):
    content_type: Optional[str] = None
    category: Optional[str] = None
    pillar: Optional[str] = None
    topic: Optional[str] = None
    caption: Optional[str] = None
    audio_link: Optional[str] = None
    notes: Optional[str] = None
    image: Optional[MediaUpload] = None
    reel_cover: Optional[MediaUpload] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    instagram_preview_position: Optional[int] = None
    date_key: Optional[str] = None
    month_key: Optional[str] = None