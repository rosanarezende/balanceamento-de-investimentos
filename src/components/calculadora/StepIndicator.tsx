"use client"

import React from 'react'

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="flex items-center justify-center w-full my-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <div 
            className={`flex items-center justify-center rounded-full h-12 w-12 
              ${index + 1 === currentStep 
                ? "bg-primary" 
                : "bg-primary/10"
              }`}
          >
            <span 
              className={`font-bold text-lg
                ${index + 1 === currentStep 
                  ? "text-primary-foreground" 
                  : "text-primary"
                }`}
            >
              {index + 1}
            </span>
          </div>
          
          {index < totalSteps - 1 && (
            <div className="h-0.5 w-8 bg-muted-foreground/30"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default StepIndicator
