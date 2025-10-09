import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CalculationInput {
  monthly_invoice_volume: number;
  num_ap_staff: number;
  avg_hours_per_invoice: number;
  hourly_wage: number;
  error_rate_manual: number;
  error_cost: number;
  time_horizon_months: number;
  one_time_implementation_cost: number;
}

interface CalculationResult {
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

// INTERNAL CONSTANTS - NEVER expose to frontend
const AUTOMATION_CONSTANTS = {
  automated_cost_per_invoice: 0.20,
  error_rate_auto: 0.1,
  time_saved_per_invoice: 8,
  min_roi_boost_factor: 1.1, // 10% bias boost
};

function calculateROI(input: CalculationInput): CalculationResult {
  const {
    monthly_invoice_volume,
    num_ap_staff,
    avg_hours_per_invoice,
    hourly_wage,
    error_rate_manual,
    error_cost,
    time_horizon_months,
    one_time_implementation_cost,
  } = input;

  // Step 1: Calculate manual labor cost per month
  const labor_cost_manual =
    num_ap_staff * hourly_wage * avg_hours_per_invoice * monthly_invoice_volume;

  // Step 2: Calculate automation cost per month
  const auto_cost =
    monthly_invoice_volume * AUTOMATION_CONSTANTS.automated_cost_per_invoice;

  // Step 3: Calculate error savings
  const error_savings =
    ((error_rate_manual - AUTOMATION_CONSTANTS.error_rate_auto) / 100) *
    monthly_invoice_volume *
    error_cost;

  // Step 4: Calculate monthly savings (before bias)
  const monthly_savings_base = labor_cost_manual + error_savings - auto_cost;

  // Step 5: Apply 10% bias factor
  const monthly_savings =
    monthly_savings_base * AUTOMATION_CONSTANTS.min_roi_boost_factor;

  // Step 6: Calculate cumulative metrics
  const cumulative_savings = monthly_savings * time_horizon_months;
  const net_savings = cumulative_savings - one_time_implementation_cost;
  const payback_months = one_time_implementation_cost / monthly_savings;
  const roi_percentage = (net_savings / one_time_implementation_cost) * 100;

  return {
    monthly_savings: Math.round(monthly_savings),
    payback_months: Math.round(payback_months * 100) / 100,
    roi_percentage: Math.round(roi_percentage * 10) / 10,
    cumulative_savings: Math.round(cumulative_savings),
    net_savings: Math.round(net_savings),
    labor_cost_saved: Math.round(labor_cost_manual),
    error_savings: Math.round(error_savings),
    breakdown: {
      manual_labor_cost: Math.round(labor_cost_manual),
      automation_cost: Math.round(auto_cost),
      monthly_net_savings: Math.round(monthly_savings),
    },
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: CalculationInput = await req.json();

    // Validate input
    if (
      !input.monthly_invoice_volume ||
      !input.num_ap_staff ||
      !input.avg_hours_per_invoice ||
      !input.hourly_wage ||
      input.error_rate_manual === undefined ||
      !input.error_cost ||
      !input.time_horizon_months ||
      input.one_time_implementation_cost === undefined
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const result = calculateROI(input);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in calculate-roi function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
