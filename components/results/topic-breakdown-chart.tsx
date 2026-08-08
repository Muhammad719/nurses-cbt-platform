"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Row = { topic: string; percentage: number; correct: number; total: number }

export function TopicBreakdownChart({ data }: { data: Row[] }) {
  return (
    <ChartContainer
      config={{ percentage: { label: "Score", color: "var(--chart-1)" } }}
      className="h-56 w-full"
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="topic"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          interval={0}
        />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={36} />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((row) => (
            <Cell
              key={row.topic}
              fill={row.percentage >= 50 ? "var(--chart-3)" : "var(--chart-5)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
