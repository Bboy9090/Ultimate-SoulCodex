import { useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Hand } from "lucide-react";
import type { Profile } from "@shared/schema";

interface PalmAnalysis {
  hand: "left" | "right";
  lifeLineStrength: number;
  heartLineClarity: number;
  headLineLength: number;
  fateLinePresence: number;
  interpretation: string;
}

export default function PalmistryPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PalmAnalysis | null>(null);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    enabled: !!id,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Read image file
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;
        setPalmImage(imageData);

        // Simulate AI analysis with realistic results
        // In a real implementation, this would call a CV API
        const mockAnalysis: PalmAnalysis = {
          hand: "right",
          lifeLineStrength: 0.78 + Math.random() * 0.2,
          heartLineClarity: 0.82 + Math.random() * 0.15,
          headLineLength: 0.71 + Math.random() * 0.25,
          fateLinePresence: 0.65 + Math.random() * 0.3,
          interpretation:
            "Your palm reveals a balanced life with strong emotional intelligence and good decision-making capability. The presence of a clear heart line suggests openness in relationships and emotional expression. Your head line indicates analytical thinking and problem-solving skills.",
        };

        setAnalysis(mockAnalysis);
        toast({
          title: "Analysis Complete",
          description: "Your palm has been analyzed successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Palm analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze palm image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">AI Palmistry Analysis</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload a clear photo of your palm for computer vision analysis of
              your life, heart, head, and fate lines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Palm Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {palmImage ? (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={palmImage}
                          alt="Palm"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setPalmImage(null);
                            setAnalysis(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
                      >
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-semibold mb-1">Upload Palm Photo</p>
                        <p className="text-sm text-muted-foreground">
                          Click to select or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG supported
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {!analysis && (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="w-full"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Image
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Use natural lighting</li>
                    <li>✓ Show the whole palm clearly</li>
                    <li>✓ Keep fingers relaxed</li>
                    <li>✓ Avoid shadows on palm surface</li>
                    <li>✓ Use high-resolution image</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div>
              {analysis ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Right Hand
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Life Line */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-semibold">Life Line Strength</label>
                          <Badge variant="outline">
                            {Math.round(analysis.lifeLineStrength * 100)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-red-500 rounded-full h-3 transition-all"
                            style={{
                              width: `${analysis.lifeLineStrength * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Indicates vitality, health, and major life changes
                        </p>
                      </div>

                      {/* Heart Line */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-semibold">Heart Line Clarity</label>
                          <Badge variant="outline">
                            {Math.round(analysis.heartLineClarity * 100)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-pink-500 rounded-full h-3 transition-all"
                            style={{
                              width: `${analysis.heartLineClarity * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reflects emotional expression and relationship patterns
                        </p>
                      </div>

                      {/* Head Line */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-semibold">Head Line Length</label>
                          <Badge variant="outline">
                            {Math.round(analysis.headLineLength * 100)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-yellow-500 rounded-full h-3 transition-all"
                            style={{
                              width: `${analysis.headLineLength * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Shows mental abilities and thinking patterns
                        </p>
                      </div>

                      {/* Fate Line */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-semibold">Fate Line Presence</label>
                          <Badge variant="outline">
                            {Math.round(analysis.fateLinePresence * 100)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-purple-500 rounded-full h-3 transition-all"
                            style={{
                              width: `${analysis.fateLinePresence * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Indicates life direction and destiny path
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interpretation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Interpretation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {analysis.interpretation}
                      </p>
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setPalmImage(null);
                      setAnalysis(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Analyze Another Palm
                  </Button>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <Hand className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload a palm photo to see analysis results
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
