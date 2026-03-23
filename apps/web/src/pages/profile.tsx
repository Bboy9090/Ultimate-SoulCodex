import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import CosmicChart from "../components/cosmic-chart";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Sun, 
  Moon, 
  Star, 
  Infinity, 
  Brain, 
  Heart,
  ChartPie,
  ScrollText,
  Sparkles,
  ArrowLeft,
  Download,
  Zap,
  Target,
  Shield,
  Compass,
  BookOpen,
  Calendar
} from "lucide-react";
import type { Profile } from "@shared/schema";

export default function ProfilePage() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating your cosmic blueprint...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The soul profile you're looking for doesn't exist or couldn't be loaded.
              </p>
              <Link href="/">
                <Button>Return Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const astrologyData = profile.astrologyData as any;
  const numerologyData = profile.numerologyData as any;
  const personalityData = profile.personalityData as any;
  const archetypeData = profile.archetypeData as any;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {profile.name}'s
                <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text font-serif ml-2">
                  Soul Codex
                </span>
              </h1>
              <p className="text-muted-foreground">
                Generated on {new Date(profile.createdAt!).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Archetype Hero Card */}
          <Card className="cosmic-border mystical-glow bg-transparent border-0 mb-8">
            <div className="cosmic-border-inner">
              <CardContent className="p-8">
                <div className="text-center">
                  <Crown className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-archetype-title">
                    {archetypeData?.title || "Cosmic Soul"}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto" data-testid="text-archetype-description">
                    {archetypeData?.description || "Your unique spiritual essence is being revealed..."}
                  </p>
                  
                  {/* Astrology Big 3 */}
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4 text-accent" />
                      <span data-testid="text-sun-sign">{astrologyData?.sunSign || "Unknown"} ☉</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4 text-accent" />
                      <span data-testid="text-moon-sign">{astrologyData?.moonSign || "Unknown"} ☽</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-accent" />
                      <span data-testid="text-rising-sign">{astrologyData?.risingSign || "Unknown"} ↑</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Biography Card */}
          {profile.biography && (
            <Card className="glassmorphism mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ScrollText className="h-5 w-5 text-primary" />
                  <span>Your Soul Biography</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed" data-testid="text-biography">
                  {profile.biography}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="astrology" data-testid="tab-astrology">Astrology</TabsTrigger>
              <TabsTrigger value="numerology" data-testid="tab-numerology">Numerology</TabsTrigger>
              <TabsTrigger value="personality" data-testid="tab-personality">Personality</TabsTrigger>
              <TabsTrigger value="guidance" data-testid="tab-guidance">Guidance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Core Numbers */}
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Infinity className="h-5 w-5 text-primary" />
                      <span>Core Numbers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Life Path</span>
                      <Badge variant="secondary" data-testid="text-life-path">
                        {numerologyData?.lifePath || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Expression</span>
                      <Badge variant="secondary" data-testid="text-expression">
                        {numerologyData?.expression || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Soul Urge</span>
                      <Badge variant="secondary" data-testid="text-soul-urge">
                        {numerologyData?.soulUrge || "Unknown"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Personality Types */}
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span>Personality</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Enneagram</span>
                      <Badge variant="secondary" data-testid="text-enneagram">
                        {personalityData?.enneagram?.type ? `Type ${personalityData.enneagram.type}` : "Take Assessment"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>MBTI</span>
                      <Badge variant="secondary" data-testid="text-mbti">
                        {personalityData?.mbti?.type || "Take Assessment"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Tarot Birth Cards */}
                {archetypeData?.tarotCards && (
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span>Tarot Birth Cards</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="font-medium text-sm mb-1">Primary Cards</div>
                        <div className="text-accent font-semibold" data-testid="text-tarot-cards">
                          {archetypeData.tarotCards.card1} • {archetypeData.tarotCards.card2}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground" data-testid="text-tarot-interpretation">
                        {archetypeData.tarotCards.interpretation}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Archetype Details */}
              {archetypeData && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span>Strengths & Gifts</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {archetypeData.strengths?.map((strength: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span>Growth Areas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {archetypeData.shadows?.map((shadow: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                            <span>{shadow}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Astrology Tab */}
            <TabsContent value="astrology" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ChartPie className="h-5 w-5 text-primary" />
                      <span>Birth Chart</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CosmicChart 
                      astrologyData={astrologyData}
                      size={300}
                    />
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {/* Planetary Positions */}
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Planetary Positions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {astrologyData?.planets && Object.entries(astrologyData.planets).map(([planet, data]: [string, any]) => (
                        <div key={planet} className="flex justify-between items-center">
                          <span className="capitalize">{planet}</span>
                          <Badge variant="outline" data-testid={`text-planet-${planet}`}>
                            {data.sign} {data.house}H
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Nodes & Chiron */}
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Karmic Points</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>North Node</span>
                        <Badge variant="outline" data-testid="text-north-node">
                          {astrologyData?.northNode?.sign} {astrologyData?.northNode?.house}H
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>South Node</span>
                        <Badge variant="outline" data-testid="text-south-node">
                          {astrologyData?.southNode?.sign} {astrologyData?.southNode?.house}H
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Chiron</span>
                        <Badge variant="outline" data-testid="text-chiron">
                          {astrologyData?.chiron?.sign} {astrologyData?.chiron?.house}H
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Numerology Tab */}
            <TabsContent value="numerology" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Core Numbers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Life Path Number</span>
                          <Badge className="bg-primary text-primary-foreground">
                            {numerologyData?.lifePath}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid="text-life-path-interpretation">
                          {numerologyData?.interpretations?.lifePath}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Expression Number</span>
                          <Badge variant="secondary">
                            {numerologyData?.expression}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid="text-expression-interpretation">
                          {numerologyData?.interpretations?.expression}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Soul & Personality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Soul Urge</span>
                          <Badge variant="secondary">
                            {numerologyData?.soulUrge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid="text-soul-urge-interpretation">
                          {numerologyData?.interpretations?.soulUrge}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Personality Number</span>
                          <Badge variant="secondary">
                            {numerologyData?.personality}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid="text-personality-interpretation">
                          {numerologyData?.interpretations?.personality}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Current Year Cycle</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="font-medium">Personal Year</span>
                    <Badge className="bg-accent text-accent-foreground">
                      {numerologyData?.personalYear}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground" data-testid="text-personal-year-interpretation">
                    {numerologyData?.interpretations?.personalYear}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Enneagram */}
                {personalityData?.enneagram ? (
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-primary" />
                        <span>Enneagram Type {personalityData.enneagram.type}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm" data-testid="text-enneagram-description">
                        {personalityData.enneagram.description}
                      </p>
                      <div>
                        <h4 className="font-medium mb-2">Core Motivation</h4>
                        <p className="text-sm text-muted-foreground" data-testid="text-enneagram-motivation">
                          {personalityData.enneagram.motivation}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Basic Fear</h4>
                        <p className="text-sm text-muted-foreground" data-testid="text-enneagram-fear">
                          {personalityData.enneagram.fear}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>Enneagram Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Complete the Enneagram assessment to unlock deeper personality insights.
                      </p>
                      <Button variant="outline" data-testid="button-take-enneagram">
                        Take Assessment
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* MBTI */}
                {personalityData?.mbti ? (
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <span>MBTI - {personalityData.mbti.type}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm" data-testid="text-mbti-description">
                        {personalityData.mbti.description}
                      </p>
                      <div>
                        <h4 className="font-medium mb-2">Cognitive Functions</h4>
                        <div className="flex flex-wrap gap-2">
                          {personalityData.mbti.functions?.map((func: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>MBTI Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Complete the MBTI assessment to discover your cognitive preferences.
                      </p>
                      <Button variant="outline" data-testid="button-take-mbti">
                        Take Assessment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Guidance Tab */}
            <TabsContent value="guidance" className="space-y-6">
              {/* Daily Guidance */}
              {profile.dailyGuidance && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Compass className="h-5 w-5 text-primary" />
                      <span>Today's Cosmic Guidance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed" data-testid="text-daily-guidance">
                      {profile.dailyGuidance}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Archetype Guidance */}
              {archetypeData?.guidance && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span>Your Soul Path Guidance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed" data-testid="text-archetype-guidance">
                      {archetypeData.guidance}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Upgrade to Premium */}
              {!profile.isPremium && (
                <Card className="cosmic-border mystical-glow bg-transparent border-0">
                  <div className="cosmic-border-inner">
                    <CardContent className="p-8 text-center">
                      <Crown className="h-12 w-12 text-accent mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-4">Unlock Your Complete Codex</h3>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Access your full 30-40 page PDF dossier, astrocartography map, palmistry analysis, 
                        and 12+ additional mystical systems for deeper self-understanding.
                      </p>
                      <Button className="bg-primary text-primary-foreground px-8 py-3 font-semibold" data-testid="button-upgrade-premium">
                        Upgrade to Premium - $47
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" data-testid="button-share-profile">
              <Star className="mr-2 h-4 w-4" />
              Share Profile
            </Button>
            <Button variant="outline" data-testid="button-download-pdf">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            {!profile.isPremium && (
              <Button className="bg-primary text-primary-foreground" data-testid="button-upgrade-main">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
