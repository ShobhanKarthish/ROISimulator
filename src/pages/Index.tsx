import { useState } from "react";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ROICharts } from "@/components/ROICharts";
import { ScenarioManager } from "@/components/ScenarioManager";
import { PDFReportDialog } from "@/components/PDFReportDialog";
import { CalculatorInputs, CalculationResults, Scenario } from "@/types/calculator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

const Index = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthly_invoice_volume: 2000,
    num_ap_staff: 3,
    avg_hours_per_invoice: 0.17,
    hourly_wage: 30,
    error_rate_manual: 0.5,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 50000,
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateROI = async (newInputs: CalculatorInputs) => {
    setIsCalculating(true);
    setInputs(newInputs);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-roi', {
        body: newInputs,
      });

      if (error) {
        throw new Error(error.message || "Calculation failed");
      }
      
      if (data?.success) {
        setResults(data.data);
      } else {
        throw new Error("Calculation failed");
      }
    } catch (error: any) {
      toast.error("Failed to calculate ROI", {
        description: error.message,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setInputs(scenario.inputs);
    setResults(scenario.results);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Site logo"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold">ROI Simulator</h1>
              <p className="text-sm text-muted-foreground">
                Calculate your savings with automated invoice processing
              </p>
            </div>
            <div className="ml-auto">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-lg shadow-sm border p-4">
              <h2 className="text-xl font-semibold mb-3">Input Parameters</h2>
              <CalculatorForm
                onCalculate={calculateROI}
                isLoading={isCalculating}
                defaultValues={inputs}
              />
            </div>

            <div className="bg-card rounded-lg shadow-sm border p-4">
              <h2 className="text-xl font-semibold mb-3">Scenarios</h2>
              <ScenarioManager
                currentInputs={inputs}
                currentResults={results}
                onLoadScenario={handleLoadScenario}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-4">
            {results ? (
              <>
                <div className="bg-card rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Results</h2>
                    <PDFReportDialog inputs={inputs} results={results} />
                  </div>
                  <ResultsDisplay results={results} />
                </div>

                <div className="bg-card rounded-lg shadow-sm border p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Visual Analysis
                  </h2>
                  <ROICharts results={results} inputs={inputs} />
                </div>
              </>
            ) : (
              <div className="bg-card rounded-lg shadow-sm border p-8 text-center">
                <Calculator className="h-14 w-14 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">
                  Ready to Calculate
                </h3>
                <p className="text-muted-foreground">
                  Fill in the parameters and click "Calculate ROI" to see your
                  results
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-10">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">ROI Simulator</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
