import { CalculationResults } from "@/types/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Clock,
  TrendingUp,
  PiggyBank,
  Trophy,
} from "lucide-react";

interface ResultsDisplayProps {
  results: CalculationResults;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metrics = [
    {
      title: "Monthly Savings",
      value: formatCurrency(results.monthly_savings),
      icon: DollarSign,
      description: "Recurring monthly benefit",
      color: "text-success",
    },
    {
      title: "Payback Period",
      value: `${results.payback_months} months`,
      icon: Clock,
      description: "Time to recover investment",
      color: "text-primary",
    },
    {
      title: "ROI",
      value: `${results.roi_percentage}%`,
      icon: TrendingUp,
      description: "Return on investment",
      color: "text-accent",
    },
    {
      title: "Cumulative Savings",
      value: formatCurrency(results.cumulative_savings),
      icon: PiggyBank,
      description: "Total savings over time horizon",
      color: "text-success",
    },
    {
      title: "Net Savings",
      value: formatCurrency(results.net_savings),
      icon: Trophy,
      description: "Profit after implementation cost",
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold font-mono-numbers animate-counter ${metric.color}`}
                >
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Manual Labor Cost (Monthly)
            </span>
            <span className="font-semibold font-mono-numbers">
              {formatCurrency(results.breakdown.manual_labor_cost)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Automation Cost (Monthly)
            </span>
            <span className="font-semibold font-mono-numbers">
              {formatCurrency(results.breakdown.automation_cost)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Error Savings (Monthly)
            </span>
            <span className="font-semibold font-mono-numbers text-success">
              {formatCurrency(results.error_savings)}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Monthly Net Savings</span>
            <span className="text-xl font-bold font-mono-numbers text-success">
              {formatCurrency(results.breakdown.monthly_net_savings)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
