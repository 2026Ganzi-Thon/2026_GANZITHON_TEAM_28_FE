import { useCallback, useEffect, useRef, useState } from 'react'
import { APP_CONFIG } from '../../api/config.js'

/**
 * AI 요청 상태 관리 (E-03 로딩 → 8초 E-03a → 15초·실패 시 E-04)
 * - run(request, onSuccess): request(signal)는 Promise를 돌려주는 함수
 * - retry(): 마지막 요청 다시 (E-04 '다시 시도')
 * - cancel(): 요청 취소하고 원래 화면으로 (입력 유지)
 * - state: 'idle' | 'loading' | 'error', slow: 8초 경과 여부
 * AiLoading 컴포넌트와 함께 씀
 */
export function useAiRequest() {
  const [state, setState] = useState('idle')
  const [slow, setSlow] = useState(false)
  const activeRef = useRef(null) // { controller, timers }
  const lastRef = useRef(null) // { request, onSuccess }

  const stop = useCallback(() => {
    const active = activeRef.current
    if (!active) return
    active.timers.forEach(clearTimeout)
    active.controller.abort()
    activeRef.current = null
  }, [])

  useEffect(() => stop, [stop])

  const run = useCallback(
    (request, onSuccess) => {
      stop()
      lastRef.current = { request, onSuccess }
      setSlow(false)
      setState('loading')

      const controller = new AbortController()
      const timers = [
        setTimeout(() => setSlow(true), APP_CONFIG.aiLoadingSlowMs),
        setTimeout(() => {
          stop()
          setState('error')
        }, APP_CONFIG.aiLoadingTimeoutMs),
      ]
      activeRef.current = { controller, timers }

      request(controller.signal)
        .then((result) => {
          if (activeRef.current?.controller !== controller) return
          timers.forEach(clearTimeout)
          activeRef.current = null
          setState('idle')
          onSuccess?.(result)
        })
        .catch(() => {
          if (controller.signal.aborted) return
          stop()
          setState('error')
        })
    },
    [stop],
  )

  const retry = useCallback(() => {
    if (lastRef.current) run(lastRef.current.request, lastRef.current.onSuccess)
  }, [run])

  const cancel = useCallback(() => {
    stop()
    setState('idle')
  }, [stop])

  return { state, slow, run, retry, cancel }
}
