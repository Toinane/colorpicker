import style from './navigationItem.module.css'

const NavigationItem = ({
  label,
  color,
  isActive,
}: {
  label: string
  color: string
  isActive?: boolean
}) => {
  return (
    <button className={`${style.navigationItem} ${isActive ? style.active : ''}`}>
      <div className={style.colorSwatch} style={{ backgroundColor: color }}></div>
      <p className={style.label}>{label}</p>
    </button>
  )
}

export default NavigationItem
