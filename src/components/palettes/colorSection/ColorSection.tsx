import { Heading } from '@components/ui'

import style from './colorSection.module.css'

const ColorSection = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  return (
    <section className={style.colorSection}>
      {label && (
        <Heading level={2} color="primary" weight="semibold" className={style.label}>
          {label}
        </Heading>
      )}
      <section className={style.colors}>{children}</section>
    </section>
  )
}

export default ColorSection
