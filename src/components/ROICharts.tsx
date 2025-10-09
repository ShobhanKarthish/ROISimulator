import { CalculationResults, CalculatorInputs } from "@/types/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ROIChartsProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
}

export function ROICharts({ results, inputs }: ROIChartsProps) {
  // Generate cumulative savings data
  const cumulativeSavingsData = [];
  for (let month = 0; month <= inputs.time_horizon_months; month++) {
    const cumulativeSavings =
      results.monthly_savings * month - inputs.one_time_implementation_cost;
    cumulativeSavingsData.push({
      month,
      savings: cumulativeSavings,
    });
  }

  // Cost comparison data
  const costComparisonData = [
    {
      process: "Manual",
      "Labor Cost": results.breakdown.manual_labor_cost,
      "Error Cost": results.error_savings,
    },
    {
      process: "Automated",
      "Automation Cost": results.breakdown.automation_cost,
      Savings: results.breakdown.monthly_net_savings,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Savings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeSavingsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                label={{
                  value: "Months",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                tickFormatter={(value) =>
                  `$${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Month ${label}`}
              />
              <ReferenceLine
                y={0}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                label="Break-even"
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={false}
                name="Cumulative Savings"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costComparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="process" />
              <YAxis
                tickFormatter={(value) =>
                  `$${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar
                dataKey="Labor Cost"
                fill="hsl(var(--destructive))"
                stackId="a"
              />
              <Bar
                dataKey="Error Cost"
                fill="hsl(var(--chart-4))"
                stackId="a"
              />
              <Bar
                dataKey="Automation Cost"
                fill="hsl(var(--primary))"
                stackId="b"
              />
              <Bar
                dataKey="Savings"
                fill="hsl(var(--success))"
                stackId="b"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
