"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  event: {
    label: "Event",
    color: "var(--chart-1)",
  },
  regular: {
    label: "Regular",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface CountItem {
  is_event: boolean;
  total: number;
}

interface Props {
  countData: CountItem[];
}

export function LotBookingTypeChart({ countData }: Props) {
  // Normalize input into chart data { Event, Regular }
  const eventCount =
    countData.find((item) => item.is_event === true)?.total ?? 0;
  const regularCount =
    countData.find((item) => item.is_event === false)?.total ?? 0;

  const chartData = [
    {
      Event: eventCount,
      Regular: regularCount,
    },
  ];

  const total = eventCount + regularCount;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Regular vs Event Bookings</CardTitle>
        <CardDescription>Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Bookings
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="Event"
              stackId="a"
              cornerRadius={5}
              fill="var(--chart-1)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="Regular"
              stackId="a"
              cornerRadius={5}
              fill="var(--chart-2)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 8.2% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing event vs regular bookings
        </div>
      </CardFooter>
    </Card>
  );
}
