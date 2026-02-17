-- Enums
CREATE TYPE post_type AS ENUM ('CLUB_ANNOUNCEMENT', 'MEMBER_POST', 'CHAPTER_UPDATE', 'GENERAL');
CREATE TYPE notification_type AS ENUM ('NEW_MEMBER', 'NEW_POST', 'READING_REMINDER', 'CLUB_INVITE', 'ANNOUNCEMENT');
CREATE TYPE reading_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE chat_room_type AS ENUM ('GENERAL', 'SPOILER', 'CHAPTER');
CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED');
CREATE TYPE club_role AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER');
CREATE TYPE club_visibility AS ENUM ('PUBLIC', 'PRIVATE');

-- 1. Profiles (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Books
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover_url TEXT,
  total_pages INT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clubs
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  visibility club_visibility DEFAULT 'PUBLIC',
  is_archived BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  default_start_date TIMESTAMPTZ NOT NULL,
  default_end_date TIMESTAMPTZ NOT NULL,
  book_id UUID REFERENCES public.books(id) NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chapters
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  chapter_number INT NOT NULL,
  start_page INT NOT NULL,
  end_page INT NOT NULL
);

-- 5. Club Memberships
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role club_role DEFAULT 'MEMBER',
  is_suspended BOOLEAN DEFAULT FALSE,
  suspended_until TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- 6. Reading Progress
CREATE TABLE public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id),
  current_page INT,
  status reading_status DEFAULT 'NOT_STARTED',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- 7. Chat Rooms
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  type chat_room_type NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Chat Messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type post_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Notifications & Settings
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  new_member_email BOOLEAN DEFAULT TRUE,
  new_post_email BOOLEAN DEFAULT TRUE,
  reading_reminder_email BOOLEAN DEFAULT TRUE,
  announcement_email BOOLEAN DEFAULT TRUE,
  club_invite_email BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Club Invites & Reports
CREATE TABLE public.club_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INT,
  uses INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL
);

CREATE TABLE public.club_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  reported_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 12. Reading Timeline (Custom user timelines)
CREATE TABLE public.reading_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  UNIQUE(club_id, user_id)
);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at (Example for profiles)
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_clubs_modtime BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();