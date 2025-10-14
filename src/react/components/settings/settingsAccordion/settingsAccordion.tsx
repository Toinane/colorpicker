import React, { useState } from 'react'
import classNames from 'classnames'

import style from './settingsAccordion.module.css'
import Icons from '@react/components/icons'
import { useTheme } from '@react/hooks'

export interface SettingsAccordionProps {
  label: string
  opened?: boolean
  description?: string
  accordionContent?: React.ReactNode
  children?: React.ReactNode
}

const SettingsAccordion = ({
  opened = false,
  label,
  description,
  children,
  accordionContent,
}: SettingsAccordionProps) => {
  const [isOpen, setIsOpen] = useState(opened)
  const theme = useTheme()

  const iconColors = {
    main: theme === 'dark' ? '#ffffff' : '#555',
  }

  const toggleAccordion = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (
      e.type === 'keydown' &&
      (e as React.KeyboardEvent).key !== 'Enter' &&
      (e as React.KeyboardEvent).key !== ' '
    ) {
      return
    }

    setIsOpen(!isOpen)
  }

  return (
    <>
      <section
        className={classNames([style.settingsAccordion, !isOpen && style.settingsAccordionClosed])}
        onClick={toggleAccordion}
        onKeyDown={toggleAccordion}
      >
        <div className={style.settingsAccordionInfo}>
          <h3 className={style.settingsAccordionLabel}>{label}</h3>
          {description && <div className={style.settingsAccordionDescription}>{description}</div>}
        </div>
        <div className={style.settingsAccordionActions}>
          <div onClick={(e) => e.stopPropagation()}>{accordionContent}</div>
          <div
            className={classNames([
              style.settingsAccordionIcon,
              isOpen && style.settingsAccordionIconOpened,
            ])}
            tabIndex={0}
          >
            <Icons type="EXPAND" colors={iconColors} />
          </div>
        </div>
      </section>
      <div
        className={classNames([
          style.settingsAccordionContent,
          isOpen && style.settingsAccordionContentOpen,
        ])}
        {...(!isOpen && { inert: true })}
      >
        <div className={style.settingsAccordionInner}>{children}</div>
      </div>
    </>
  )
}

export default SettingsAccordion
