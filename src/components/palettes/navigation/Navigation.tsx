import style from './navigation.module.css'

const Navigation = ({ children }: { children: React.ReactNode }) => {
  return <section className={style.navigation}>{children}</section>
}

export default Navigation
