'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    naver: any;
  }
}

type Marker = { lat: number; lng: number; title?: string; slug: string };

type Props = {
  center: { lat: number; lng: number };
  markers: Marker[];
};

export default function NaverMap({ center, markers }: Props) {
  const id = useRef(`map_${Math.random().toString(36).slice(2)}`);
  const router = useRouter();

  useEffect(() => {
    // 환경변수 체크
    if (!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID) {
      console.warn(
        '⚠️ NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 설정되지 않았습니다.',
      );
      return;
    }

    const src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`;
    const existing = document.querySelector(
      `script[src*="maps.js"]`,
    ) as HTMLScriptElement | null;

    if (!existing) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
      script.addEventListener('load', init);
      return () => {
        script.removeEventListener('load', init);
        document.head.removeChild(script);
      };
    } else if (window.naver?.maps) {
      init();
    } else {
      existing.addEventListener('load', init);
      return () => existing.removeEventListener('load', init);
    }

    function init() {
      if (!window.naver?.maps) return;
      const map = new window.naver.maps.Map(id.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: 10,
      });
      markers.forEach((marker) => {
        if (!marker.lat || !marker.lng) return;
        const mk = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(marker.lat, marker.lng),
          title: marker.title,
          map,
        });
        window.naver.maps.Event.addListener(mk, 'click', () =>
          router.push(`/institutions/${marker.slug}`),
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, JSON.stringify(markers), router]);

  return <div id={id.current} className="h-[70vh] w-full rounded-2xl border" />;
}
