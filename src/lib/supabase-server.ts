import 'server-only'

import { createClient } from '@supabase/supabase-js'

export function sb() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  
  console.log('🔍 Supabase 환경변수 확인:')
  console.log('  - SUPABASE_URL:', url ? `설정됨 (${url.substring(0, 30)}...)` : '❌ 미설정')
  console.log('  - SUPABASE_ANON_KEY:', key ? `설정됨 (${key.substring(0, 20)}...)` : '❌ 미설정')
  
  if (!url || !key) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다.')
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }
  
  try {
    console.log('✅ Supabase 클라이언트 생성 중...')
    const client = createClient(url, key, {
      auth: { persistSession: false }
    })
    
    console.log('✅ Supabase 클라이언트 생성 완료')
    return client
  } catch (err: any) {
    console.error('❌ Supabase 클라이언트 생성 실패:', {
      message: err?.message,
      name: err?.name,
    })
    
    // undici 에러의 cause 정보 로깅 (클라이언트 생성 단계에서는 드물지만)
    if (err?.cause) {
      console.error('🔍 클라이언트 생성 시 Undici 에러 원인:', {
        code: err.cause.code,
        errno: err.cause.errno,
        syscall: err.cause.syscall,
        address: err.cause.address,
        port: err.cause.port,
        hostname: err.cause.hostname,
      })
    }
    
    throw err
  }
}
