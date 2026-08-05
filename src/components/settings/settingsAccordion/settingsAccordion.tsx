import React, { useState } from 'react'
import classNames from 'clsx'

import style from './settingsAccordion.module.css'
import Icons from '@components/icons'
import { Heading, Text } from '@components/ui'

export interface SettingsAccordionProps {
  label: string
  opened?: boolean
  description?: string
  accordionActions?: React.ReactNode
  children?: React.ReactNode
}

const SettingsAccordion = ({
  opened = false,
  label,
  description,
  children,
  accordionActions,
}: SettingsAccordionProps) => {
  const [isOpen, setIsOpen] = useState(opened)

  const toggleAccordion = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (
      e.type === 'keydown' &&
      (e as React.KeyboardEvent).key !== 'Enter' &&
      (e as React.KeyboardEvent).key !== ' '
    ) {
      return
    }

    setIsOpen(!isOpen)
    e.preventDefault()
  }

  const stopActionsPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      <section
        className={classNames([style.settingsAccordion, !isOpen && style.settingsAccordionClosed])}
        onClick={toggleAccordion}
        onKeyDown={toggleAccordion}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
      >
        <div className={style.settingsAccordionInfo}>
          <Heading level={3}>{label}</Heading>
          {description && <Text size="small">{description}</Text>}
        </div>
        <div className={style.settingsAccordionActions}>
          <div onClick={stopActionsPropagation} onKeyDown={stopActionsPropagation}>
            {accordionActions}
          </div>
          <div
            className={classNames([
              style.settingsAccordionIcon,
              isOpen && style.settingsAccordionIconOpened,
            ])}
          >
            <Icons type="EXPAND" colors={{ primary: 'var(--s-acc-icon-color)' }} />
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
