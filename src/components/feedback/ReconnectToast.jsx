import { useEffect, useRef } from 'react'
import { useToast } from './ToastProvider.jsx'
import { useOnlineStatus } from './useOnlineStatus.js'

/**
 * 연결이 끊겼다가 돌아오면 Simple 토스트 '다시 연결됐어요' (피그마 OfflineBanner 설명)
 * 화면 없이 앱 전체에 한 번만 둠 (main.jsx)
 */
export default function ReconnectToast() {
  const online = useOnlineStatus()
  const showToast = useToast()
  const wasOffline = useRef(!online)

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
    } else if (wasOffline.current) {
      wasOffline.current = false
      showToast({ type: 'simple', title: '다시 연결됐어요' })
    }
  }, [online, showToast])

  return null
}
