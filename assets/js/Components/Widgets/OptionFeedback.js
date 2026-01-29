import React from 'react'

export default function OptionFeedback ({
    feedbackArray
}) {

  return (
    <>
      { feedbackArray && feedbackArray.length > 0 && (
        <div className="pt-2">
            { feedbackArray.map((feedback, index) => 
                <div key={index} className="option-feedback">
                    {feedback.text}
                </div>
            )}
        </div>
      )}    
    </>
  )
}