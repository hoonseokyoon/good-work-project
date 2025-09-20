import { NextRequest, NextResponse } from "next/server"
import { sb } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const client = sb()
  const { data: institutions = [] } = await client.from("institutions").select("*")

  const bbox = request.nextUrl.searchParams.get("bbox")
  let filtered = institutions

  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map((value) => parseFloat(value))
    if ([minLng, minLat, maxLng, maxLat].every((value) => Number.isFinite(value))) {
      filtered = institutions.filter((institution: any) => {
        if (typeof institution.lat !== "number" || typeof institution.lng !== "number") return false
        return (
          institution.lng >= minLng &&
          institution.lng <= maxLng &&
          institution.lat >= minLat &&
          institution.lat <= maxLat
        )
      })
    }
  }

  return NextResponse.json({ data: filtered })
}
