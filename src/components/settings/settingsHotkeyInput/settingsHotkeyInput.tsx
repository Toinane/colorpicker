import { useState, useEffect, useCallback, useRef } from 'react'
import style from './settingsHotkeyInput.module.css'

export interface SettingsHotkeyInputProps {
  value: string
  /** Value restored when the reset button is used; the reset button only shows when set and different from `value` */
  defaultValue?: string
  onChange: (value: string) => void
  /** Called with the candidate accelerator before it's committed; return an error message to reject it */
  onValidate?: (accelerator: string) => string | null
  recordingLabel?: string
  noModifierErrorLabel?: string
  reservedErrorLabel?: string
  resetLabel?: string
  disabled?: boolean
}

type ModifierName = 'CommandOrControl' | 'Shift' | 'Alt'

const MODIFIER_KEYS: Record<string, ModifierName> = {
  Control: 'CommandOrControl',
  Meta: 'CommandOrControl',
  Shift: 'Shift',
  Alt: 'Alt',
}

const MODIFIER_ORDER: ModifierName[] = ['CommandOrControl', 'Shift', 'Alt']

// Combos that are either grabbed by the OS before we'd ever see them, or that would
// break expected system/browser behavior if we let a global handler claim them
const RESERVED_ACCELERATORS = new Set([
  'Alt+F4',
  'CommandOrControl+Q',
  'CommandOrControl+W',
  'CommandOrControl+Alt+Delete',
])

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

const KEY_SYMBOLS: Record<string, { mac: string; other: string }> = {
  CommandOrControl: { mac: '⌘', other: 'Ctrl' },
  Shift: { mac: '⇧', other: 'Shift' },
  Alt: { mac: '⌥', other: 'Alt' },
  ArrowUp: { mac: '↑', other: '↑' },
  ArrowDown: { mac: '↓', other: '↓' },
  ArrowLeft: { mac: '←', other: '←' },
  ArrowRight: { mac: '→', other: '→' },
  ' ': { mac: 'Space', other: 'Space' },
}

const formatKeyPart = (part: string): string => KEY_SYMBOLS[part]?.[isMac ? 'mac' : 'other'] ?? part

const sortModifiers = (parts: string[]): string[] =>
  [...parts].sort((a, b) => {
    const ai = MODIFIER_ORDER.indexOf(a as ModifierName)
    const bi = MODIFIER_ORDER.indexOf(b as ModifierName)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

const ERROR_DISPLAY_MS = 2500

const SettingsHotkeyInput = ({
  value,
  defaultValue,
  onChange,
  onValidate,
  recordingLabel = 'Press a key combination…',
  noModifierErrorLabel = 'Include at least one modifier key',
  reservedErrorLabel = 'This shortcut is reserved by the system',
  resetLabel = 'Reset to default',
  disabled = false,
}: SettingsHotkeyInputProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [heldModifiers, setHeldModifiers] = useState<Set<ModifierName>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    setHeldModifiers(new Set())
  }, [])

  const showError = useCallback((message: string) => {
    setError(message)
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    errorTimeoutRef.current = setTimeout(() => setError(null), ERROR_DISPLAY_MS)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.key === 'Escape') {
        stopRecording()
        return
      }

      const modifier = MODIFIER_KEYS[e.key]
      if (modifier) {
        setHeldModifiers((prev) => new Set(prev).add(modifier))
        return
      }

      if (heldModifiers.size === 0) {
        showError(noModifierErrorLabel)
        return
      }

      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
      const accelerator = [...sortModifiers([...heldModifiers]), key].join('+')

      if (RESERVED_ACCELERATORS.has(accelerator)) {
        showError(reservedErrorLabel)
        return
      }

      const conflictError = onValidate?.(accelerator) ?? null
      if (conflictError) {
        showError(conflictError)
        return
      }

      setError(null)
      onChange(accelerator)
      stopRecording()
    },
    [
      heldModifiers,
      noModifierErrorLabel,
      reservedErrorLabel,
      onValidate,
      onChange,
      stopRecording,
      showError,
    ],
  )

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const modifier = MODIFIER_KEYS[e.key]
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

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    }
  }, [])

  const displayParts = isRecording ? sortModifiers([...heldModifiers]) : value.split('+')
  const canReset = !isRecording && !!defaultValue && value !== defaultValue

  return (
    <div className={style.hotkeyInputWrapper}>
      <button
        type="button"
        className={`${style.hotkeyInput} ${isRecording ? style.hotkeyInputRecording : ''} ${error ? style.hotkeyInputError : ''}`}
        onClick={() => !disabled && !isRecording && setIsRecording(true)}
        disabled={disabled}
      >
        {error ? (
          <span className={style.hotkeyError}>{error}</span>
        ) : (
          <span className={style.hotkeyKeys}>
            {displayParts.map((part, i) => (
              <kbd key={`${part}-${i}`} className={style.hotkeyKey}>
                {formatKeyPart(part)}
              </kbd>
            ))}
            {isRecording && displayParts.length === 0 && (
              <span className={style.hotkeyPlaceholder}>{recordingLabel}</span>
            )}
            {isRecording && <span className={style.hotkeyCursor} />}
          </span>
        )}
      </button>
      {canReset && (
        <button
          type="button"
          className={style.hotkeyReset}
          onClick={() => onChange(defaultValue as string)}
          title={resetLabel}
          aria-label={resetLabel}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SettingsHotkeyInput
