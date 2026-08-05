import { useState, useEffect, useCallback } from 'react'

import { Text, KeyCombo } from '@components/ui'
import Icon, { IconEnum } from '@components/icons'
import { isMacosSync } from '@common/platform'

import style from './HotkeyInput.module.css'
import { useTranslation } from 'react-i18next'

export interface HotkeyInputProps {
  value: string
  /** Value restored when the reset button is used; the reset button only shows when set and different from `value` */
  defaultValue?: string
  onChange: (value: string) => void
  /** Called with the candidate accelerator before it's committed; return an error message to reject it */
  onValidate?: (accelerator: string) => string | null
  disabled?: boolean
}

type ModifierName = 'CommandOrControl' | 'Control' | 'Shift' | 'Alt'

// On Mac, Control and Command are distinct physical keys; everywhere else
// there's no separate Command key, so Control is the primary modifier. Read
// via a function (not a frozen constant) so it picks up the accurate
// Rust-derived platform once `isMacosSync` resolves past its initial
// user-agent guess, rather than locking in whatever was true at import time.
const getModifierKeys = (): Record<string, ModifierName> => ({
  Control: isMacosSync() ? 'Control' : 'CommandOrControl',
  Meta: 'CommandOrControl',
  Shift: 'Shift',
  Alt: 'Alt',
})

const MODIFIER_ORDER: ModifierName[] = ['Control', 'CommandOrControl', 'Shift', 'Alt']

// Combos that are either grabbed by the OS before we'd ever see them, or that would
// break expected system/browser behavior if we let a global handler claim them
const RESERVED_ACCELERATORS = new Set([
  'Alt+F4',
  'CommandOrControl+Q',
  'CommandOrControl+W',
  'CommandOrControl+Alt+Delete',
])

const sortModifiers = (parts: string[]): string[] =>
  [...parts].sort((a, b) => {
    const ai = MODIFIER_ORDER.indexOf(a as ModifierName)
    const bi = MODIFIER_ORDER.indexOf(b as ModifierName)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

const HotkeyInput = ({
  value,
  defaultValue,
  onChange,
  onValidate,
  disabled = false,
}: HotkeyInputProps) => {
  const HotkeyT = useTranslation('settings', { keyPrefix: 'hotkey' })

  const [isRecording, setIsRecording] = useState(false)
  const [heldModifiers, setHeldModifiers] = useState<Set<ModifierName>>(new Set())

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    setHeldModifiers(new Set())
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.key === 'Escape') {
        stopRecording()
        return
      }

      const modifier = getModifierKeys()[e.key]
      if (modifier) {
        setHeldModifiers((prev) => new Set(prev).add(modifier))
        return
      }

      if (heldModifiers.size === 0) {
        return
      }

      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
      const accelerator = [...sortModifiers([...heldModifiers]), key].join('+')

      if (RESERVED_ACCELERATORS.has(accelerator)) {
        return
      }

      const conflictError = onValidate?.(accelerator) ?? null
      if (conflictError) {
        return
      }

      onChange(accelerator)
      stopRecording()
    },
    [heldModifiers, onValidate, onChange, stopRecording],
  )

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const modifier = getModifierKeys()[e.key]
    if (!modifier) return
    setHeldModifiers((prev) => {
      const next = new Set(prev)
      next.delete(modifier)
      return next
    })
  }, [])

  useEffect(() => {
    if (!isRecording) return

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [isRecording, handleKeyDown, handleKeyUp])

  const displayParts = isRecording ? sortModifiers([...heldModifiers]) : value.split('+')
  const canReset = !isRecording && !!defaultValue && value !== defaultValue

  return (
    <div className={style.hotkeyInputWrapper}>
      <button
        type="button"
        className={`${style.hotkeyInput} ${isRecording ? style.hotkeyInputRecording : ''}`}
        onClick={() => !disabled && !isRecording && setIsRecording(true)}
        onBlur={stopRecording}
        disabled={disabled}
      >
        <Text className={style.hotkeyKeys}>
          {displayParts.length > 0 && (
            <KeyCombo keys={displayParts} type="separated" variant="filled" />
          )}
          {isRecording && <span className={style.hotkeyCursor} />}
          {displayParts.length === 0 && <Text color="accent">{HotkeyT.t('recording')}</Text>}
        </Text>
      </button>

      {canReset && (
        <div
          role="button"
          tabIndex={0}
          className={style.hotkeyReset}
          onClick={(e) => {
            e.stopPropagation()
            onChange(defaultValue as string)
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onChange(defaultValue as string)
            }
          }}
          title={HotkeyT.t('reset')}
          aria-label={HotkeyT.t('reset')}
        >
          <Icon type={IconEnum.RESET} colors={{ primary: 'var(--hotkey-icon)' }} />
        </div>
      )}
    </div>
  )
}

export default HotkeyInput
