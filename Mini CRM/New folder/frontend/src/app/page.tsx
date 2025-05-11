'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const checkGoogleScript = () => {
      if (window.google?.accounts?.id) {
        setIsGoogleScriptLoaded(true);
        initializeGoogleSignIn();
      }
    };

    // Check immediately
    checkGoogleScript();

    // Also check after a short delay to ensure script is loaded
    const timeoutId = setTimeout(checkGoogleScript, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const initializeGoogleSignIn = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            await signIn(response.credential);
            toast({
              title: "Success",
              description: "Successfully signed in with Google",
            });
          } catch (error) {
            console.error('Sign in failed:', error);
            toast({
              title: "Error",
              description: "Failed to sign in with Google",
              variant: "destructive",
            });
          }
        },
      });

      const buttonElement = document.getElementById('googleSignIn');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: 250,
        });
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      toast({
        title: "Error",
        description: "Failed to initialize Google Sign-In",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Mini CRM
          </CardTitle>
          <CardDescription className="text-base">
            A modern CRM platform with customer segmentation and campaign management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center">Key Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Customer Segmentation</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Campaign Management</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <p className="text-sm font-medium">AI-Powered Insights</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Real-time Analytics</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 pt-4">
            <div id="googleSignIn" className="w-full flex justify-center" />
            {!isGoogleScriptLoaded && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Loading Google Sign-In...
              </p>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Sign in with your Google account to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 