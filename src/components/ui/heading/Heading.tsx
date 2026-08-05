import style from './Heading.module.css'

export type HeadingLevel = 1 | 2 | 3
export type HeadingSize = 'small' | 'medium' | 'large'
export type HeadingWeight = 'normal' | 'light' | 'semibold' | 'bold'
export type HeadingColor = 'primary' | 'secondary' | 'accent'

export interface HeadingProps {
  level?: HeadingLevel
  size?: HeadingSize
  weight?: HeadingWeight
  children: React.ReactNode
  className?: string
  color?: HeadingColor
  id?: string
}

/** Generic section/item heading. Carries no default size/weight of its own —
 * pass `className` for the look, same as before this existed. */
const Heading = ({
  level = 2,
  size = 'medium',
  weight = 'normal',
  children,
  className,
  color,
  id,
}: HeadingProps) => {
  const Tag = `h${level}` as const

  return (
    <Tag
      id={id}
      className={`${style.heading} ${color && style[color]} ${style[size]} ${style[weight]} ${className ?? ''}`}
    >
      {children}
    </Tag>
  )
}

export default Heading
