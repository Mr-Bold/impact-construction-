# Impact Construction Platform - Database Schema

## Overview
Complete PostgreSQL schema for the Impact Construction Platform using Supabase.

---

## Users & Authentication

### users (Supabase Auth - Managed)
```sql
-- Managed by Supabase Auth
-- Columns: id (UUID), email, encrypted_password, etc.
```

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20) DEFAULT 'customer', -- 'customer' or 'admin'
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

---

## Projects Management

### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  display_order INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  location VARCHAR(255),
  completion_date DATE,
  services TEXT[], -- Array of services provided
  materials TEXT[], -- Array of materials used
  project_duration VARCHAR(50), -- e.g., "3 weeks"
  cover_image_url TEXT,
  video_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  view_count INT DEFAULT 0,
  
  CONSTRAINT title_not_empty CHECK (length(title) > 0)
);

CREATE INDEX idx_projects_category_id ON projects(category_id);
CREATE INDEX idx_projects_is_featured ON projects(is_featured);
CREATE INDEX idx_projects_is_published ON projects(is_published);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

### project_media
```sql
CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_type VARCHAR(20), -- 'image', 'video', 'before', 'after'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT, -- For videos
  display_order INT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT media_type_valid CHECK (media_type IN ('image', 'video', 'before', 'after'))
);

CREATE INDEX idx_project_media_project_id ON project_media(project_id);
CREATE INDEX idx_project_media_type ON project_media(media_type);
```

---

## Project Interactions

### likes
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, project_id)
);

CREATE INDEX idx_likes_project_id ON likes(project_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

### ratings
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_customer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, project_id)
);

CREATE INDEX idx_ratings_project_id ON ratings(project_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
```

### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT content_not_empty CHECK (length(content) > 0)
);

CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_is_approved ON comments(is_approved);
```

### project_views
```sql
CREATE TABLE project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous
  viewed_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT at_least_one_identifier CHECK (project_id IS NOT NULL)
);

CREATE INDEX idx_project_views_project_id ON project_views(project_id);
CREATE INDEX idx_project_views_viewed_at ON project_views(viewed_at DESC);
```

---

## Service Requests

### service_requests
```sql
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(20) UNIQUE DEFAULT 'REQ-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(CAST(NEXTVAL('request_number_seq') AS TEXT), 5, '0'),
  user_id UUID NOT NULL REFERENCES profiles(id),
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Request Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  location VARCHAR(255) NOT NULL,
  requested_service VARCHAR(255) NOT NULL,
  description TEXT,
  preferred_date DATE,
  estimated_budget DECIMAL(10, 2),
  
  -- Status & Tracking
  status VARCHAR(50) DEFAULT 'submitted', -- submitted, reviewing, quoted, accepted, in_progress, completed, rejected
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('submitted', 'reviewing', 'quoted', 'accepted', 'in_progress', 'completed', 'rejected'))
);

CREATE SEQUENCE request_number_seq START 1;
CREATE INDEX idx_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_requests_created_at ON service_requests(created_at DESC);
```

### request_attachments
```sql
CREATE TABLE request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attachments_request_id ON request_attachments(request_id);
```

### quotations
```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  service_description TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  additional_charges DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) GENERATED ALWAYS AS (estimated_cost + additional_charges) STORED,
  valid_until DATE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  customer_response_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'declined'))
);

CREATE INDEX idx_quotations_request_id ON quotations(request_id);
```

### request_messages
```sql
CREATE TABLE request_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message_content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'message', -- message, status_update, note
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT content_not_empty CHECK (length(message_content) > 0)
);

CREATE INDEX idx_messages_request_id ON request_messages(request_id);
CREATE INDEX idx_messages_sender_id ON request_messages(sender_id);
```

---

## Notifications

### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50), -- request_submitted, status_changed, quote_provided, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_entity_type VARCHAR(50), -- project, request, quotation
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## Business Settings

### business_settings
```sql
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255),
  business_email VARCHAR(255),
  business_phone VARCHAR(20),
  business_whatsapp VARCHAR(20),
  business_address TEXT,
  business_hours JSONB, -- {"monday": {"open": "09:00", "close": "18:00"}, ...}
  business_logo_url TEXT,
  business_banner_url TEXT,
  social_media JSONB, -- {"facebook": "url", "instagram": "url", ...}
  
  about_us TEXT,
  mission_statement TEXT,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);
```

---

## Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
```

### Example Policies (implement based on requirements)
```sql
-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Only admins can create projects
CREATE POLICY "Only admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Everyone can view published projects
CREATE POLICY "Published projects are visible to everyone"
  ON projects FOR SELECT
  USING (is_published = true);

-- Authenticated users can like projects
CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Storage Buckets (Supabase Storage)

### Create buckets:
1. **projects** - Project images and videos
   - Path: `projects/{projectId}/{filename}`
   - Public: Yes (for sharing)

2. **requests** - Customer request attachments
   - Path: `requests/{requestId}/{filename}`
   - Public: No (private)

3. **avatars** - User profile pictures
   - Path: `avatars/{userId}/{filename}`
   - Public: Yes

4. **business** - Business logos, banners
   - Path: `business/{type}/{filename}`
   - Public: Yes

---

## Indexes for Performance

```sql
-- Already created above, summary:
CREATE INDEX idx_projects_category_id ON projects(category_id);
CREATE INDEX idx_projects_is_featured ON projects(is_featured);
CREATE INDEX idx_projects_is_published ON projects(is_published);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX idx_project_media_project_id ON project_media(project_id);
CREATE INDEX idx_likes_project_id ON likes(project_id);
CREATE INDEX idx_ratings_project_id ON ratings(project_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);

CREATE INDEX idx_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

---

## Data Relationships Diagram

```
users (Supabase Auth)
  └── profiles
       ├── projects (created_by)
       │    ├── project_media
       │    ├── likes (user_id → profiles)
       │    ├── ratings (user_id → profiles)
       │    ├── comments (user_id → profiles)
       │    └── project_views (user_id → profiles)
       ├── service_requests (user_id)
       │    ├── request_attachments
       │    ├── request_messages (sender_id → profiles)
       │    └── quotations
       ├── request_messages (sender_id)
       └── notifications (user_id)
       
categories
  └── projects (category_id)

business_settings
  └── updated_by (user_id → profiles)
```

---

## Setup Instructions

1. Create Supabase project
2. Run all CREATE TABLE statements
3. Enable RLS on all tables
4. Create RLS policies
5. Create storage buckets
6. Configure storage policies
7. Create indexes
8. Test data connections from backend

---

## Notes

- All IDs use UUID for security
- Timestamps track creation and updates
- Foreign keys ensure referential integrity
- Indexes optimize query performance
- RLS provides row-level security
- Storage buckets organized by type
- Sequences generate unique request numbers

---

Ready to implement? Let me know which table to start with! 🚀
