import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { birthDataSchema, type BirthData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Clock, Calendar, User } from "lucide-react";

export default function InputForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<BirthData>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      birthTime: "",
      birthLocation: "",
      timezone: "",
      latitude: "",
      longitude: ""
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: BirthData) => {
      const response = await apiRequest("POST", "/api/profiles", data);
      return response.json();
    },
    onSuccess: (profile) => {
      toast({
        title: "Soul Profile Created!",
        description: "Your cosmic blueprint has been generated successfully.",
      });
      setLocation(`/profile/${profile.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create your soul profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile creation error:", error);
    }
  });

  const handleLocationLookup = async () => {
    const location = form.getValues("birthLocation");
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enter a birth location first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First try our built-in location database
      let locationData = getLocationData(location);
      
      // If not found in our database, try using Nominatim (OpenStreetMap's free geocoding service)
      if (!locationData) {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`;
        
        const response = await fetch(nominatimUrl);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          locationData = {
            lat: result.lat,
            lng: result.lon,
            timezone: getTimezoneFromCoordinates(parseFloat(result.lat), parseFloat(result.lon))
          };
        }
      }
      
      if (locationData) {
        form.setValue("latitude", locationData.lat);
        form.setValue("longitude", locationData.lng);
        form.setValue("timezone", locationData.timezone);
        
        toast({
          title: "Location Found",
          description: `Coordinates automatically set for ${location}`,
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Please try a more specific location (e.g., 'New York, NY, USA' or 'London, UK')",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Location lookup error:", error);
      toast({
        title: "Lookup Failed",
        description: "Unable to lookup location. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: BirthData) => {
    createProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Create Your
              <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text font-serif ml-2">
                Soul Codex
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter your birth information to unlock your cosmic blueprint
            </p>
          </div>

          <Card className="cosmic-border mystical-glow bg-transparent border-0">
            <div className="cosmic-border-inner">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Birth Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Full Name</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your full name" 
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Birth Date</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date" 
                                data-testid="input-birth-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birthTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Birth Time</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="time" 
                                placeholder="HH:MM"
                                data-testid="input-birth-time"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="birthLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Birth Location</span>
                          </FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="City, State/Province, Country" 
                                className="flex-1"
                                data-testid="input-birth-location"
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleLocationLookup}
                              data-testid="button-location-lookup"
                            >
                              Lookup
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Hidden coordinate fields - automatically filled by location lookup */}
                    <div className="hidden">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} data-testid="input-latitude" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} data-testid="input-longitude" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} data-testid="input-timezone" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Show coordinate info if available */}
                    {form.watch("latitude") && form.watch("longitude") && (
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        <p className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            Location confirmed: {form.watch("latitude")}, {form.watch("longitude")} 
                            ({form.watch("timezone")})
                          </span>
                        </p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground py-3 font-semibold"
                      disabled={createProfileMutation.isPending}
                      data-testid="button-create-profile"
                    >
                      {createProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generate My Soul Codex
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Your birth information is used only to calculate your astrological and numerological profile. 
              All data is processed securely and privately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get timezone from coordinates (simplified)
function getTimezoneFromCoordinates(lat: number, lng: number): string {
  // This is a simplified timezone lookup. In production, use a proper timezone API
  if (lng >= -180 && lng < -150) return "America/Anchorage";
  if (lng >= -150 && lng < -120) return "America/Los_Angeles";
  if (lng >= -120 && lng < -105) return "America/Denver";
  if (lng >= -105 && lng < -75) return "America/Chicago";
  if (lng >= -75 && lng < -60) return "America/New_York";
  if (lng >= -60 && lng < -30) return "America/Sao_Paulo";
  if (lng >= -30 && lng < 0) return "Europe/London";
  if (lng >= 0 && lng < 30) return "Europe/Berlin";
  if (lng >= 30 && lng < 60) return "Asia/Dubai";
  if (lng >= 60 && lng < 90) return "Asia/Kolkata";
  if (lng >= 90 && lng < 120) return "Asia/Shanghai";
  if (lng >= 120 && lng < 150) return "Asia/Tokyo";
  if (lng >= 150 && lng < 180) return "Australia/Sydney";
  return "UTC";
}

// Enhanced location database with more cities
function getLocationData(location: string): { lat: string; lng: string; timezone: string } | null {
  const locations: { [key: string]: { lat: string; lng: string; timezone: string } } = {
    // Major US Cities
    "new york": { lat: "40.7128", lng: "-74.0060", timezone: "America/New_York" },
    "los angeles": { lat: "34.0522", lng: "-118.2437", timezone: "America/Los_Angeles" },
    "chicago": { lat: "41.8781", lng: "-87.6298", timezone: "America/Chicago" },
    "houston": { lat: "29.7604", lng: "-95.3698", timezone: "America/Chicago" },
    "phoenix": { lat: "33.4484", lng: "-112.0740", timezone: "America/Phoenix" },
    "philadelphia": { lat: "39.9526", lng: "-75.1652", timezone: "America/New_York" },
    "san antonio": { lat: "29.4241", lng: "-98.4936", timezone: "America/Chicago" },
    "san diego": { lat: "32.7157", lng: "-117.1611", timezone: "America/Los_Angeles" },
    "dallas": { lat: "32.7767", lng: "-96.7970", timezone: "America/Chicago" },
    "san francisco": { lat: "37.7749", lng: "-122.4194", timezone: "America/Los_Angeles" },
    "austin": { lat: "30.2672", lng: "-97.7431", timezone: "America/Chicago" },
    "denver": { lat: "39.7392", lng: "-104.9903", timezone: "America/Denver" },
    "seattle": { lat: "47.6062", lng: "-122.3321", timezone: "America/Los_Angeles" },
    "miami": { lat: "25.7617", lng: "-80.1918", timezone: "America/New_York" },
    "las vegas": { lat: "36.1699", lng: "-115.1398", timezone: "America/Los_Angeles" },
    
    // Canadian Cities
    "toronto": { lat: "43.6532", lng: "-79.3832", timezone: "America/Toronto" },
    "vancouver": { lat: "49.2827", lng: "-123.1207", timezone: "America/Vancouver" },
    "montreal": { lat: "45.5017", lng: "-73.5673", timezone: "America/Toronto" },
    "calgary": { lat: "51.0447", lng: "-114.0719", timezone: "America/Edmonton" },
    "ottawa": { lat: "45.4215", lng: "-75.6972", timezone: "America/Toronto" },
    
    // European Cities
    "london": { lat: "51.5074", lng: "-0.1278", timezone: "Europe/London" },
    "paris": { lat: "48.8566", lng: "2.3522", timezone: "Europe/Paris" },
    "berlin": { lat: "52.5200", lng: "13.4050", timezone: "Europe/Berlin" },
    "madrid": { lat: "40.4168", lng: "-3.7038", timezone: "Europe/Madrid" },
    "rome": { lat: "41.9028", lng: "12.4964", timezone: "Europe/Rome" },
    "amsterdam": { lat: "52.3676", lng: "4.9041", timezone: "Europe/Amsterdam" },
    "zurich": { lat: "47.3769", lng: "8.5417", timezone: "Europe/Zurich" },
    "stockholm": { lat: "59.3293", lng: "18.0686", timezone: "Europe/Stockholm" },
    "vienna": { lat: "48.2082", lng: "16.3738", timezone: "Europe/Vienna" },
    "barcelona": { lat: "41.3851", lng: "2.1734", timezone: "Europe/Madrid" },
    
    // Asian Cities
    "tokyo": { lat: "35.6762", lng: "139.6503", timezone: "Asia/Tokyo" },
    "mumbai": { lat: "19.0760", lng: "72.8777", timezone: "Asia/Kolkata" },
    "delhi": { lat: "28.7041", lng: "77.1025", timezone: "Asia/Kolkata" },
    "beijing": { lat: "39.9042", lng: "116.4074", timezone: "Asia/Shanghai" },
    "shanghai": { lat: "31.2304", lng: "121.4737", timezone: "Asia/Shanghai" },
    "singapore": { lat: "1.3521", lng: "103.8198", timezone: "Asia/Singapore" },
    "hong kong": { lat: "22.3193", lng: "114.1694", timezone: "Asia/Hong_Kong" },
    "seoul": { lat: "37.5665", lng: "126.9780", timezone: "Asia/Seoul" },
    "bangkok": { lat: "13.7563", lng: "100.5018", timezone: "Asia/Bangkok" },
    "manila": { lat: "14.5995", lng: "120.9842", timezone: "Asia/Manila" },
    
    // Australian Cities
    "sydney": { lat: "-33.8688", lng: "151.2093", timezone: "Australia/Sydney" },
    "melbourne": { lat: "-37.8136", lng: "144.9631", timezone: "Australia/Melbourne" },
    "brisbane": { lat: "-27.4698", lng: "153.0251", timezone: "Australia/Brisbane" },
    "perth": { lat: "-31.9505", lng: "115.8605", timezone: "Australia/Perth" },
    
    // Other Major Cities
    "cape town": { lat: "-33.9249", lng: "18.4241", timezone: "Africa/Johannesburg" },
    "johannesburg": { lat: "-26.2041", lng: "28.0473", timezone: "Africa/Johannesburg" },
    "cairo": { lat: "30.0444", lng: "31.2357", timezone: "Africa/Cairo" },
    "mexico city": { lat: "19.4326", lng: "-99.1332", timezone: "America/Mexico_City" },
    "sao paulo": { lat: "-23.5505", lng: "-46.6333", timezone: "America/Sao_Paulo" },
    "rio de janeiro": { lat: "-22.9068", lng: "-43.1729", timezone: "America/Sao_Paulo" },
    "buenos aires": { lat: "-34.6118", lng: "-58.3960", timezone: "America/Argentina/Buenos_Aires" },
    "moscow": { lat: "55.7558", lng: "37.6176", timezone: "Europe/Moscow" },
    "istanbul": { lat: "41.0082", lng: "28.9784", timezone: "Europe/Istanbul" },
    "dubai": { lat: "25.2048", lng: "55.2708", timezone: "Asia/Dubai" }
  };

  const key = location.toLowerCase();
  for (const [city, data] of Object.entries(locations)) {
    if (key.includes(city)) {
      return data;
    }
  }
  return null;
}
