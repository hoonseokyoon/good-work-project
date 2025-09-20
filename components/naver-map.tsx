"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    naver: any
  }
}

type Marker = {
  lat: number
  lng: number
  title?: string
  slug: string
}

type Props = {
  center: { lat: number; lng: number }
  markers: Marker[]
}

export default function NaverMap({ center, markers }: Props) {
  const mapId = useRef(`naver_map_${Math.random().toString(36).slice(2)}`)
  const router = useRouter()
  const markerKey = useMemo(() => JSON.stringify(markers), [markers])

  useEffect(() => {
    const scriptSrc = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`
    const existing = Array.from(document.querySelectorAll<HTMLScriptElement>("script")).find((script) => script.src === scriptSrc)

    if (!existing) {
      const script = document.createElement("script")
      script.src = scriptSrc
      script.async = true
      script.addEventListener("load", initialize)
      document.head.appendChild(script)
      return () => {
        script.removeEventListener("load", initialize)
        document.head.removeChild(script)
      }
    } else {
      initialize()
    }

    function initialize() {
      if (!window.naver?.maps) return

      const map = new window.naver.maps.Map(mapId.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: 9,
        zoomControl: true
      })

      markers.forEach((marker) => {
        const mapMarker = new window.naver.maps.Marker({
          map,
          position: new window.naver.maps.LatLng(marker.lat, marker.lng),
          title: marker.title ?? "기관"
        })

        window.naver.maps.Event.addListener(mapMarker, "click", () => {
          router.push(`/institutions/${marker.slug}`)
        })
      })
    }
  }, [center.lat, center.lng, markerKey, router])

  return <div id={mapId.current} className="h-[65vh] w-full rounded-2xl border bg-muted" />
}
