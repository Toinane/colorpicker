import { useEffect, useRef, useState } from 'react'
import { Text } from '@components/ui'
import style from './Toggle.module.css'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * The dot's horizontal position is always expressed as a single `left` value
 * in pixels (see Toggle.module.css — the checked state offsets `left`
 * directly rather than using `transform`, so CSS and this component always
 * agree on one coordinate system).
 *
 * PILL_LEFT_OFF/ON are the dot's `left` while the track is actively pressed
 * (`:active`, stretched into a 17px pill — see `.toggleWrapper:active
 * .toggleSlider` / `.toggleWrapper:active .toggleChecked .toggleSlider`).
 * They bound the drag and decide which side the pointer ended up on. They're
 * deliberately *not* used as a final resting position: the real resting spot
 * also depends on `:hover`, which we don't try to predict — see `settle()`.
 */
const PILL_LEFT_OFF = 2
const PILL_LEFT_ON = 19.5
const PILL_MIDPOINT = (PILL_LEFT_OFF + PILL_LEFT_ON) / 2

const DRAG_THRESHOLD_PX = 3 // pointer movement required before a press counts as a drag

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

interface PointerSession {
  startX: number
  startLeft: number
  isDrag: boolean
}

const Toggle = ({ checked, onChange, disabled = false }: ToggleProps) => {
  // The dot's inline `left` override while we're manually driving its
  // position: during an active drag, and while holding it at the release
  // point until `checked` catches up. `null` means "let CSS decide".
  const [pinnedLeft, setPinnedLeft] = useState<number | null>(null)
  // Keeps CSS transitions disabled slightly past `pinnedLeft` becoming null,
  // so handing control back to CSS is an instant, unanimated snap instead of
  // a transition from the last pinned pixel to CSS's real resting position.
  const [instant, setInstant] = useState(false)

  const pointer = useRef<PointerSession | null>(null)
  // A drag release fires a synthetic click right after pointerup — set when
  // a drag actually happened so that click doesn't also toggle the value.
  const suppressNextClick = useRef(false)
  // Set right after a drag commits a change: `checked` only updates once the
  // parent re-renders, so we hold the dot in place until it matches, then hand
  // back to CSS (see effect below).
  const awaitingChecked = useRef<boolean | null>(null)

  const settle = () => {
    setPinnedLeft(null)
    requestAnimationFrame(() => setInstant(false))
  }

  const abortDrag = () => {
    pointer.current = null
    setPinnedLeft(null)
    setInstant(false)
  }

  // Once the parent's `checked` prop catches up to a drag-committed value,
  // release the pinned position back to CSS.
  useEffect(() => {
    if (awaitingChecked.current !== null && checked === awaitingChecked.current) {
      awaitingChecked.current = null
      settle()
    }
  }, [checked])

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (e.type === 'keydown') {
      const key = (e as React.KeyboardEvent).key
      if (key !== 'Enter' && key !== ' ') return
    }

    if (suppressNextClick.current) {
      suppressNextClick.current = false
      return
    }

    if (!disabled) onChange(!checked)
    e.preventDefault()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || e.button !== 0) return

    e.currentTarget.setPointerCapture(e.pointerId)
    pointer.current = {
      startX: e.clientX,
      startLeft: checked ? PILL_LEFT_ON : PILL_LEFT_OFF,
      isDrag: false,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointer.current || disabled) return

    // The primary button is no longer pressed (e.g. pointerup was missed, or
    // capture wasn't released in time) — stop tracking rather than let the
    // dot keep following the pointer indefinitely.
    if ((e.buttons & 1) === 0) {
      abortDrag()
      return
    }

    const delta = e.clientX - pointer.current.startX
    if (!pointer.current.isDrag && Math.abs(delta) < DRAG_THRESHOLD_PX) return

    if (!pointer.current.isDrag) setInstant(true)
    pointer.current.isDrag = true
    setPinnedLeft(clamp(pointer.current.startLeft + delta, PILL_LEFT_OFF, PILL_LEFT_ON))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointer.current) return

    e.currentTarget.releasePointerCapture(e.pointerId)
    suppressNextClick.current = pointer.current.isDrag

    if (pointer.current.isDrag && pinnedLeft !== null) {
      const finalChecked = pinnedLeft > PILL_MIDPOINT
      if (finalChecked !== checked) {
        awaitingChecked.current = finalChecked
        onChange(finalChecked)
      } else {
        settle()
      }
    } else {
      settle()
    }

    pointer.current = null
  }

  const handlePointerCancel = abortDrag

  return (
    <div
      className={`${style.toggleWrapper} ${disabled ? style.toggleDisabled : ''}`}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      <Text className={style.toggleLabel} color="primary">
        {checked ? 'On' : 'Off'}
      </Text>
      <button
        className={`${style.toggle} ${checked ? style.toggleChecked : ''} ${disabled ? style.toggleDisabled : ''}`}
        disabled={disabled}
        role="switch"
        tabIndex={-1}
        aria-checked={checked}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <span
          className={`${style.toggleSlider} ${instant ? style.toggleSliderDragging : ''}`}
          style={pinnedLeft !== null ? { left: `${pinnedLeft}px` } : undefined}
        ></span>
      </button>
    </div>
  )
}

export default Toggle
