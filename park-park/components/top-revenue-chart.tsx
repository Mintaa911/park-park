"use client";

import { TrendingUp } from "lucide-react";
import { LabelList, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TopRevenueLotsDataItem } from "@/types";

export const description = "A radial chart with a label";

function generateChartConfig(
  data: { lot: string }[]
): Record<string, { label: string; color: string }> {
  return data.reduce((acc, item, index) => {
    acc[item.lot] = {
      label: item.lot,
      color: `var(--chart-${index + 1})`, // matches your chart variable
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);
}

// Example use

interface Props {
  data: TopRevenueLotsDataItem[];
  month: string;
}
export function TopRevenueChart({ data, month }: Props) {
  const bookingType = data;
  const chartConfig = generateChartConfig(bookingType);

  return (
    <Card className="flex flex-col ">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Lots by Revenue</CardTitle>
        <CardDescription>{month}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={bookingType}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="browser" />}
            />
            <RadialBar dataKey="revenue" background>
              <LabelList
                position="insideStart"
                dataKey="lot"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing top lots by booking
        </div>
      </CardFooter>
    </Card>
  );
}
