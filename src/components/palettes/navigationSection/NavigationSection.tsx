import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text, Button } from '@components/ui'
import Icon, { IconEnum } from '@components/icons'

import style from './navigationSection.module.css'

const NavigationSection = ({
  label,
  defaultOpen = true,
  children,
}: {
  label: string
  defaultOpen?: boolean
  children: React.ReactNode
}) => {
  const { t } = useTranslation('palettes')
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', closeMenu)
    return () => window.removeEventListener('mousedown', closeMenu)
  }, [isMenuOpen])

  return (
    <>
      <div
        className={style.navigationSection}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsOpen((open) => !open)
          }
        }}
      >
        <div className={style.navigationSectionToggle}>
          <span className={`${style.chevron} ${isOpen ? style.chevronOpen : ''}`}>
            <Icon type={IconEnum.ARROW} colors={{ primary: 'var(--n-section-icon)' }} />
          </span>
          <Text
            color="primary"
            size="small"
            weight="semibold"
            className={style.navigationSectionLabel}
          >
            {label}
          </Text>
        </div>

        <div
          className={style.navigationSectionMenu}
          ref={menuRef}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Button
            variant="transparent"
            className={`${style.navigationSectionMenuButton} ${isMenuOpen ? style.navigationSectionMenuButtonActive : ''}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Section options"
          >
            &#8942;
          </Button>

          {isMenuOpen && (
            <div className={style.navigationSectionDropdown}>
              <Button
                variant="transparent"
                className={style.navigationSectionDropdownItem}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('action.rename')}
              </Button>
              <Button
                variant="transparent"
                className={style.navigationSectionDropdownItem}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('action.delete')}
              </Button>
            </div>
          )}
        </div>
      </div>
      {isOpen && <section className={style.navigationSectionItems}>{children}</section>}
    </>
  )
}

export default NavigationSection
