import { useState } from "react";
import { Link } from "wouter";
import { Download, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NatalReportDownloadButtonProps {
  profileId: string;
  profileName: string;
  isPremium: boolean;
}

function fallbackFilename(name: string): string {
  const stem = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9 _-]+/g, "")
    .trim()
    .replace(/[ _-]+/g, "_")
    .slice(0, 72) || "Soul_Codex";
  return `${stem}_Natal_Chart_Report.pdf`;
}

export default function NatalReportDownloadButton({
  profileId,
  profileName,
  isPremium,
}: NatalReportDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  if (!isPremium) {
    return (
      <Link href="/pricing" className="sc-button-secondary inline-flex items-center gap-2">
        <LockKeyhole className="h-4 w-4" />
        Unlock elegant PDF report
      </Link>
    );
  }

  const downloadReport = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const response = await fetch(`/api/pdf/profile/${encodeURIComponent(profileId)}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/pdf" },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.message === "string"
          ? payload.message
          : `Report generation failed with status ${response.status}.`;
        throw new Error(message);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/pdf")) {
        throw new Error("The report endpoint did not return a PDF.");
      }

      const blob = await response.blob();
      const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      const signature = String.fromCharCode(...bytes);
      if (signature !== "%PDF") {
        throw new Error("The report response failed the PDF signature check.");
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fallbackFilename(profileName);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      toast({
        title: "Natal report created",
        description: "Your Soul Codex PDF was generated from the evidence currently verified for this profile.",
      });
    } catch (error) {
      toast({
        title: "PDF could not be created",
        description: error instanceof Error ? error.message : "Unknown report error",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={downloadReport}
      disabled={downloading}
      className="sc-button-secondary inline-flex items-center gap-2"
      data-testid="button-download-natal-report"
    >
      {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {downloading ? "Creating elegant PDF…" : "Download natal chart PDF"}
    </Button>
  );
}
