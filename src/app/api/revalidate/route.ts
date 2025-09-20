import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { path?: string; tag?: string } | null

  if (!payload?.path && !payload?.tag) {
    return NextResponse.json({ revalidated: false, message: 'path 또는 tag가 필요합니다.' }, { status: 400 })
  }

  if (payload.path) {
    revalidatePath(payload.path)
  }

  if (payload.tag) {
    revalidateTag(payload.tag)
  }

  return NextResponse.json({ revalidated: true })
}
