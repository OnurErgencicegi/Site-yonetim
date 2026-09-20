'use client';

import { useState } from 'react';
import { supabaseTarayici } from '@/lib/supabase/client';
import SiteForm from './steps/SiteForm';
import BlockForm from './steps/BlockForm';
import FloorForm from './steps/FloorForm';
import ApartmentForm from './steps/ApartmentForm';
import { OnboardingData } from '@/types/onboarding';

type Step = 'site' | 'blocks' | 'floors' | 'apartments';

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('site');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({
    bloks: [],
  });

  const handleSiteSubmit = (siteData: any) => {
    setData({
      ...data,
      siteName: siteData.siteName,
      il: siteData.il,
      ilce: siteData.ilce,
      adres: siteData.adres,
      bloks: Array.from({ length: siteData.blockCount }, () => ({
        name: '',
        floors: 0,
        apartments: [],
      })),
    });
    setCurrentStep('blocks');
  };

  const handleBlockSubmit = (blockData: any) => {
    const updatedBloks = data.bloks?.map((blok, idx) => ({
      ...blok,
      name: blockData.blocks[idx]?.name || blok.name,
    }));
    setData({ ...data, bloks: updatedBloks });
    setCurrentStep('floors');
  };

  const handleFloorSubmit = (floorData: any) => {
    const updatedBloks = data.bloks?.map((blok, idx) => ({
      ...blok,
      floors: floorData.floorData[idx]?.floorCount || blok.floors,
    }));
    setData({ ...data, bloks: updatedBloks });
    setCurrentStep('apartments');
  };

  const handleApartmentSubmit = async (apartmentData: any) => {
    const updatedBloks = data.bloks?.map((blok, blockIdx) => {
      const apartments: number[] = [];
      for (let floor = 1; floor <= blok.floors!; floor++) {
        const floorData = apartmentData.apartmentData.find(
          (a: any) =>
            a.blockName === blok.name && a.floorNumber === floor
        );
        apartments[floor - 1] = floorData?.apartmentCount || 2;
      }
      return { ...blok, apartments };
    });

    setData({ ...data, bloks: updatedBloks });
    await saveToDatabase(updatedBloks);
  };

  const saveToDatabase = async (bloks: any) => {
    setLoading(true);
    try {
      const supabase = supabaseTarayici();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      // Site oluştur
      const { data: siteData, error: siteError } = await supabase
        .from('siteler')
        .insert({
          ad: data.siteName,
          il: data.il,
          ilce: data.ilce,
          adres: data.adres,
          yonetici_id: user.id,
        })
        .select()
        .single();

      if (siteError) throw siteError;

      // Bloklar oluştur
      for (const blok of bloks) {
        const { data: blokData, error: blokError } = await supabase
          .from('bloklar')
          .insert({
            site_id: siteData.id,
            ad: blok.name,
          })
          .select()
          .single();

        if (blokError) throw blokError;

        // Katlar oluştur
        for (let floor = 1; floor <= blok.floors; floor++) {
          const { data: floorData, error: floorError } = await supabase
            .from('katlar')
            .insert({
              blok_id: blokData.id,
              kat_no: floor,
            })
            .select()
            .single();

          if (floorError) throw floorError;

          // Daireler oluştur
          const apartmentCount = blok.apartments[floor - 1] || 2;
          for (let apt = 1; apt <= apartmentCount; apt++) {
            await supabase.from('daireler').insert({
              kat_id: floorData.id,
              daire_no: `${floor}${apt}`,
              daire_tipi: 'daire',
              dolu_mu: false,
            });
          }
        }
      }

      alert('✅ Site başarıyla oluşturuldu!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Database error:', error);
      alert('❌ Hata: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span
              className={`text-sm font-semibold ${
                currentStep === 'site' ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              Site Bilgileri
            </span>
            <span
              className={`text-sm font-semibold ${
                currentStep === 'blocks' ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              Bloklar
            </span>
            <span
              className={`text-sm font-semibold ${
                currentStep === 'floors' ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              Katlar
            </span>
            <span
              className={`text-sm font-semibold ${
                currentStep === 'apartments'
                  ? 'text-green-400'
                  : 'text-gray-400'
              }`}
            >
              Daireler
            </span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{
                width:
                  currentStep === 'site'
                    ? '25%'
                    : currentStep === 'blocks'
                      ? '50%'
                      : currentStep === 'floors'
                        ? '75%'
                        : '100%',
              }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {currentStep === 'site' && (
            <SiteForm onSubmit={handleSiteSubmit} />
          )}
          {currentStep === 'blocks' && data.bloks && (
            <BlockForm
              blockCount={data.bloks.length}
              onSubmit={handleBlockSubmit}
              onBack={() => setCurrentStep('site')}
            />
          )}
          {currentStep === 'floors' && data.bloks && (
            <FloorForm
              blocks={data.bloks}
              onSubmit={handleFloorSubmit}
              onBack={() => setCurrentStep('blocks')}
            />
          )}
          {currentStep === 'apartments' && data.bloks && (
            <ApartmentForm
              blocks={data.bloks}
              onSubmit={handleApartmentSubmit}
              onBack={() => setCurrentStep('floors')}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}