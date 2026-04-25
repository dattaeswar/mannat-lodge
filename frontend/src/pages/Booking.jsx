import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BookingStepper from '../components/booking/BookingStepper'
import Step1RoomSelection from '../components/booking/Step1_RoomSelection'
import Step2GuestForm from '../components/booking/Step2_GuestForm'
import Step3IDUpload from '../components/booking/Step3_IDUpload'
import Step4Review from '../components/booking/Step4_Review'
import Step5Payment from '../components/booking/Step5_Payment'

export default function Booking() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    roomId: searchParams.get('roomId') || '',
    room: null,
    guests: 1,
    nights: 0,
    totalPrice: 0,
    guest: null,
    idProofFile: null,
    idProofPreview: null,
    guestNotes: '',
  })

  function updateData(updates) {
    setBookingData((prev) => ({ ...prev, ...updates }))
  }

  return (
    <main className="pt-16 min-h-screen bg-sky-dawn">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="text-center mb-6">
          <p className="font-body text-river text-sm font-medium uppercase tracking-widest">Book Your Stay</p>
          <h1 className="font-heading text-3xl text-primary-dark font-bold mt-1">Reserve at MANNAT</h1>
        </div>

        {/* Stepper */}
        <BookingStepper currentStep={step} />

        {/* Step card */}
        <div className="card p-6 sm:p-8 mt-2 animate-slide-up">
          {step === 1 && (
            <Step1RoomSelection
              data={bookingData}
              onChange={updateData}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2GuestForm
              data={bookingData}
              onChange={updateData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3IDUpload
              data={bookingData}
              onChange={updateData}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4Review
              data={bookingData}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <Step5Payment
              data={bookingData}
              onBack={() => setStep(4)}
            />
          )}
        </div>
      </div>
    </main>
  )
}
