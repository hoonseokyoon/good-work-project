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

  let rows = fallback

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const client = sb()
    const query = client.from('institutions').select('id, name, slug, lat, lng, type, address').limit(100)
    const { data } = await query
    if (data?.length) {
      rows = data as typeof fallback
    }
  }

  if (q) {
    rows = rows.filter((row) => {
      const address = typeof row.address === 'string' ? row.address.toLowerCase() : ''
      return row.name.toLowerCase().includes(q) || address.includes(q)
    })
  }

  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number)
    if ([minLng, minLat, maxLng, maxLat].every((value) => Number.isFinite(value))) {
      rows = rows.filter((row) => {
        if (typeof row.lat !== 'number' || typeof row.lng !== 'number') return false
        return row.lat >= minLat && row.lat <= maxLat && row.lng >= minLng && row.lng <= maxLng
      })
    }
  }

  return NextResponse.json({ data: rows })
}
