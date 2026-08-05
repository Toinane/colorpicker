import { useState, useEffect } from 'react'
import classNames from 'clsx'

import Button, { ButtonVariant } from './Button'
import style from './FeedbackButton.module.css'
import { Text } from '@components/ui'

export interface FeedbackButtonProps {
  label: string
  variant?: ButtonVariant
  clickedLabel?: string
  onClick: () => void
}

/** Filled Button that swaps its label for `clickedLabel` briefly after being
 * clicked (e.g. "Copy" → "Copied"), then fades back. */
const FeedbackButton = ({
  label,
  clickedLabel,
  onClick,
  variant = 'outlined',
}: FeedbackButtonProps) => {
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
    <Button variant={variant} onClick={handleClick}>
      <Text
        className={classNames(
          style.feedbackButtonText,
          isClicked && !isReturning && style.feedbackButtonTextHidden,
          isReturning && style.feedbackButtonTextFadeIn,
        )}
      >
        {label}
      </Text>
      {clickedLabel && (
        <Text
          className={classNames(
            style.feedbackButtonText,
            style.feedbackButtonTextClicked,
            isClicked && !isReturning && style.feedbackButtonTextVisible,
            isReturning && style.feedbackButtonTextFadeOut,
          )}
        >
          {clickedLabel}
        </Text>
      )}
    </Button>
  )
}

export default FeedbackButton
