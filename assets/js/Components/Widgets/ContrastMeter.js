import React from 'react'

export default function ContrastMeter({
  t,
  minAARatio,
  minAAARatio,
  contrastRatio,
}) {

  // Assumes valid numeric inputs: 1 <= AA < AAA <= 21.
  const position = (ratio) => (((ratio - 1) / 20) * 100)

  const failWidth = position(minAARatio)
  const aaWidth = (((minAAARatio - minAARatio) / 20) * 100)
  const aaaWidth = (((21 - minAAARatio) / 20) * 100)

  return (
    <div className="contrast-meter">

      <div
        role="meter"
        aria-hidden="true"
      >
        <div
          className="contrast-meter-graphic"
          style={{ '--contrast-position': `${position(contrastRatio)}%` }}
          aria-hidden="true" >
          <span
            className="contrast-meter-fail"
            style={{ left: `${failWidth * .5}%` }}
            aria-hidden="true" >
            {t('form.contrast.label.target_fail')}
          </span>
          <span
            className="contrast-meter-aa"
            style={{ left: `${(failWidth + (aaWidth * .5))}%` }}
            aria-hidden="true" >
            {t('form.contrast.label.target_aa')}
          </span>
          <span
            className="contrast-meter-aaa"
            style={{ left: `${100 - (aaaWidth * .5)}%` }}
            aria-hidden="true" >
            {t('form.contrast.label.target_aaa')}
          </span>

          <div className="contrast-meter-track">
            <span
              className="contrast-meter-section contrast-meter-insufficient"
              style={{ width: `${failWidth}%` }}
            />
            <span
              className="contrast-meter-section contrast-meter-acceptable"
              style={{ width: `${aaWidth}%` }}
            />
            <span
              className="contrast-meter-section contrast-meter-excellent"
              style={{ width: `${aaaWidth}%` }}
            />
          </div>

          <span className="contrast-meter-marker" />
        </div>
      </div>
    </div>
  )
}