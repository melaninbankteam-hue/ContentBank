# The Melanin Bank - Content Planner: API Contracts & Integration Plan

## API Endpoints Required

### Monthly Data Endpoints
```
GET    /api/months/{monthKey}           - Get monthly data for specific month
POST   /api/months/{monthKey}           - Create/update monthly data
PUT    /api/months/{monthKey}           - Update monthly data
DELETE /api/months/{monthKey}           - Delete monthly data
```

### Content Ideas Endpoints
```
GET    /api/content-ideas               - Get all content ideas across months
POST   /api/content-ideas               - Add new content idea
PUT    /api/content-ideas/{ideaId}      - Update content idea
DELETE /api/content-ideas/{ideaId}      - Delete content idea
```

### Posts Endpoints
```
GET    /api/posts/{monthKey}/{dateKey}  - Get posts for specific date
POST   /api/posts                       - Create new post
PUT    /api/posts/{postId}              - Update post
DELETE /api/posts/{postId}              - Delete post
```

### User Authentication
```
POST   /api/auth/login                  - User login
POST   /api/auth/logout                 - User logout
GET    /api/auth/verify                 - Verify token
```

## MongoDB Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  createdAt: Date,
  isActive: Boolean
}
```

### MonthlyData Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  monthKey: String, // "YYYY-MM"
  goals: String,
  themes: String,
  metrics: String,
  events: String,
  notes: String,
  revenueGoals: String,
  contentPillars: [String],
  visualConcepts: String,
  captionDrafts: String,
  resourcesLinks: String,
  growthGoals: String,
  performanceNotes: String,
  analytics: {
    followers: Number,
    views: Number,
    nonFollowerViews: Number,
    reach: Number,
    profileVisits: Number,
    websiteClicks: Number,
    emailSubscribers: Number,
    dmMessages: Number,
    interactions: Number,
    growthPercentage: {
      followers: Number,
      views: Number,
      reach: Number,
      interactions: Number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### ContentIdeas Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  monthKey: String,
  text: String,
  pillar: String,
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  monthKey: String,
  dateKey: String, // "YYYY-MM-DD"
  type: String, // "Post", "Story", "Reel", "Carousel"
  category: String, // "Credibility", "Connection", "Community", "Conversion"
  pillar: String,
  topic: String,
  caption: String,
  imageUrl: String,
  audioLink: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Data Migration from localStorage

Currently mocked data in localStorage will be replaced with:
1. **Monthly Overview**: Replace mock data with API calls to fetch/save monthly data
2. **Content Ideas**: Replace brainstormIdeas array with API calls to content-ideas endpoints
3. **Posts**: Replace posts object with API calls to posts endpoints
4. **Analytics**: Replace mock analytics with user-specific data

## Frontend Integration Changes

### ContentPlanner.js
- Replace localStorage with API calls
- Add user authentication state management
- Add loading states for API calls

### BrainstormTab.js
- Replace local brainstormIdeas management with API calls
- Update getAllIdeas() to fetch from API
- Update add/edit/delete to make API calls

### Calendar Components
- Replace localStorage posts with API fetched posts
- Update post creation/editing to use API

### Analytics Tab
- Replace mock analytics with user data from API
- Save analytics data to database

## Authentication Flow
1. User visits app → redirected to login if not authenticated
2. Login successful → JWT token stored and used for all API calls
3. All data operations require valid authentication
4. Member-only access controlled by user authentication

## File Upload Strategy
- Images uploaded to cloud storage (AWS S3/Cloudinary)
- Store image URLs in database
- Frontend displays images from stored URLs

## Error Handling
- Network errors with fallback to local storage
- Authentication errors with redirect to login
- Validation errors with user feedback
- Loading states during API calls

## Performance Optimizations
- Pagination for large datasets
- Debounced API calls for real-time updates
- Caching frequently accessed data
- Lazy loading for heavy components