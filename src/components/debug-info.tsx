'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DebugInfoProps {
  dataSource: string
  itemCount: number
  showInProduction?: boolean
}

export default function DebugInfo({ 
  dataSource, 
  itemCount, 
  showInProduction = false 
}: DebugInfoProps) {
  const [isDevelopment, setIsDevelopment] = useState(false)
  
  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === 'development')
  }, [])

  // 프로덕션 환경에서는 showInProduction이 true일 때만 표시
  if (!isDevelopment && !showInProduction) {
    return null
  }

  return (
    <Card className="border-dashed border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
          🐛 디버그 정보
          <Badge variant="outline" className="text-xs">
            {isDevelopment ? 'DEV' : 'PROD'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-orange-700 space-y-1">
        <div className="flex justify-between">
          <span>데이터 소스:</span>
          <Badge variant={dataSource === 'supabase' ? 'default' : 'secondary'}>
            {dataSource === 'supabase' ? '🗄️ Supabase' : '💾 Fallback'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>항목 수:</span>
          <span className="font-mono">{itemCount}개</span>
        </div>
        <div className="text-xs text-orange-600 mt-2 pt-2 border-t border-orange-200">
          {dataSource === 'supabase' 
            ? '✅ Supabase에서 실제 데이터를 불러왔습니다.' 
            : '⚠️ Fallback 데이터를 사용 중입니다. Supabase 연결을 확인하세요.'
          }
        </div>
      </CardContent>
    </Card>
  )
}
