import { FiCheck } from 'react-icons/fi'

const STEPS = [
  { num: 1, label: 'Room' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'ID Proof' },
  { num: 4, label: 'Review' },
  { num: 5, label: 'Payment' },
]

export default function BookingStepper({ currentStep }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step.num < currentStep
                    ? 'bg-green-500 text-white'
                    : step.num === currentStep
                    ? 'bg-primary text-white shadow-river ring-4 ring-river/20'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.num < currentStep ? <FiCheck className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-xs font-body mt-1.5 hidden sm:block ${
                step.num <= currentStep ? 'text-primary font-medium' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-1 transition-all duration-300 ${
                step.num < currentStep ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
