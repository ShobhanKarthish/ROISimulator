import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalculatorInputs, PRESET_SCENARIOS } from "@/types/calculator";
import { Loader2, Calculator } from "lucide-react";

const formSchema = z.object({
  scenario_name: z.string().max(50).optional(),
  monthly_invoice_volume: z
    .number()
    .min(1, "Must be at least 1")
    .max(100000, "Must be less than 100,000"),
  num_ap_staff: z
    .number()
    .min(1, "Must be at least 1")
    .max(50, "Must be less than 50"),
  avg_hours_per_invoice: z
    .number()
    .min(0.01, "Must be at least 0.01")
    .max(10, "Must be less than 10"),
  hourly_wage: z
    .number()
    .min(1, "Must be at least $1")
    .max(200, "Must be less than $200"),
  error_rate_manual: z
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  error_cost: z
    .number()
    .min(0, "Cannot be negative")
    .max(10000, "Must be less than $10,000"),
  time_horizon_months: z
    .number()
    .min(1, "Must be at least 1 month")
    .max(120, "Must be less than 120 months"),
  one_time_implementation_cost: z
    .number()
    .min(0, "Cannot be negative")
    .max(1000000, "Must be less than $1,000,000"),
});

interface CalculatorFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
  isLoading: boolean;
  defaultValues?: Partial<CalculatorInputs>;
}

export function CalculatorForm({
  onCalculate,
  isLoading,
  defaultValues,
}: CalculatorFormProps) {
  const form = useForm<CalculatorInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      monthly_invoice_volume: 2000,
      num_ap_staff: 3,
      avg_hours_per_invoice: 0.17,
      hourly_wage: 30,
      error_rate_manual: 0.5,
      error_cost: 100,
      time_horizon_months: 36,
      one_time_implementation_cost: 50000,
    },
  });

  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESET_SCENARIOS | null>(null);

  const handlePreset = (preset: keyof typeof PRESET_SCENARIOS) => {
    const presetData = PRESET_SCENARIOS[preset];
    form.reset(presetData);
    setSelectedPreset(preset);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant={selectedPreset === "small" ? "secondary" : "outline"}
          size="sm"
          onClick={() => handlePreset("small")}
        >
          Small Business
        </Button>
        <Button
          type="button"
          variant={selectedPreset === "medium" ? "secondary" : "outline"}
          size="sm"
          onClick={() => handlePreset("medium")}
        >
          Medium Business
        </Button>
        <Button
          type="button"
          variant={selectedPreset === "enterprise" ? "secondary" : "outline"}
          size="sm"
          onClick={() => handlePreset("enterprise")}
        >
          Enterprise
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onCalculate)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="scenario_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scenario Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Q4 2024 Analysis" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="monthly_invoice_volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Invoice Volume</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Number of invoices per month</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="num_ap_staff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of AP Staff</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Full-time AP employees</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avg_hours_per_invoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avg Hours per Invoice</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>0.17 = 10 minutes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hourly_wage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Wage ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Per employee hourly rate</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="error_rate_manual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manual Error Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Percentage of invoices with errors</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="error_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Error Correction Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Average cost to fix one error</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time_horizon_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Horizon (Months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Analysis period in months</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="one_time_implementation_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Implementation Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>One-time setup investment</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate ROI
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
