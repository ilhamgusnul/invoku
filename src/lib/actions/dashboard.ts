'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveBusinessProfile } from './context'

export interface DashboardStats {
  totalRevenue: number
  totalOutstanding: number
  totalOverdue: number
  totalInvoices: number
  recentInvoices: any[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const activeProfileId = await getActiveBusinessProfile()

  if (!activeProfileId) {
    return {
      totalRevenue: 0,
      totalOutstanding: 0,
      totalOverdue: 0,
      totalInvoices: 0,
      recentInvoices: []
    }
  }

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (name),
      invoice_items (*)
    `)
    .eq('business_profile_id', activeProfileId)
    .order('created_at', { ascending: false })

  if (error || !invoices) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalRevenue: 0,
      totalOutstanding: 0,
      totalOverdue: 0,
      totalInvoices: 0,
      recentInvoices: []
    }
  }

  let totalRevenue = 0
  let totalOutstanding = 0
  let totalOverdue = 0

  const now = new Date()
  now.setHours(0, 0, 0, 0) // Midnight today

  invoices.forEach(invoice => {
    // Calculate invoice total
    const subtotal = invoice.invoice_items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0)
    const taxAmount = invoice.tax_percent ? subtotal * (invoice.tax_percent / 100) : 0
    let discountAmount = 0
    if (invoice.discount_type === 'percent') {
      discountAmount = subtotal * (invoice.discount_value / 100)
    } else if (invoice.discount_type === 'flat') {
      discountAmount = invoice.discount_value
    }
    const total = subtotal + taxAmount - discountAmount

    // Aggregate based on status
    if (invoice.status === 'paid') {
      totalRevenue += total
    } else if (invoice.status === 'sent') {
      totalOutstanding += total
      
      const dueDate = new Date(invoice.due_date)
      if (dueDate < now) {
        totalOverdue += total
      }
    }
  })

  return {
    totalRevenue,
    totalOutstanding,
    totalOverdue,
    totalInvoices: invoices.length,
    recentInvoices: invoices.slice(0, 5) // Get top 5 recent invoices
  }
}
