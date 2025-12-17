"use client"

import { ReactNode } from "react"

interface OnboardingStepProps {
  step: number
  totalSteps: number
  title: string
  description?: string
  children: ReactNode
}

export function OnboardingStep({ step, totalSteps, title, description, children }: OnboardingStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Passo {step} de {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600 mb-6">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}


