import { Heading, Button } from '@components/ui'

import style from './paletteMenu.module.css'

const PaletteMenu = () => {
  return (
    <section className={style.paletteMenu}>
      <Heading level={3} color="primary" className={style.paletteMenuTitle}>
        Palettes
      </Heading>
      <Button variant="transparent" className={style.paletteMenuButton}>
        +
      </Button>
    </section>
  )
}

export default PaletteMenu
