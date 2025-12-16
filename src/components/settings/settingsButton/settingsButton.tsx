import { useState, useEffect } from 'react'
import type from './settingsButton.module.css'

export interface SettingsButtonProps {
  label: string
  clickedLabel?: string
  onClick: () => void
}

const SettingsButton = ({ label, clickedLabel, onClick }: SettingsButtonProps) => {
  const [isClicked, setIsClicked] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsReturning(true)
        setTimeout(() => {
          setIsClicked(false)
          setIsReturning(false)
        }, 300) // Wait for fade animation to complete
      }, 1700)

      return () => clearTimeout(timer)
    }
  }, [isClicked])

  const handleClick = () => {
    onClick()
    if (clickedLabel) {
      setIsClicked(true)
    }
  }

  return (
    <button className={type.settingsButton} onClick={handleClick}>
      <span
        className={`${type.settingsButtonText} ${isClicked && !isReturning ? type.settingsButtonTextHidden : ''} ${isReturning ? type.settingsButtonTextFadeIn : ''}`}
      >
        {label}
      </span>
      {clickedLabel && (
        <span
          className={`${type.settingsButtonText} ${type.settingsButtonTextClicked} ${isClicked && !isReturning ? type.settingsButtonTextVisible : ''} ${isReturning ? type.settingsButtonTextFadeOut : ''}`}
        >
          {clickedLabel}
        </span>
      )}
    </button>
  )
}

export default SettingsButton
