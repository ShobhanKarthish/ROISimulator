export interface CalculatorInputs {
  scenario_name?: string;
  monthly_invoice_volume: number;
  num_ap_staff: number;
  avg_hours_per_invoice: number;
  hourly_wage: number;
  error_rate_manual: number;
  error_cost: number;
  time_horizon_months: number;
  one_time_implementation_cost: number;
}

export interface CalculationResults {
  monthly_savings: number;
  payback_months: number;
  roi_percentage: number;
  cumulative_savings: number;
  net_savings: number;
  labor_cost_saved: number;
  error_savings: number;
  breakdown: {
    manual_labor_cost: number;
    automation_cost: number;
    monthly_net_savings: number;
  };
}

export interface Scenario {
  id: string;
  name: string;
  inputs: CalculatorInputs;
  results: CalculationResults;
  created_at: string;
  updated_at: string;
}

export const PRESET_SCENARIOS = {
  small: {
    name: "Small Business",
    monthly_invoice_volume: 500,
    num_ap_staff: 1,
    avg_hours_per_invoice: 0.25,
    hourly_wage: 25,
    error_rate_manual: 0.5,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 20000,
  },
  medium: {
    name: "Medium Business",
    monthly_invoice_volume: 2000,
    num_ap_staff: 3,
    avg_hours_per_invoice: 0.17,
    hourly_wage: 30,
    error_rate_manual: 0.5,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 50000,
  },
  enterprise: {
    name: "Enterprise",
    monthly_invoice_volume: 10000,
    num_ap_staff: 10,
    avg_hours_per_invoice: 0.1,
    hourly_wage: 35,
    error_rate_manual: 0.5,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 100000,
  },
};
