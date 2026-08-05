import { memo } from 'react'

const PalettePage = () => {
  const variables = [
    '--main-color',
    '--accent-default',
    '--accent-dark',
    '--accent-darker',
    '--accent-darkest',
    '--accent-subtle',
    '--accent-light',
    '--accent-lighter',
    '--accent-lightest',
    '--accent-variant-default',
    '--accent-variant-dark',
    '--accent-variant-darker',
    '--accent-variant-darkest',
    '--accent-variant-subtle',
    '--accent-variant-light',
    '--accent-variant-lighter',
    '--accent-variant-lightest',
    '--window-default',
    '--window-dark',
    '--window-darker',
    '--window-darkest',
    '--window-light',
    '--window-lighter',
    '--window-lightest',
    '--surface-default',
    '--surface-dark',
    '--surface-darker',
    '--surface-darkest',
    '--surface-light',
    '--surface-lighter',
    '--surface-lightest',
    '--overlay-default',
    '--overlay-dark',
    '--overlay-darker',
    '--overlay-darkest',
    '--overlay-light',
    '--overlay-lighter',
    '--overlay-lightest',
  ]

  return (
    <section
      className="palettePage"
      style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}
    >
      {variables.map((variable) => (
        <div
          key={variable}
          style={{
            backgroundColor: `var(${variable})`,
            width: '20%',
            height: '5rem',
            borderRadius: '4px',
          }}
        >
          <p
            style={{
              margin: 0,
              padding: '0.5rem',
              textAlign: 'center',
              color: 'color-mix(in oklch, var(--accent-default) 100%, white)',
              mixBlendMode: 'difference',
              fontSize: '0.75rem',
            }}
          >
            {variable}
          </p>
        </div>
      ))}
    </section>
  )
}

export default memo(PalettePage)
