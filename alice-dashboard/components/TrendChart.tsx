/**
 * Trend Chart Component
 * Clean line chart for quality trends over time
 */

'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate } from '@/lib/utils'

interface TrendChartProps {
  data: Array<{
    date: string
    score: number
    grade: string
  }>
  height?: number
}

export default function TrendChart({ data, height = 300 }: TrendChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }))

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="text-sm font-medium text-text-secondary mb-6 tracking-wide uppercase">
        Quality Score Trend
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis
            dataKey="date"
            stroke="#737373"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#737373"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#171717', fontWeight: 600, marginBottom: '4px' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0284C7"
            strokeWidth={2}
            dot={{ fill: '#0284C7', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
