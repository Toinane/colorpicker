import style from './paletteMenu.module.css'

const PaletteMenu = () => {
  return (
    <section className={style.paletteMenu}>
      <h2 className={style.paletteMenuTitle}>Palettes</h2>
      <button className={style.paletteMenuButton}>+</button>
    </section>
  )
}

export default PaletteMenu
