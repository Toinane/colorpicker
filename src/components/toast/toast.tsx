import { memo } from 'react'
import { useToastStore } from '@stores/toastStore'

import style from './toast.module.css'

/** Renders active toasts (see `showToast` in `@stores/toastStore`). Mount once at the app root. */
const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts)

  if (toasts.length === 0) return null

  return (
    <div className={style.toastContainer}>
      {toasts.map((toast) => (
        <div key={toast.id} className={style.toast}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default memo(ToastContainer)
