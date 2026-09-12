"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  views: { label: "Views", color: "var(--primary)" },
  uniqueVisitors: { label: "Unique visitors", color: "var(--foreground)" },
} satisfies ChartConfig;

export function TrafficChart({
  data,
}: {
  data: Array<{ day: string; views: number; uniqueVisitors: number }>;
}) {
  return (
    <ChartContainer
      className="admin-traffic-chart"
      config={chartConfig}
      id="daily-traffic"
    >
      <LineChart accessibilityLayer data={data} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="day"
          minTickGap={24}
          tickFormatter={(day: string) =>
            new Date(`${day}T00:00:00`).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })
          }
          tickLine={false}
          tickMargin={10}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(day) =>
                new Date(`${String(day)}T00:00:00`).toLocaleDateString("en", {
                  dateStyle: "medium",
                })
              }
            />
          }
        />
        <Line
          dataKey="views"
          dot={false}
          stroke="var(--primary)"
          strokeWidth={4}
          type="monotone"
        />
        <Line
          dataKey="uniqueVisitors"
          dot={false}
          stroke="var(--foreground)"
          strokeDasharray="6 4"
          strokeWidth={3}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  );
}
