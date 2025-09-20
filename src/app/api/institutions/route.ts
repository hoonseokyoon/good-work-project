import { NextRequest, NextResponse } from 'next/server'
import { sb } from '@/lib/supabase-server'

const fallback = [
  {
    id: 1,
    name: '서울 베네딕도회',
    slug: 'seoul-benedictine',
    lat: 37.5856,
    lng: 126.9735,
    type: '베네딕도회',
    address: '서울특별시 종로구'
  },
  {
    id: 2,
    name: '춘천 카르멜 수녀원',
    slug: 'chuncheon-carmelite',
    lat: 37.8741,
    lng: 127.7342,
    type: '카르멜회',
    address: '강원특별자치도 춘천시'
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bbox = searchParams.get('bbox')
  const q = searchParams.get('q')?.toLowerCase()

  console.log('🔄 API /institutions 호출됨')
  console.log('  - 검색어(q):', q || '없음')
  console.log('  - 바운딩박스(bbox):', bbox || '없음')

  let rows = fallback
  let dataSource = 'fallback'

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      console.log('📡 Supabase에서 데이터 조회 시작...')
      const client = sb()
      const query = client.from('institutions').select('id, name, slug, lat, lng, type, address').limit(100)
      const { data, error } = await query
      
      if (error) {
        console.error('❌ Supabase 응답 에러 (데이터베이스 레벨):', error)
        console.error('  - Error message:', error.message)
        console.error('  - Error code:', error.code)
        console.error('  - Error details:', error.details)
        console.error('  - Error hint:', error.hint)
      } else {
        console.log('✅ Supabase 조회 성공')
        console.log('  - 조회된 데이터 개수:', data?.length || 0)
        if (data?.length) {
          console.log('  - 첫 번째 기관:', data[0]?.name)
          rows = data as typeof fallback
          dataSource = 'supabase'
        } else {
          console.log('  - 데이터가 비어있음, fallback 사용')
        }
      }
    } catch (err: any) {
      console.error('❌ Supabase 네트워크/연결 에러 (fetch 레벨):', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack?.split('\n')[0], // 첫 번째 스택 라인만
      })
      
      // undici 에러의 cause 정보 로깅
      if (err?.cause) {
        console.error('🔍 Undici 에러 원인 분석:', {
          code: err.cause.code,
          errno: err.cause.errno,
          syscall: err.cause.syscall,
          address: err.cause.address,
          port: err.cause.port,
          hostname: err.cause.hostname,
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
        
        const friendlyMessage = errorMessages[err.cause.code] || `❓ 알 수 없는 에러: ${err.cause.code}`
        console.error(`💡 ${friendlyMessage}`)
      }
      
      console.log('  - fallback 데이터 사용')
    }
  } else {
    console.log('⚠️ Supabase 환경변수 없음, fallback 사용')
  }

  console.log(`📊 데이터 소스: ${dataSource}`)
  console.log(`📊 필터링 전 데이터 개수: ${rows.length}`)

  if (q) {
    rows = rows.filter((row) => {
      const address = typeof row.address === 'string' ? row.address.toLowerCase() : ''
      return row.name.toLowerCase().includes(q) || address.includes(q)
    })
    console.log(`🔍 검색 필터링 후 데이터 개수: ${rows.length}`)
  }

  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number)
    if ([minLng, minLat, maxLng, maxLat].every((value) => Number.isFinite(value))) {
      rows = rows.filter((row) => {
        if (typeof row.lat !== 'number' || typeof row.lng !== 'number') return false
        return row.lat >= minLat && row.lat <= maxLat && row.lng >= minLng && row.lng <= maxLng
      })
      console.log(`📍 지역 필터링 후 데이터 개수: ${rows.length}`)
    }
  }

  console.log(`✅ API 응답: ${rows.length}개 기관 반환`)
  return NextResponse.json({ data: rows, meta: { source: dataSource } })
}
