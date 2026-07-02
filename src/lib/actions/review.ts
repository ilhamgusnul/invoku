'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional()
})

export async function submitReview(rating: number, feedback: string) {
  // Validate input
  const parseResult = reviewSchema.safeParse({ rating, feedback })
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input data' }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Check if they already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Update
    const { error } = await supabase
      .from('reviews')
      .update({ rating, feedback })
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    // Insert
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        rating,
        feedback: feedback || null
      })

    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getPublicReviews() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get latest 6 reviews with high ratings
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .gte('rating', 4) // Only show 4 and 5 star reviews on landing page
    .order('created_at', { ascending: false })
    .limit(6)

  if (error || !reviews) {
    return []
  }

  // Fetch all users to map their names
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError || !users) {
    return reviews.map(r => ({ ...r, author_name: 'Pengguna Invoku', author_avatar: null }))
  }

  const userMap = new Map(users.map(u => [u.id, u]))

  return reviews.map(review => {
    const user = userMap.get(review.user_id)
    const author_name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Pengguna Invoku'
    const author_avatar = user?.user_metadata?.avatar_url || null
    return {
      ...review,
      author_name,
      author_avatar
    }
  })
}
