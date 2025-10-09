import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Scenario, CalculatorInputs, CalculationResults } from "@/types/calculator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Trash2, FolderOpen } from "lucide-react";

interface ScenarioManagerProps {
  currentInputs: CalculatorInputs;
  currentResults: CalculationResults | null;
  onLoadScenario: (scenario: Scenario) => void;
}

export function ScenarioManager({
  currentInputs,
  currentResults,
  onLoadScenario,
}: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScenarios((data || []) as unknown as Scenario[]);
    } catch (error: any) {
      toast.error("Failed to load scenarios", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveScenario = async () => {
    if (!currentResults) {
      toast.error("Please calculate ROI before saving");
      return;
    }

    setIsSaving(true);
    try {
      const scenarioName =
        currentInputs.scenario_name ||
        `Scenario ${new Date().toLocaleDateString()}`;

      const { data, error } = await supabase
        .from("scenarios")
        .insert({
          name: scenarioName,
          inputs: currentInputs as any,
          results: currentResults as any,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Scenario saved successfully", {
        description: `"${scenarioName}" has been saved`,
      });

      await loadScenarios();
    } catch (error: any) {
      toast.error("Failed to save scenario", {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteScenario = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scenarios")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Scenario deleted successfully");
      setScenarios(scenarios.filter((s) => s.id !== id));
      if (selectedScenarioId === id) {
        setSelectedScenarioId("");
      }
    } catch (error: any) {
      toast.error("Failed to delete scenario", {
        description: error.message,
      });
    }
  };

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      onLoadScenario(scenario);
      toast.success("Scenario loaded", {
        description: `"${scenario.name}" has been loaded`,
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setScenarioToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scenarioToDelete) {
      deleteScenario(scenarioToDelete);
    }
    setDeleteDialogOpen(false);
    setScenarioToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={selectedScenarioId} onValueChange={handleLoadScenario}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Load a saved scenario" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : scenarios.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No saved scenarios
              </div>
            ) : (
              scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name} (
                  {new Date(scenario.created_at).toLocaleDateString()})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          onClick={saveScenario}
          disabled={isSaving || !currentResults}
          size="icon"
          variant="outline"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>

      {scenarios.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Saved Scenarios</h3>
          <div className="space-y-1">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-2 rounded-md border bg-card text-card-foreground"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Monthly Savings:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(scenario.results.monthly_savings)}{" "}
                    | ROI: {scenario.results.roi_percentage}%
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLoadScenario(scenario.id)}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClick(scenario.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              scenario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
