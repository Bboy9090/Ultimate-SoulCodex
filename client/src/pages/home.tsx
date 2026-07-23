import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import { 
  Sun, 
  Infinity, 
  Shapes, 
  Crown, 
  ScrollText, 
  Sparkles,
  ChartPie,
  UserCog,
  Calculator,
  Globe,
  MapPin,
  HandMetal,
  FileText,
  UserCheck,
  CalendarDays,
  Star,
  Users,
  Shield,
  Play,
  CircleHelp,
  Eye,
  Smartphone,
  Download,
  Check
} from "lucide-react";

export default function Home() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navigation />
      
      {/* Hero Section */}
      <section className="cosmic-gradient min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Unlock Your
                <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text font-serif ml-3">
                  Complete Soul
                </span>
                <br />Profile
              </h1>
              <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
                Merge Western & Vedic astrology, Human Design, Gene Keys, Numerology, and 10+ mystical systems into your personalized Ultimate Soul Codex.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/create">
                  <Button className="cosmic-border mystical-glow bg-transparent border-0 p-0" data-testid="button-start-free-reading">
                    <div className="cosmic-border-inner px-8 py-4">
                      <span className="font-semibold">Start Free Reading</span>
                    </div>
                  </Button>
                </Link>
                <Button 
                  variant="secondary" 
                  className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Star className="text-accent h-4 w-4" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="text-accent h-4 w-4" />
                  <span>50K+ Profiles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="text-accent h-4 w-4" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>
            
            {/* App Preview */}
            <div className="relative">
              <div className="relative mx-auto w-80 h-96 bg-secondary rounded-3xl p-6 shadow-2xl mystical-glow">
                <div className="h-full bg-background rounded-2xl p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Your Soul Codex</h3>
                    <Crown className="text-accent h-5 w-5" />
                  </div>
                  
                  {/* Mock Profile Card */}
                  <div className="bg-secondary rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <Eye className="text-primary-foreground h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium">Mirror Alchemist</h4>
                        <p className="text-sm text-muted-foreground">Leo ☉ • Scorpio ☽ • Virgo ↑</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You transform through reflection, turning life's shadows into profound wisdom...
                    </p>
                  </div>
                  
                  {/* Mock Systems */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Life Path</span>
                      <span className="text-sm font-medium">7</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Enneagram</span>
                      <span className="text-sm font-medium">Type 4</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Human Design</span>
                      <span className="text-sm font-medium">Projector</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tier Showcase */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Your Journey
              <span className="text-primary font-serif ml-2">Free</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get your essential soul snapshot to experience the power of unified mystical systems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card bg-card border border-border">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Sun className="text-accent mx-auto mb-3 h-8 w-8" />
                  <h3 className="text-xl font-semibold mb-2">Astrology Big 3</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  Discover your Sun, Moon, and Rising signs with personalized interpretations
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-card border border-border">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Infinity className="text-accent mx-auto mb-3 h-8 w-8" />
                  <h3 className="text-xl font-semibold mb-2">Life Path Number</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  Your core numerological blueprint for life purpose and direction
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-card border border-border">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Shapes className="text-accent mx-auto mb-3 h-8 w-8" />
                  <h3 className="text-xl font-semibold mb-2">Enneagram Type</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  Your personality archetype with core motivations and patterns
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-card border border-border">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Crown className="text-accent mx-auto mb-3 h-8 w-8" />
                  <h3 className="text-xl font-semibold mb-2">Soul Archetype</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  Your unified mystical title synthesized from all systems
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-card border border-border">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <ScrollText className="text-accent mx-auto mb-3 h-8 w-8" />
                  <h3 className="text-xl font-semibold mb-2">Soul Biography</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  2-3 sentence essence of your spiritual profile and purpose
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-card border border-border">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Sparkles className="text-accent mx-auto mb-3 h-8 w-8" />
                  <h3 className="text-xl font-semibold mb-2">Daily Guidance</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  Personalized cosmic insights delivered to your inbox
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/create">
              <Button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity" data-testid="button-get-free-snapshot">
                Get Your Free Soul Snapshot
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Tier Features */}
      <section className="py-20 cosmic-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Unlock Your
              <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text font-serif ml-2">
                Complete Codex
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access the full depth of 12+ mystical systems unified into your comprehensive spiritual dossier
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">Complete System Integration</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <ChartPie className="text-primary mt-1 h-5 w-5" />
                  <div>
                    <h4 className="font-semibold mb-1">Full Astrology Charts</h4>
                    <p className="text-muted-foreground text-sm">Western & Vedic charts, all planets, houses, aspects, asteroids, and life cycles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <UserCog className="text-primary mt-1 h-5 w-5" />
                  <div>
                    <h4 className="font-semibold mb-1">Human Design & Gene Keys</h4>
                    <p className="text-muted-foreground text-sm">Complete bodygraph, 4 Gene Keys profile, Shadow→Gift→Siddhi spectrum</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calculator className="text-primary mt-1 h-5 w-5" />
                  <div>
                    <h4 className="font-semibold mb-1">Advanced Numerology</h4>
                    <p className="text-muted-foreground text-sm">Expression, Soul Urge, Personality numbers, Personal Year forecasts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="text-primary mt-1 h-5 w-5" />
                  <div>
                    <h4 className="font-semibold mb-1">Cultural Systems</h4>
                    <p className="text-muted-foreground text-sm">Chinese BaZi, Mayan Day Sign, Kabbalah Tree of Life, I Ching overlays</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glassmorphism rounded-lg p-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <MapPin className="text-accent mr-2 h-5 w-5" />
                  Astrocartography Map
                </h4>
                <p className="text-muted-foreground text-sm mb-3">
                  Discover your power places worldwide for love, career, healing, and transformation
                </p>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Interactive World Map</span>
                </div>
              </div>

              <div className="glassmorphism rounded-lg p-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <HandMetal className="text-accent mr-2 h-5 w-5" />
                  AI Palmistry Analysis
                </h4>
                <p className="text-muted-foreground text-sm">
                  Upload palm photos for computer vision analysis of life, heart, head, and fate lines
                </p>
              </div>
            </div>
          </div>

          {/* Premium Outputs */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-primary-foreground h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">Complete PDF Dossier</h4>
              <p className="text-muted-foreground text-sm">30-40 page comprehensive report with designer-grade mystical theming</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="text-primary-foreground h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">First-Person Bio</h4>
              <p className="text-muted-foreground text-sm">"Tell me about yourself" narratives for dating, work, and personal use</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="text-primary-foreground h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">Personalized Rituals</h4>
              <p className="text-muted-foreground text-sm">Daily and weekly practices based on your unique cosmic blueprint</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-xl text-muted-foreground">Start free, unlock your complete destiny when ready</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <Card className="bg-card border border-border p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Codex Snapshot</h3>
                <div className="text-4xl font-bold mb-2">Free</div>
                <p className="text-muted-foreground">Perfect to get started</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="text-primary h-4 w-4" />
                  <span>Astrology Big 3 (Sun, Moon, Rising)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary h-4 w-4" />
                  <span>Life Path Number calculation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary h-4 w-4" />
                  <span>Basic Enneagram Type</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary h-4 w-4" />
                  <span>One Soul Archetype title</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary h-4 w-4" />
                  <span>Short biographical summary</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary h-4 w-4" />
                  <span>Weekly cosmic insights</span>
                </li>
              </ul>
              
              <Link href="/create">
                <Button variant="secondary" className="w-full py-3 font-semibold" data-testid="button-start-free-reading-pricing">
                  Start Free Reading
                </Button>
              </Link>
            </Card>

            {/* Premium Tier */}
            <div className="cosmic-border mystical-glow">
              <Card className="cosmic-border-inner p-8 border-0">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold">Full Soul Codex</h3>
                    <Crown className="text-accent h-6 w-6" />
                  </div>
                  <div className="text-4xl font-bold mb-2">$47</div>
                  <p className="text-muted-foreground">One-time unlock</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span><strong>Everything in Free</strong></span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>Complete astrology charts (Western + Vedic)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>Full Human Design + Gene Keys</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>12+ mystical system integration</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>Astrocartography world map</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>AI palmistry analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>30-40 page PDF dossier</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>First-person bio generator</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-primary h-4 w-4" />
                    <span>Personalized rituals & practices</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-primary text-primary-foreground py-3 font-semibold" data-testid="button-unlock-complete-codex">
                  Unlock Complete Codex
                </Button>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Optional: Subscribe for $9/month for continuous forecasts, updates, and new mystical system integrations
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 cosmic-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your Journey to Self-Discovery</h2>
            <p className="text-xl text-muted-foreground">Four simple steps to unlock your complete spiritual profile</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Enter Birth Data</h3>
              <p className="text-muted-foreground">Provide your birth date, time, and location with precise timezone lookup</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Optional Enhancements</h3>
              <p className="text-muted-foreground">Upload palm photos and take our personality quiz for deeper insights</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Systems Integration</h3>
              <p className="text-muted-foreground">Our Archetype Engine unifies 12+ mystical systems into your unique profile</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Receive Your Codex</h3>
              <p className="text-muted-foreground">Get your interactive dashboard and beautifully designed PDF dossier</p>
            </div>
          </div>
        </div>
      </section>

      {/* Systems Showcase */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">12+ Mystical Systems United</h2>
            <p className="text-xl text-muted-foreground">The most comprehensive spiritual profile ever created</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: Sun, name: "Western Astrology" },
              { icon: Globe, name: "Vedic Astrology" },
              { icon: UserCog, name: "Human Design" },
              { icon: Crown, name: "Gene Keys" },
              { icon: Calculator, name: "Numerology" },
              { icon: Shapes, name: "Enneagram" },
              { icon: UserCheck, name: "MBTI" },
              { icon: Sparkles, name: "Chinese BaZi" },
              { icon: HandMetal, name: "Mayan System" },
              { icon: ScrollText, name: "Kabbalah" },
              { icon: Star, name: "Tarot Birth Cards" },
              { icon: Infinity, name: "I Ching" }
            ].map(({ icon: Icon, name }) => (
              <div key={name} className="glassmorphism rounded-lg p-4 text-center">
                <Icon className="text-accent mx-auto mb-2 h-8 w-8" />
                <h4 className="font-semibold text-sm">{name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 cosmic-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Discover Your
            <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text font-serif ml-2">
              True Self?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands who have unlocked their complete spiritual blueprint. Your journey to self-discovery starts with a single click.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button className="cosmic-border mystical-glow bg-transparent border-0 p-0" data-testid="button-start-free-reading-cta">
                <div className="cosmic-border-inner px-8 py-4">
                  <span className="font-semibold">Start Your Free Reading</span>
                </div>
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
              data-testid="button-learn-more"
            >
              <CircleHelp className="mr-2 h-4 w-4" />
              Learn More
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="text-accent h-4 w-4" />
              <span>100% Private & Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="text-accent h-4 w-4" />
              <span>Mobile & Web Apps</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="text-accent h-4 w-4" />
              <span>PDF Export Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="text-primary h-8 w-8" />
                <span className="text-xl font-bold">Ultimate Soul Codex</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                The most comprehensive spiritual profile generator, unifying 12+ mystical systems into your personalized soul blueprint.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/create" className="hover:text-foreground transition-colors">Free Reading</Link></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Premium Codex</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Access</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Ultimate Soul Codex. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.017 5.984a8.032 8.032 0 11-4.034 0 8.032 8.032 0 014.034 0zm-6.017 8.016a8 8 0 1012-6.928v1.856A6.048 6.048 0 016 14.048 6.048 6.048 0 016 14z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
