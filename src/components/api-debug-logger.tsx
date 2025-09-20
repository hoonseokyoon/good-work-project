'use client'

import { useEffect } from 'react'

// API 호출을 가로채서 로깅하는 컴포넌트
export default function ApiDebugLogger() {
  useEffect(() => {
    // 개발 환경에서만 실행
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    // 원본 fetch 함수 백업
    const originalFetch = window.fetch

    // fetch 함수를 가로채기
    window.fetch = async (...args) => {
      const [resource, config] = args
      const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : resource.toString())

      // API 호출 시작 로그
      if (url.includes('/api/')) {
        console.log('🌐 클라이언트 API 호출:', url)
        console.time(`API: ${url}`)
      }

      try {
        const response = await originalFetch(...args)
        
        // API 응답 로그
        if (url.includes('/api/')) {
          console.timeEnd(`API: ${url}`)
          console.log(`✅ API 응답 (${response.status}):`, url)
          
          // 응답 데이터 로깅 (JSON만)
          if (response.headers.get('content-type')?.includes('application/json')) {
            const clonedResponse = response.clone()
            try {
              const data = await clonedResponse.json()
              console.log('📦 응답 데이터:', data)
              
              // 데이터 소스 정보가 있으면 표시
              if (data.meta?.source) {
                console.log(`🔍 데이터 소스: ${data.meta.source}`)
              }
            } catch (e) {
              console.log('📦 응답 데이터: JSON 파싱 실패')
            }
          }
        }
        
        return response
      } catch (error: any) {
        // API 에러 로그
        if (url.includes('/api/')) {
          console.timeEnd(`API: ${url}`)
          console.error('❌ 클라이언트 API 에러:', url, {
            message: error?.message,
            name: error?.name,
          })
          
          // undici 에러의 cause 정보 로깅 (클라이언트에서도 발생 가능)
          if (error?.cause) {
            console.error('🔍 클라이언트 Undici 에러 원인:', {
              code: error.cause.code,
              errno: error.cause.errno,
              syscall: error.cause.syscall,
              address: error.cause.address,
              port: error.cause.port,
              hostname: error.cause.hostname,
            })
            
            // 에러 코드별 친화적 메시지
            const errorMessages: Record<string, string> = {
              'ENOTFOUND': '🌐 DNS 조회 실패 - 도메인을 찾을 수 없습니다',
              'ECONNREFUSED': '🚫 연결 거부됨 - 서버가 응답하지 않습니다',
              'ETIMEDOUT': '⏰ 연결 시간 초과 - 네트워크가 느리거나 서버가 응답하지 않습니다',
              'ECONNRESET': '🔌 연결이 재설정됨 - 서버에서 연결을 끊었습니다',
              'EHOSTUNREACH': '🏠 호스트에 연결할 수 없음 - 네트워크 경로 문제',
              'EPROTO': '📝 프로토콜 에러 - SSL/TLS 인증서 문제일 가능성',
              'CERT_HAS_EXPIRED': '📜 SSL 인증서 만료',
              'UNABLE_TO_VERIFY_LEAF_SIGNATURE': '🔒 SSL 인증서 검증 실패'
            }
            
            const friendlyMessage = errorMessages[error.cause.code] || `❓ 알 수 없는 에러: ${error.cause.code}`
            console.error(`💡 ${friendlyMessage}`)
          }
        }
        throw error
      }
    }

    // 컴포넌트 언마운트 시 원본 fetch 복원
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}
