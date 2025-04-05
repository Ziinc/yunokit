import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { exchangeCodeForToken, storeTokens } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const SettingsSupabaseCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error || !code || !state) {
        toast({
          title: 'Connection failed',
          description: errorDescription || 'Failed to connect to Supabase',
          variant: 'destructive',
        });
        navigate('/settings/supabase');
        return;
      }

      try {
        const tokens = await exchangeCodeForToken(code, state);
        storeTokens(tokens);
        
        toast({
          title: 'Connected to Supabase',
          description: 'Your Supabase project has been connected successfully',
        });
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: 'Connection failed',
          description: error instanceof Error ? error.message : 'Failed to connect to Supabase',
          variant: 'destructive',
        });
      }

      navigate('/settings/supabase');
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Connecting to Supabase...</p>
      </div>
    </div>
  );
};

export default SettingsSupabaseCallback; 