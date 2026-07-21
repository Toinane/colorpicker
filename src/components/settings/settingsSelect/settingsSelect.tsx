import { useState, useRef, useEffect } from 'react'
import style from './settingsSelect.module.css'

export interface SettingsSelectOption {
  value: string
  label: string
}

export interface SettingsSelectProps {
  value: string
  onChange: (value: string) => void
  options: SettingsSelectOption[]
  disabled?: boolean
}

const SettingsSelect = ({ value, onChange, options, disabled = false }: SettingsSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault()
      const currentIndex = options.findIndex((opt) => opt.value === value)
      const nextIndex = (currentIndex + 1) % options.length
      onChange(options[nextIndex].value)
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault()
      const currentIndex = options.findIndex((opt) => opt.value === value)
      const prevIndex = currentIndex - 1 < 0 ? options.length - 1 : currentIndex - 1
      onChange(options[prevIndex].value)
    }
  }

  const handleOptionKeyDown = (e: React.KeyboardEvent, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleOptionClick(optionValue)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={style.settingsSelectWrapper} ref={selectRef}>
      <div
        className={`${style.settingsSelect} ${disabled ? style.settingsSelectDisabled : ''} ${isOpen ? style.settingsSelectOpen : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={style.settingsSelectValue}>{selectedOption?.label || value}</span>
        <svg
          className={style.settingsSelectArrow}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {isOpen && (
        <div className={style.settingsSelectDropdown} role="listbox">
          {options.map((option) => (
            <div
              key={option.value}
              className={`${style.settingsSelectOption} ${option.value === value ? style.settingsSelectOptionSelected : ''}`}
              onClick={() => handleOptionClick(option.value)}
              onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
              tabIndex={0}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SettingsSelect
