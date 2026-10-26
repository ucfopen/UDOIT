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
                aria-labelledby={labelId}
                type="checkbox"
                checked={toggleValue}
                onChange={() => handleClick()}
                disabled={disabled}
            />
            <div
                className="slider round"
                aria-hidden="true"
                disabled={disabled}
            />
        </div>
    )
}