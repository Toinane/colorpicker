import classNames from 'clsx'

import style from './Button.module.css'

export type ButtonVariant = 'transparent' | 'outlined' | 'solid'

export interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  disabled?: boolean
  className?: string
  title?: string
  'aria-label'?: string
  children: React.ReactNode
}

const variantClassName: Record<ButtonVariant, string | undefined> = {
  transparent: undefined,
  outlined: style.buttonOutlined,
  solid: style.buttonSolid,
}

/** Generic clickable button. Default `variant="outlined"` applies the
 * standard pill look used across settings. `variant="solid"` uses the accent
 * color for background. `variant="transparent"` imposes no look — pass
 * `className` for the specific appearance (menu item, context-menu action,
 * etc.), same as every existing bare `<button>` this replaces already did. */
const Button = ({
  onClick,
  type = 'button',
  variant = 'outlined',
  disabled = false,
  className,
  title,
  'aria-label': ariaLabel,
  children,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={classNames(style.button, variantClassName[variant], className)}
    >
      {children}
    </button>
  )
}

export default Button
