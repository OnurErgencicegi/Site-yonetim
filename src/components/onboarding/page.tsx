'use client';

import { useEffect } from 'react';
import { supabaseTarayici } from '@/lib/supabase/client';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = supabaseTarayici();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/giris';
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <OnboardingWizard />
    </div>
  );
}