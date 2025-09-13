
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, SaveIcon, RefreshCwIcon, UserCircle2, Truck, ShieldAlertIcon } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';

interface ProfileFormData {
  full_name: string;
  phone: string;
  vehicle_model: string;
  license_plate: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const EditProfilePage = () => {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    vehicle_model: '',
    license_plate: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile for edit:", error);
          setError("Failed to load your profile data.");
        } else if (data) {
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            vehicle_model: data.vehicle_model || '',
            license_plate: data.license_plate || '',
            emergency_contact_name: data.emergency_contact_name || '',
            emergency_contact_phone: data.emergency_contact_phone || '',
          });
        }
      } else {
        router.push('/login'); // Redirect if not logged in
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error: updateError } = await supabase
        .from('drivers')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          vehicle_model: formData.vehicle_model,
          license_plate: formData.license_plate,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Error updating profile:", updateError);
        setError(`Failed to save changes: ${updateError.message}`);
      } else {
        router.push('/profile');
        router.refresh(); // Refresh the profile page to show new data
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCwIcon className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
        <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
            </div>
        </header>
        <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-20">
            <form onSubmit={handleSaveChanges} className="w-full max-w-2xl space-y-6">
                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                           <UserCircle2 className="mr-3 h-6 w-6 text-primary" />
                           Personal Information
                        </CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" value={formData.full_name} onChange={handleInputChange} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="e.g., +260 977 123456" />
                        </div>
                    </CardContent>
                </Card>

                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                           <Truck className="mr-3 h-6 w-6 text-primary" />
                           Vehicle Details
                        </CardTitle>
                        <CardDescription>Keep your vehicle information up to date.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="vehicle_model">Vehicle Model</Label>
                            <Input id="vehicle_model" value={formData.vehicle_model} onChange={handleInputChange} placeholder="e.g., Toyota Corolla 2021"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="license_plate">License Plate</Label>
                            <Input id="license_plate" value={formData.license_plate} onChange={handleInputChange} placeholder="e.g., ALE 1234"/>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                           <ShieldAlertIcon className="mr-3 h-6 w-6 text-primary" />
                           Emergency Contact
                        </CardTitle>
                        <CardDescription>This information will be used only in case of an emergency.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_name">Contact Name</Label>
                            <Input id="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                            <Input id="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                </Card>
                
                {error && <p className="text-sm text-center text-red-500">{error}</p>}
                
                <div className="sticky bottom-20 z-10 mt-6 md:relative md:bottom-auto">
                   <Button type="submit" size="lg" className="w-full" disabled={saving}>
                       {saving ? <RefreshCwIcon className="mr-2 h-5 w-5 animate-spin" /> : <SaveIcon className="mr-2 h-5 w-5" />}
                       {saving ? 'Saving...' : 'Save Changes'}
                   </Button>
                </div>
            </form>
        </main>
        <BottomNavbar />
    </div>
  );
};

export default EditProfilePage;
