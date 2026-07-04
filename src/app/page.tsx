import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, Check, FileText, Link as LinkIcon, Briefcase, DownloadCloud, Star, Download, User } from 'lucide-react'
import { getPublicReviews } from '@/lib/actions/review'
import { ScrollAnimation } from '@/components/ScrollAnimation'

type PublicReview = {
  id: string
  rating: number
  feedback: string | null
  author_name: string
  author_avatar: string | null
}

export default async function Home() {
  const reviews = await getPublicReviews()

  return (
    <div className="font-sans text-body-lg overflow-x-hidden bg-[#fafafa] text-[#1d1d1f] antialiased">
      <ScrollAnimation />
      {/* TopNavBar */}
      <nav className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md w-full top-0 sticky z-50 border-b border-outline-variant/30 dark:border-outline/20">
        <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-16">
          <div className="flex items-center gap-8">
            <Link className="text-xl font-bold text-primary dark:text-inverse-primary tracking-tight" href="/">
              Invoku
            </Link>
            <div className="hidden md:flex gap-6">
              <Link className="text-sm text-primary dark:text-inverse-primary font-semibold border-b-2 border-primary py-1" href="#">Fitur</Link>
              <Link className="text-sm text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-inverse-primary transition-colors py-1" href="#">Cara Kerja</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm text-secondary px-4 py-2 hover:bg-primary-container/10 rounded-lg transition-all active:scale-95 duration-150" href="/login">
              Masuk
            </Link>
            <Link className="text-sm bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95 duration-150 shadow-sm" href="/signup">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-semibold mb-6">Baru: Integrasi Pembayaran Otomatis</span>
            <h1 className="text-5xl md:text-[48px] font-bold text-on-background mb-6 leading-[1.15] tracking-tight">
              Buat Invoice Profesional dalam Hitungan Detik.
            </h1>
            <p className="text-secondary text-lg mb-10 max-w-lg leading-relaxed">
              Tinggalkan cara lama. Fokus pada karya Anda, biar Invoku yang mengurus tagihan agar Anda dibayar lebih cepat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <button className="w-full sm:w-auto bg-primary-container text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-primary transition-all shadow-lg shadow-primary-container/20 active:scale-[0.98]">
                  Buat Invoice Sekarang
                </button>
              </Link>
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-outline-variant font-semibold text-secondary hover:bg-surface-container transition-all">
                <PlayCircle className="w-5 h-5" />
                Lihat Demo
              </button>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="absolute -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
            <div className="floating-animation relative">
              {/* Invoice Mockup Card */}
              <div className="glass-card w-[320px] md:w-[440px] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-4">
                      <FileText className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">Invoice #0012</h3>
                    <p className="text-secondary text-xs font-medium">Tagihan dari Studio Kreatif</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">TERBAYAR</span>
                  </div>
                </div>
                <div className="space-y-6 mb-12">
                  <div className="flex justify-between border-b border-outline-variant/30 pb-4">
                    <span className="text-secondary text-sm">Logo Design Retainer</span>
                    <span className="font-bold">Rp 5.000.000</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-4">
                    <span className="text-secondary text-sm">Brand Guidelines</span>
                    <span className="font-bold">Rp 2.500.000</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-secondary text-xs font-medium">Total Tagihan</p>
                    <h4 className="text-2xl font-bold text-primary">Rp 7.500.000</h4>
                  </div>
                  <button className="bg-primary-container text-white p-3 rounded-xl">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* Small Accents */}
              <div className="absolute -top-6 -right-6 glass-card p-4 rounded-xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="text-green-600 w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Dibayar via Link</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-3xl font-semibold mb-4">Dirancang untuk Mempercepat Pembayaran Anda</h2>
            <p className="text-secondary max-w-2xl mx-auto">Fitur cerdas yang memudahkan pengelolaan finansial bisnis kecil dan freelancer tanpa ribet.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="animate-on-scroll p-8 rounded-2xl bg-white border border-outline-variant/50 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Desain Premium</h3>
              <p className="text-secondary text-sm">Invoice yang dikurasi khusus untuk membuat Klien Anda terkesan dengan profesionalitas Anda.</p>
            </div>
            {/* Feature 2 */}
            <div className="animate-on-scroll p-8 rounded-2xl bg-white border border-outline-variant/50 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LinkIcon className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bagikan via Link</h3>
              <p className="text-secondary text-sm">Kirim tagihan semudah membagikan link URL melalui WhatsApp, Email, atau Slack.</p>
            </div>
            {/* Feature 3 */}
            <div className="animate-on-scroll p-8 rounded-2xl bg-white border border-outline-variant/50 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Profil Bisnis</h3>
              <p className="text-secondary text-sm">Kelola tagihan untuk berbagai brand atau proyek berbeda di dalam satu dashboard terpusat.</p>
            </div>
            {/* Feature 4 */}
            <div className="animate-on-scroll p-8 rounded-2xl bg-white border border-outline-variant/50 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DownloadCloud className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Download PDF</h3>
              <p className="text-secondary text-sm">Satu klik untuk konversi otomatis ke format cetak yang rapi dan siap dikirim kapan saja.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 overflow-hidden bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="animate-on-scroll text-3xl font-semibold text-center mb-16 max-w-2xl mx-auto">
            Dipercaya oleh ratusan freelancer & pekerja kreatif Indonesia.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <div key={review.id} className="animate-on-scroll p-8 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col justify-between" style={{ animationDelay: `${i * 100}ms` }}>
                  <div>
                    <div className="flex gap-1 text-yellow-500 mb-6">
                      {[...Array(review.rating)].map((_, index) => (
                        <Star key={index} fill="currentColor" className="w-5 h-5" />
                      ))}
                    </div>
                    <p className="text-on-surface-variant italic mb-8">
                      &ldquo;{review.feedback || 'Aplikasi yang sangat membantu untuk freelancer!'}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {review.author_avatar ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-outline-variant relative shrink-0">
                        <Image fill alt="User Avatar" sizes="48px" className="object-cover" src={review.author_avatar} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{review.author_name}</p>
                      <p className="text-secondary text-xs">Pengguna Invoku</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback jika belum ada ulasan di database
              <div className="animate-on-scroll p-8 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col justify-between md:col-span-3">
                <p className="text-on-surface-variant italic text-center">Jadilah yang pertama memberikan ulasan untuk Invoku!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-margin-mobile bg-surface-container-lowest">
        <div className="animate-on-scroll max-w-container-max mx-auto rounded-[2.5rem] bg-linear-to-br from-surface-container-low to-white border border-primary/10 py-20 px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-container/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Siap menagih dengan gaya?</h2>
            <p className="text-secondary text-lg mb-10 max-w-xl mx-auto">
              Gabung dengan komunitas profesional yang mengutamakan kecepatan dan estetika dalam berbisnis.
            </p>
            <Link href="/signup">
              <button className="bg-primary-container text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-primary transition-all shadow-xl shadow-primary-container/20 active:scale-95">
                Mulai Gratis Sekarang
              </button>
            </Link>
            <p className="mt-6 text-xs font-medium text-secondary">100% Gratis Selamanya.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant/50">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-xl font-bold text-primary dark:text-inverse-primary tracking-tight">Invoku</span>
            <p className="text-secondary dark:text-secondary-fixed-dim text-sm max-w-xs text-center md:text-left">
              Solusi penagihan modern untuk kemajuan bisnis Anda di era digital.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-sm text-secondary dark:text-secondary-fixed-dim hover:underline transition-all opacity-80 hover:opacity-100" href="#">Kebijakan Privasi</Link>
            <Link className="text-sm text-secondary dark:text-secondary-fixed-dim hover:underline transition-all opacity-80 hover:opacity-100" href="#">Syarat & Ketentuan</Link>
            <Link className="text-sm text-secondary dark:text-secondary-fixed-dim hover:underline transition-all opacity-80 hover:opacity-100" href="#">Bantuan</Link>
            <Link className="text-sm text-secondary dark:text-secondary-fixed-dim hover:underline transition-all opacity-80 hover:opacity-100" href="#">Kontak</Link>
          </div>
          <div className="text-secondary dark:text-secondary-fixed-dim text-sm opacity-80">
            © 2026 Invoku. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
