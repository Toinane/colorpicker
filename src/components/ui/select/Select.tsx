import { useState, useRef, useEffect } from 'react'
import classNames from 'clsx'
import style from './Select.module.css'
import Icon, { IconEnum } from '@components/icons'
import { Text } from '@components/ui'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
}

const Select = ({ value, onChange, options, disabled = false }: SelectProps) => {
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
    <div className={style.selectWrapper} ref={selectRef}>
      <div
        className={classNames(style.select, disabled && style.selectDisabled, isOpen && style.selectOpen)}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Text className={style.selectValue}>{selectedOption?.label || value}</Text>
        <div className={style.selectArrowWrapper}>
          <Icon type={IconEnum.EXPAND} />
        </div>
      </div>
      {isOpen && (
        <div className={style.selectDropdown} role="listbox">
          {options.map((option) => (
            <div
              key={option.value}
              className={classNames(style.selectOption, option.value === value && style.selectOptionSelected)}
              onClick={() => handleOptionClick(option.value)}
              onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
              tabIndex={0}
              role="option"
              aria-selected={option.value === value}
            >
              <Text>{option.label}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Select
