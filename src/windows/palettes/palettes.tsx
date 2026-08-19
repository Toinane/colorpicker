import { useState, useEffect, useRef /*, type MouseEvent*/ } from 'react'
// import classNames from 'clsx'
import { useTranslation } from 'react-i18next'
// import Color from 'colorjs.io'

import WindowControls from '@components/windowBar/windowControls'
import Navigation from '@components/palettes/navigation/Navigation'
import NavigationItem from '@components/palettes/navigationItem/NavigationItem'
import { Heading, Button } from '@components/ui'
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
          <Heading level={1} color="primary" weight="bold" size="small">
            {t('title')}
          </Heading>
          <div className={style.iconGradient}></div>
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
            <ColorSection label="Programmed Colors">
              {[
                ['#60A7C5', 'main-color'],
                ['#D3415A', 'accent-default'],
              ].map(([color, name]) => (
                <ColorItem key={color} color={color} name={name} />
              ))}
            </ColorSection>
            <ColorSection
              size="sm"
              variant="swatch"
              showNames={false}
              fullNames={false}
              label="Accent Colors"
            >
              {[
                ['#C53C54', 'accent-dark'],
                ['#B7374D', 'accent-darker'],
                ['#9C2E41', 'accent-darkest'],
                ['#EEDFE6', 'accent-subtle'],
                ['#D95366', 'accent-light'],
                ['#DB5C6D', 'accent-lighter'],
                ['#E16C79', 'accent-lightest'],
                ['#BE3D52', 'accent-variant-default'],
                ['#B1394C', 'accent-variant-dark'],
                ['#A43446', 'accent-variant-darker'],
                ['#8C2B3B', 'accent-variant-darkest'],
                ['#ECDEE5', 'accent-variant-subtle'],
                ['#C54F5F', 'accent-variant-light'],
                ['#C85865', 'accent-variant-lighter'],
                ['#CF6873', 'accent-variant-lightest'],
              ].map(([color, name]) => (
                <ColorItem key={color} color={color} name={name} />
              ))}
            </ColorSection>
            <ColorSection label="Neutral Colors">
              {[
                ['#F3F5F9', 'window-default'],
                ['#E9ECEF', 'window-dark'],
                ['#E0E2E6', 'window-darker'],
                ['#D6D8DC', 'window-darkest'],
                ['#F6F8FB', 'window-light'],
                ['#F9FAFC', 'window-lighter'],
                ['#FBFCFD', 'window-lightest'],
                ['#D6D8DC', 'surface-default'],
                ['#BABCBF', 'surface-dark'],
                ['#9FA0A3', 'surface-darker'],
                ['#848688', 'surface-darkest'],
                ['#E2E4E6', 'surface-light'],
                ['#EAECED', 'surface-lighter'],
                ['#EFF0F2', 'surface-lightest'],
                ['#141515', 'overlay-default'],
                ['#121213', 'overlay-dark'],
                ['#0C0C0D', 'overlay-darker'],
                ['#080809', 'overlay-darkest'],
                ['#272728', 'overlay-light'],
                ['#3B3C3C', 'overlay-lighter'],
                ['#515152', 'overlay-lightest'],
              ].map(([color, name]) => (
                <ColorItem key={color} color={color} name={name} />
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
          <Button
            variant="transparent"
            className={style.contextMenuItem}
            onClick={contextMenu.onDelete}
          >
            {t('action.delete')}
          </Button>
        </div>
      )}
    </section>
  )
}

export default Palettes
