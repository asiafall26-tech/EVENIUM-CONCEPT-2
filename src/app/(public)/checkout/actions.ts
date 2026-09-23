'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function processCheckout(data: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=checkout')
  }

  // 1. Create the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      name: data.name,
      type: data.type,
      date: data.date,
      budget_estimated: data.budgetEstimated,
      plan_id: data.planId,
      invitation_type: data.invitationType,
      status: 'active'
    })
    .select()
    .single()

  if (eventError || !event) {
    console.error('Error creating event:', eventError)
    throw new Error('Failed to create event')
  }

  // 2. Create the order (payment)
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      event_id: event.id,
      plan_id: data.planId,
      amount: data.planPrice,
      payment_method: data.paymentMethod,
      status: 'completed'
    })

  if (orderError) {
    console.error('Error creating order:', orderError)
    throw new Error('Failed to create order')
  }

  // 3. Create the event invitation
  const { error: invError } = await supabase
    .from('event_invitations')
    .insert({
      event_id: event.id,
      template_id: data.templateId,
    })

  if (invError) {
    console.error('Error creating invitation:', invError)
  }

  // Success, redirect to success page
  redirect(`/checkout/success?eventId=${event.id}`)
}
