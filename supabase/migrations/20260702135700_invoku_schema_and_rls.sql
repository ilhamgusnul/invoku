-- ==========================================
-- 1. Tabel Ulasan (Reviews)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews" 
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE USING (auth.uid() = user_id);


-- ==========================================
-- 2. Storage Buckets (Logos & Avatars)
-- ==========================================

-- Buat bucket "logos" jika belum ada
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Logos are publicly accessible" ON storage.objects;
CREATE POLICY "Logos are publicly accessible" 
ON storage.objects FOR SELECT USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Users can upload logos" ON storage.objects;
CREATE POLICY "Users can upload logos" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update logos" ON storage.objects;
CREATE POLICY "Users can update logos" 
ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');


-- Buat bucket "avatars" jika belum ada
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible" 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');


-- ==========================================
-- 3. RLS (Row Level Security) untuk Core Data
-- ==========================================
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Profil Bisnis (hanya pemilik)
DROP POLICY IF EXISTS "business_profiles_policy" ON public.business_profiles;
CREATE POLICY "business_profiles_policy" ON public.business_profiles 
FOR ALL USING (auth.uid() = user_id);

-- Klien (cek lewat business_profiles)
DROP POLICY IF EXISTS "clients_policy" ON public.clients;
CREATE POLICY "clients_policy" ON public.clients 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles
    WHERE business_profiles.id = clients.business_profile_id
    AND business_profiles.user_id = auth.uid()
  )
);

-- Invoices (cek lewat business_profiles)
DROP POLICY IF EXISTS "invoices_policy" ON public.invoices;
CREATE POLICY "invoices_policy" ON public.invoices 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles
    WHERE business_profiles.id = invoices.business_profile_id
    AND business_profiles.user_id = auth.uid()
  )
);

-- Invoice Items (cek lewat invoices -> business_profiles)
DROP POLICY IF EXISTS "invoice_items_policy" ON public.invoice_items;
CREATE POLICY "invoice_items_policy" ON public.invoice_items 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    JOIN public.business_profiles ON business_profiles.id = invoices.business_profile_id
    WHERE invoices.id = invoice_items.invoice_id
    AND business_profiles.user_id = auth.uid()
  )
);
