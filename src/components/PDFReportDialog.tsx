import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";
import { z } from "zod";
import jsPDF from "jspdf";

interface PDFReportDialogProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  disabled?: boolean;
}

const emailSchema = z.string().email("Please enter a valid email address");

export function PDFReportDialog({
  inputs,
  results,
  disabled,
}: PDFReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setEmailError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
      return false;
    }
  };

  const generateReport = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsGenerating(true);
    try {
      // Store email capture
      const { error: emailError } = await supabase
        .from("email_captures")
        .insert({
          email,
          scenario_name: inputs.scenario_name || "Unnamed Scenario",
        });

      if (emailError) throw emailError;

      // Generate PDF
      const pdf = generatePDF();
      const scenarioName = inputs.scenario_name || "Unnamed_Scenario";
      pdf.save(`ROI_Report_${scenarioName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);

      toast.success("Report generated successfully", {
        description: "Your ROI report has been downloaded",
      });

      setOpen(false);
      setEmail("");
    } catch (error: any) {
      toast.error("Failed to generate report", {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = () => {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(value);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // Primary blue
    doc.text("ROI REPORT", pageWidth / 2, 25, { align: "center" });
    
    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: "center" });
    doc.text(`Scenario: ${inputs.scenario_name || "Unnamed Scenario"}`, pageWidth / 2, 42, { align: "center" });
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 48, pageWidth - 20, 48);
    
    // Section: Input Parameters
    let y = 58;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("INPUT PARAMETERS", 20, y);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    y += 10;
    doc.text(`Monthly Invoice Volume:`, 25, y);
    doc.text(`${inputs.monthly_invoice_volume.toLocaleString()}`, 100, y);
    y += 7;
    doc.text(`AP Staff:`, 25, y);
    doc.text(`${inputs.num_ap_staff}`, 100, y);
    y += 7;
    doc.text(`Hours per Invoice:`, 25, y);
    doc.text(`${inputs.avg_hours_per_invoice}`, 100, y);
    y += 7;
    doc.text(`Hourly Wage:`, 25, y);
    doc.text(`${formatCurrency(inputs.hourly_wage)}`, 100, y);
    y += 7;
    doc.text(`Manual Error Rate:`, 25, y);
    doc.text(`${inputs.error_rate_manual}%`, 100, y);
    y += 7;
    doc.text(`Error Cost:`, 25, y);
    doc.text(`${formatCurrency(inputs.error_cost)}`, 100, y);
    y += 7;
    doc.text(`Time Horizon:`, 25, y);
    doc.text(`${inputs.time_horizon_months} months`, 100, y);
    y += 7;
    doc.text(`Implementation Cost:`, 25, y);
    doc.text(`${formatCurrency(inputs.one_time_implementation_cost)}`, 100, y);
    
    // Divider
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    
    // Section: Results Summary
    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("RESULTS SUMMARY", 20, y);
    
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Green for positive results
    doc.text(`Monthly Savings:`, 25, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${formatCurrency(results.monthly_savings)}`, 100, y);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y += 10;
    doc.text(`Payback Period:`, 25, y);
    doc.text(`${results.payback_months} months`, 100, y);
    y += 7;
    doc.text(`ROI:`, 25, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(`${results.roi_percentage}%`, 100, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    y += 7;
    doc.text(`Cumulative Savings:`, 25, y);
    doc.text(`${formatCurrency(results.cumulative_savings)}`, 100, y);
    y += 7;
    doc.text(`Net Savings:`, 25, y);
    doc.setTextColor(16, 185, 129);
    doc.text(`${formatCurrency(results.net_savings)}`, 100, y);
    doc.setTextColor(60, 60, 60);
    
    // Divider
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    
    // Section: Cost Breakdown
    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("COST BREAKDOWN", 20, y);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    y += 10;
    doc.text(`Manual Labor Cost:`, 25, y);
    doc.text(`${formatCurrency(results.breakdown.manual_labor_cost)}/month`, 100, y);
    y += 7;
    doc.text(`Automation Cost:`, 25, y);
    doc.text(`${formatCurrency(results.breakdown.automation_cost)}/month`, 100, y);
    y += 7;
    doc.text(`Error Savings:`, 25, y);
    doc.text(`${formatCurrency(results.error_savings)}/month`, 100, y);
    y += 7;
    doc.text(`Monthly Net Savings:`, 25, y);
    doc.setTextColor(16, 185, 129);
    doc.text(`${formatCurrency(results.breakdown.monthly_net_savings)}`, 100, y);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Report generated by ROI Simulator", pageWidth / 2, 280, { align: "center" });
    doc.text(`Contact: ${email}`, pageWidth / 2, 285, { align: "center" });
    
    return doc;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="lg" className="px-6">
          <FileDown className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download ROI Report</DialogTitle>
          <DialogDescription>
            Enter your email to receive your detailed ROI analysis report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onBlur={validateEmail}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            We respect your privacy. Email used only for report delivery.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={generateReport}
            disabled={isGenerating || !email}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
