import { useCallback } from 'react'
import { api } from '../utils/api'

export function useRazorpay() {
  const pay = useCallback(async ({ bookingId, amount, guest, onSuccess, onError }) => {
    try {
      const orderRes = await api.payments.createOrder({ bookingId, amount })
      const { razorpayOrderId } = orderRes.data

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'MANNAT Lodge',
        description: 'Lodge Booking Payment',
        image: '/logo.png',
        order_id: razorpayOrderId,
        prefill: {
          name: `${guest.first_name} ${guest.last_name}`,
          email: guest.email,
          contact: guest.phone ? `+91${guest.phone}` : '',
        },
        theme: { color: '#1a4a6b' },
        config: {
          display: {
            // show international card option
            hide: [],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await api.payments.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId,
            })
            onSuccess?.(verifyRes.data)
          } catch (err) {
            onError?.(err)
          }
        },
        modal: {
          ondismiss: () => onError?.({ message: 'Payment cancelled' }),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      onError?.(err)
    }
  }, [])

  return { pay }
}
