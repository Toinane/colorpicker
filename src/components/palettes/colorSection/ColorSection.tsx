import style from './colorSection.module.css'

const ColorSection = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  return (
    <section className={style.colorSection}>
      {label && <h2 className={style.label}>{label}</h2>}
      <section className={style.colors}>{children}</section>
    </section>
  )
}

export default ColorSection
