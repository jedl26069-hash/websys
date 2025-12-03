"use client";

import * as React from "react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bullet } from "@/components/ui/bullet";
import type { TimePeriod } from "@/types/dashboard";
import { getVoltageHistory, getAdapters } from "@/lib/api";
import { useContext } from "react";
import { UserContext } from "@/components/providers/user-provider";

type ChartDataPoint = {
  date: string;
  voltage: number;
};

const chartConfig = {
  voltage: {
    label: "Voltage (V)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function DashboardChart() {
  const userContext = useContext(UserContext);
  const userId = userContext?.userId || "user-default";
  
  const [activeTab, setActiveTab] = React.useState<TimePeriod>("week");
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadVoltageData = async () => {
      setLoading(true);
      // Fetch voltage history for first adapter (gets all adapters and uses first available)
      // In production, this should be tied to currently selected adapter
      const adapters = await getAdapters(userId);
      const adapterId = adapters.length > 0 ? adapters[0].adapter_id : "55555";
      const history = await getVoltageHistory(adapterId, userId, 30);
      
      // Group and aggregate data by period
      const dataByPeriod: Record<TimePeriod, ChartDataPoint[]> = {
        week: [],
        month: [],
        year: [],
      };

      // Simple aggregation: group by date and average voltage
      const grouped: Record<string, number[]> = {};
      history.forEach((log) => {
        const date = log.timestamp.split("T")[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(log.voltage);
      });

      const aggregated = Object.entries(grouped).map(([date, voltages]) => ({
        date,
        voltage: Math.round((voltages.reduce((a, b) => a + b, 0) / voltages.length) * 100) / 100,
      }));

      // Assign to periods (week = last 7 days, month = last 30 days, year = all)
      dataByPeriod.week = aggregated.slice(-7);
      dataByPeriod.month = aggregated.slice(-30);
      dataByPeriod.year = aggregated;

      setChartData(dataByPeriod[activeTab] || []);
      setLoading(false);
    };

    loadVoltageData();
  }, [userId, activeTab]);

  const handleTabChange = (value: string) => {
    if (value === "week" || value === "month" || value === "year") {
      setActiveTab(value as TimePeriod);
    }
  };

  const formatYAxisValue = (value: number) => {
    if (value === 0) return "";
    return `${value}V`;
  };

  const renderChart = (data: ChartDataPoint[]) => {
    if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>;
    if (data.length === 0) return <div className="text-sm text-muted-foreground">No data available</div>;

    return (
      <div className="bg-accent rounded-lg p-3">
        <ChartContainer className="md:aspect-[3/1] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillVoltage" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-voltage)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-voltage)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="8 8"
              strokeWidth={2}
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              strokeWidth={1.5}
              className="uppercase text-sm fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickCount={6}
              className="text-sm fill-muted-foreground"
              tickFormatter={formatYAxisValue}
              domain={["dataMin - 10", "dataMax + 10"]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  className="min-w-[200px] px-4 py-3"
                />
              }
            />
            <Area
              dataKey="voltage"
              type="linear"
              fill="url(#fillVoltage)"
              fillOpacity={0.4}
              stroke="var(--color-voltage)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="max-md:gap-4"
    >
      <div className="flex items-center justify-between mb-4 max-md:contents">
        <TabsList className="max-md:w-full">
          <TabsTrigger value="week">WEEK</TabsTrigger>
          <TabsTrigger value="month">MONTH</TabsTrigger>
          <TabsTrigger value="year">YEAR</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-6 max-md:order-1">
          <ChartLegend label="Voltage (V)" color="var(--chart-1)" />
        </div>
      </div>
      <TabsContent value="week" className="space-y-4">
        {renderChart(chartData)}
      </TabsContent>
      <TabsContent value="month" className="space-y-4">
        {renderChart(chartData)}
      </TabsContent>
      <TabsContent value="year" className="space-y-4">
        {renderChart(chartData)}
      </TabsContent>
    </Tabs>
  );
}

export const ChartLegend = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => {
  return (
    <div className="flex items-center gap-2 uppercase">
      <Bullet style={{ backgroundColor: color }} className="rotate-45" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};
