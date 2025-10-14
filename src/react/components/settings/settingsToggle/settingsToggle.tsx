import style from './settingsToggle.module.css'

export interface SettingsToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

const SettingsToggle = ({ checked, onChange, disabled = false }: SettingsToggleProps) => {
  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (
      e.type === 'keydown' &&
      (e as React.KeyboardEvent).key !== 'Enter' &&
      (e as React.KeyboardEvent).key !== ' '
    ) {
      return
    }

    if (!disabled) {
      onChange(!checked)
    }
  }

  return (
    <div
      className={style.settingsToggleWrapper}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleToggle}
    >
      <span className={style.settingsToggleLabel}>{checked ? 'On' : 'Off'}</span>
      <button
        className={`${style.settingsToggle} ${checked ? style.settingsToggleChecked : ''} ${disabled ? style.settingsToggleDisabled : ''}`}
        disabled={disabled}
        role="switch"
        tabIndex={-1}
        aria-checked={checked}
      >
        <span className={style.settingsToggleSlider}></span>
      </button>
    </div>
  )
}

export default SettingsToggle
