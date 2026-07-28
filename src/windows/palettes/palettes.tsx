import { useState, useEffect, useRef /*, type MouseEvent*/ } from 'react'
// import classNames from 'clsx'
import { useTranslation } from 'react-i18next'
// import Color from 'colorjs.io'

import WindowControls from '@components/windowBar/windowControls'
import Navigation from '@components/palettes/navigation/Navigation'
import NavigationItem from '@components/palettes/navigationItem/NavigationItem'
// import { usePalettesStore } from '@stores/palettesStore'
// import { useColorStore } from '@stores/colorStore'
// import { isValidHex, toHex } from '@common/color'
// import { emitPaletteColorApplied } from '@common/ipc'

import style from './palettes.module.css'
import NavigationSection from '@components/palettes/navigationSection/NavigationSection'
import ColorItem from '@components/palettes/colorItem/ColorItem'
import ColorSection from '@components/palettes/colorSection/ColorSection'
import PaletteMenu from '@components/palettes/paletteMenu/PaletteMenu'

interface ContextMenuState {
  x: number
  y: number
  onDelete: () => void
}

const Palettes = () => {
  const { t } = useTranslation('palettes')
  // const {
  //   categories,
  //   activeCategoryId,
  //   setActiveCategory,
  //   addCategory,
  //   deleteCategory,
  //   addColor,
  //   deleteColor,
  // } = usePalettesStore((state) => state)
  // const currentColor = useColorStore((state) => state.color)

  // const [newCategoryName, setNewCategoryName] = useState('')
  // const [newColorHex, setNewColorHex] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextMenu) return
    const closeMenu = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null)
      }
    }
    window.addEventListener('mousedown', closeMenu)
    return () => window.removeEventListener('mousedown', closeMenu)
  }, [contextMenu])

  // const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? null

  // const handleAddCategory = () => {
  //   const name = newCategoryName.trim()
  //   if (!name) return
  //   addCategory(name)
  //   setNewCategoryName('')
  // }

  // const handleAddCurrentColor = () => {
  //   if (!activeCategory) return
  //   addColor(activeCategory.id, toHex(currentColor))
  // }

  // const handleAddHexColor = () => {
  //   if (!activeCategory || !isValidHex(newColorHex)) return
  //   addColor(activeCategory.id, toHex(new Color(newColorHex)))
  //   setNewColorHex('')
  // }

  // const handleCategoryContextMenu = (event: MouseEvent, categoryId: string) => {
  //   event.preventDefault()
  //   setContextMenu({
  //     x: event.clientX,
  //     y: event.clientY,
  //     onDelete: () => {
  //       deleteCategory(categoryId)
  //       setContextMenu(null)
  //     },
  //   })
  // }

  // const handleColorContextMenu = (event: MouseEvent, categoryId: string, colorId: string) => {
  //   event.preventDefault()
  //   setContextMenu({
  //     x: event.clientX,
  //     y: event.clientY,
  //     onDelete: () => {
  //       deleteColor(categoryId, colorId)
  //       setContextMenu(null)
  //     },
  //   })
  // }

  // const handleSwatchClick = (hex: string) => {
  //   emitPaletteColorApplied(hex).catch((err) => console.error('Failed to apply color:', err))
  // }

  return (
    <section className={style.palettesWindow}>
      <header className={style.topBar} data-tauri-drag-region>
        <div className={style.title}>
          <h1>{t('title')}</h1>
          <div className={style.warmGradient}></div>
        </div>
        <WindowControls />
      </header>
      <section className={style.content}>
        <Navigation>
          <NavigationItem label="Material Design" isActive color="#F44336" />
          <NavigationItem label="Colorpicker System Design" color="#4d7bca" />
          <NavigationSection label="Personal Palettes" defaultOpen={true}>
            <NavigationItem label="Creative Documents" color="#ca984d" />
            <NavigationItem label="Flashy Colors" color="#2ecf46" />
          </NavigationSection>
          <NavigationSection label="Festival 2026" defaultOpen={true}>
            <NavigationItem label="Raider Splatfest" color="#412ecf" />
          </NavigationSection>
        </Navigation>
        <section className={style.paletteContent}>
          <PaletteMenu />
          <section className={style.paletteColors}>
            <ColorSection label="Reds">
              <ColorItem color="#F44336" name="Red 500" />
              {[
                ['#FFEBEE', 'Red 50'],
                ['#FFCDD2', 'Red 100'],
                ['#EF9A9A', 'Red 200'],
                ['#E57373', 'Red 300'],
                ['#EF5350', 'Red 400'],
                ['#F44336', 'Red 500'],
                ['#E53935', 'Red 600'],
                ['#D32F2F', 'Cornell Red'],
                ['#C62828', 'Copper Red'],
                ['#B71C1C', 'Red 900'],
                ['#FF8A80', 'Red A100'],
                ['#FF5252', 'Red A200'],
                ['#FF1744', 'Coquelicot'],
                ['#D50000', 'Red A700'],
                ['#E91E63', 'Pink 500'],
                ['#FCE4EC', 'Pink 50'],
                ['#F8BBD0', 'Pink 100'],
                ['#F48FB1', 'Pink 200'],
                ['#F06292', 'Pink 300'],
                ['#EC407A', 'Pink 400'],
                ['#E91E63', 'Pink 500'],
                ['#D81B60', 'Pink 600'],
                ['#C2185B', 'Pink 700'],
                ['#AD1457', 'Pink 800'],
                ['#880E4F', 'Dark Copper Red'],
                ['#FF80AB', 'Pink A100'],
                ['#FF4081', 'Pink A200'],
                ['#F50057', 'Pink A400'],
                ['#C51162', 'Pink A700'],
              ].map(([color, name]) => (
                <ColorItem key={color} color={color} name={name} />
              ))}
            </ColorSection>
            <ColorSection label="Purples">
              {[
                '#9C27B0',
                '#F3E5F5',
                '#E1BEE7',
                '#CE93D8',
                '#BA68C8',
                '#AB47BC',
                '#9C27B0',
                '#8E24AA',
                '#7B1FA2',
                '#6A1B9A',
                '#4A148C',
                '#EA80FC',
                '#E040FB',
                '#D500F9',
                '#AA00FF',
                '#673AB7',
                '#EDE7F6',
                '#D1C4E9',
                '#B39DDB',
                '#9575CD',
                '#7E57C2',
                '#673AB7',
                '#5E35B1',
                '#512DA8',
                '#4527A0',
                '#311B92',
                '#B388FF',
                '#7C4DFF',
                '#651FFF',
                '#6200EA',
                '#3F51B5',
              ].map((color) => (
                <ColorItem key={color} color={color} />
              ))}
            </ColorSection>
          </section>
        </section>
      </section>

      {contextMenu && (
        <div
          ref={menuRef}
          className={style.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button className={style.contextMenuItem} onClick={contextMenu.onDelete}>
            {t('action.delete')}
          </button>
        </div>
      )}
    </section>
  )
}

export default Palettes
