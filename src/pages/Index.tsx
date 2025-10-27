import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Sparkles, User, Shield, Zap } from "lucide-react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-secondary opacity-20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-glow" />
        </div>

        <div className="relative text-center space-y-8 max-w-4xl mx-auto px-4 animate-fade-in">
          {/* Hero icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-primary shadow-glow animate-float">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Welcome to Your App
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the power of modern authentication with a beautiful, secure platform
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105">
              <Shield className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade security for your data</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105">
              <Zap className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Fast</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast performance</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105">
              <User className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Personal</h3>
              <p className="text-sm text-muted-foreground">Tailored to your needs</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="h-14 px-8 text-lg bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow text-white font-medium"
          >
            Get Started
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-secondary opacity-20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative text-center space-y-8 max-w-2xl mx-auto px-4 animate-scale-in">
        {/* User avatar */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-primary shadow-glow">
            <User className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Welcome message */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-soft">
            <p className="text-lg text-muted-foreground mb-2">You are logged in as</p>
            <p className="text-2xl font-semibold text-foreground">{user.email}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleLogout}
            className="h-12 px-6 border-2 hover:bg-destructive hover:text-white hover:border-destructive transition-all"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
