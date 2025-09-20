import SearchFilters from '@/components/filters/search-filters'
import InstitutionListItem from '@/components/institution-list-item'
import NaverMap from '@/components/naver-map'
import DebugInfo from '@/components/debug-info'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sb } from '@/lib/supabase-server'

export const revalidate = 3600

export const metadata = {
  title: '찾기 — 수도원·수녀원',
  description: '전국의 수도원·수녀원을 지도와 리스트로 탐색합니다.'
}

type Institution = {
  id?: number
  name: string
  slug: string
  lat: number | null
  lng: number | null
  order?: number | null
  type?: string | null
  address?: string | null
}

const fallbackInstitutions: Institution[] = [
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

export default async function MapPage() {
  let institutions: Institution[] = fallbackInstitutions
  let dataSource = 'fallback'

  console.log('🗺️ Map 페이지 렌더링 시작')

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      console.log('📡 Map 페이지: Supabase에서 데이터 조회 시작...')
      const supabase = sb()
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name, slug, lat, lng, order, type, address')
        .order('name')
      
      if (error) {
        console.error('❌ Map 페이지 Supabase 응답 에러 (데이터베이스 레벨):', error)
        console.error('  - Error message:', error.message)
        console.error('  - Error code:', error.code)
        console.error('  - Error details:', error.details)
        console.error('  - Error hint:', error.hint)
      } else {
        console.log('✅ Map 페이지 Supabase 조회 성공')
        console.log('  - 조회된 데이터 개수:', data?.length || 0)
        if (data?.length) {
          console.log('  - 첫 번째 기관:', data[0]?.name)
          institutions = data
          dataSource = 'supabase'
        } else {
          console.log('  - 데이터가 비어있음, fallback 사용')
        }
      }
    } catch (err: any) {
      console.error('❌ Map 페이지 Supabase 네트워크/연결 에러 (fetch 레벨):', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack?.split('\n')[0], // 첫 번째 스택 라인만
      })
      
      // undici 에러의 cause 정보 로깅
      if (err?.cause) {
        console.error('🔍 Map 페이지 Undici 에러 원인 분석:', {
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
    console.log('⚠️ Map 페이지: Supabase 환경변수 없음, fallback 사용')
  }

  console.log(`🗺️ Map 페이지 데이터 소스: ${dataSource}`)
  console.log(`🗺️ Map 페이지 기관 수: ${institutions.length}`)

  const center = institutions[0]?.lat && institutions[0]?.lng ? { lat: institutions[0].lat, lng: institutions[0].lng } : { lat: 37.5665, lng: 126.978 }

  const markers = institutions
    .filter((item) => typeof item.lat === 'number' && typeof item.lng === 'number')
    .map((item) => ({ lat: item.lat as number, lng: item.lng as number, title: item.name, slug: item.slug }))

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-4">
        <DebugInfo dataSource={dataSource} itemCount={institutions.length} />
        <SearchFilters />
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">지도에서 찾기</CardTitle>
          </CardHeader>
          <CardContent>
            <NaverMap center={center} markers={markers} />
          </CardContent>
        </Card>
      </div>
      <aside className="lg:col-span-4 space-y-3">
        {institutions.map((institution) => (
          <InstitutionListItem key={institution.slug} item={institution} />
        ))}
      </aside>
    </div>
  )
}
