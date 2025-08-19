"use client";

import * as React from "react";
import { Legend, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TopBookingLotsDataItem } from "@/types";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
} satisfies ChartConfig;

interface Props {
  data: TopBookingLotsDataItem[];
  month: string;
}

export function TopbookingPieChart({ data, month }: Props) {
  const lotBookings = data;

  if (lotBookings) {
    return (
      <Card className="flex flex-col ">
        <CardHeader className="items-center pb-0">
          <CardTitle>Most Booked Lots</CardTitle>
          <CardDescription>{month}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel={false} />}
              />
              <Pie data={lotBookings} dataKey="bookings" nameKey="lot" />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
}
