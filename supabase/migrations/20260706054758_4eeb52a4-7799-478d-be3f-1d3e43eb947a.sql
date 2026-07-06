
CREATE TABLE public.link_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'midnight',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]{2,32}$')
);

CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'link',
  position INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  clicks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_links_user ON public.links(user_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_profiles TO authenticated;
GRANT SELECT ON public.link_profiles TO anon;
GRANT ALL ON public.link_profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT SELECT ON public.links TO anon;
GRANT ALL ON public.links TO service_role;

ALTER TABLE public.link_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view link profiles" ON public.link_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners can insert own profile" ON public.link_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own profile" ON public.link_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete own profile" ON public.link_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public can view active links" ON public.links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners can insert own links" ON public.links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own links" ON public.links FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete own links" ON public.links FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_link_profiles_updated BEFORE UPDATE ON public.link_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_links_updated BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
