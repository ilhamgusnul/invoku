'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { submitReview } from '@/lib/actions/review'

const ReviewModal = dynamic(() => Promise.resolve(ReviewModalComponent), { ssr: false })

export function ReviewBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    const status = localStorage.getItem('invoku_review_status')
    return status !== 'completed' && status !== 'dismissed'
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('invoku_review_status') === 'completed'
  })
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleDismiss = () => {
    localStorage.setItem('invoku_review_status', 'dismissed')
    setIsVisible(false)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const res = await submitReview(rating, feedback)
      if (res.success) {
        localStorage.setItem('invoku_review_status', 'completed')
        setHasReviewed(true)
        setIsModalOpen(false)
        setIsVisible(false)
      } else {
        alert(res.error || 'Gagal mengirim ulasan')
      }
    } catch {
      alert('Terjadi kesalahan')
    } finally {
      setIsPending(false)
    }
  }

  const openReviewModal = () => {
    setIsModalOpen(true)
  }

  if (hasReviewed) {
    // Return a subtle button option instead of banner
    return (
      <div className="flex justify-end mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={openReviewModal}
          className="text-xs text-[#7a7a7a] hover:text-[#1d1d1f]"
        >
          <Star className="w-3.5 h-3.5 mr-1.5" />
          Edit Ulasan Anda
        </Button>
        <ReviewModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSubmitReview}
          rating={rating}
          setRating={setRating}
          feedback={feedback}
          setFeedback={setFeedback}
          isPending={isPending}
        />
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <>
      <Card className="mb-8 p-4 bg-linear-to-r from-blue-50 to-white border-[#e0e0e0] shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 fade-in duration-500">
        <div className="absolute top-0 right-0 p-2">
          <button onClick={handleDismiss} className="text-[#7a7a7a] hover:text-[#1d1d1f] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pr-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-primary-container" fill="currentColor" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-[#1d1d1f]">Bagaimana pengalaman Anda menggunakan Invoku?</h3>
            <p className="text-sm text-[#7a7a7a] mt-1">Ulasan Anda sangat berarti bagi pengembangan aplikasi ini ke depannya.</p>
          </div>
          <Button 
            onClick={openReviewModal}
            className="w-full sm:w-auto bg-primary-container hover:bg-primary text-white rounded-xl whitespace-nowrap"
          >
            Berikan Ulasan
          </Button>
        </div>
      </Card>

      <ReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmitReview}
        rating={rating}
        setRating={setRating}
        feedback={feedback}
        setFeedback={setFeedback}
        isPending={isPending}
      />
    </>
  )
}

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  rating: number
  setRating: (r: number) => void
  feedback: string
  setFeedback: (f: string) => void
  isPending: boolean
}

function ReviewModalComponent({ isOpen, onClose, onSubmit, rating, setRating, feedback, setFeedback, isPending }: ReviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Berikan Ulasan</DialogTitle>
          <DialogDescription>
            Bantu kami meningkatkan kualitas Invoku.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-10 h-10 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`} 
                  fill={rating >= star ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Masukan Anda (Opsional)</label>
            <textarea 
              className="w-full h-24 p-3 border border-[#e0e0e0] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container resize-none"
              placeholder="Apa yang paling Anda sukai atau yang perlu kami perbaiki?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>
          <Button type="submit" className="w-full bg-primary-container hover:bg-primary text-white rounded-xl h-11" disabled={rating === 0 || isPending}>
            {isPending ? 'Mengirim...' : 'Kirim Ulasan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
