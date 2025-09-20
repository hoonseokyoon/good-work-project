import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  const body = await request.json().catch(() => ({}))
  const path = body.path ?? request.nextUrl.searchParams.get("path") ?? "/"

  if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }

  revalidatePath(path)
  return NextResponse.json({ revalidated: true, path })
}
