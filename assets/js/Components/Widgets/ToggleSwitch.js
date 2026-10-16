import React, { useState, useEffect } from 'react'

import './ToggleSwitch.css'

export default function ToggleSwitch({
    labelId,
    initialValue = false,
    updateToggle,
    disabled = false,
    small = false
}) {

    const [toggleValue, setToggleValue] = useState(initialValue)

    useEffect(() => {
        setToggleValue(initialValue);
    }, [initialValue]);

    const handleClick = () => {
        if (disabled) {
            return;
        }

        let newValue = !toggleValue
        setToggleValue(newValue)
        updateToggle(newValue)
    }

    return (
        <div className={`css-switch${small ? ' small' : ''}`}>
            <input
                tabIndex="-1"
                type="checkbox"
                aria-hidden="true"
                checked={toggleValue}
                onChange={() => {}}
                disabled={disabled}
            />
            <span
                aria-labelledby={labelId}
                className="slider round"
                onClick={() => handleClick()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleClick()
                    }
                }}
                tabIndex="0"
                role="checkbox"
                aria-checked={toggleValue}
                aria-disabled={disabled}
                disabled={disabled}
            />
        </div>
    )
}