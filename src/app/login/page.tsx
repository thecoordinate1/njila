
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, CheckCircle2Icon, RefreshCwIcon } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoginSuccess(false);
    
    // const { error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // if (error) {
    //   setError(error.message);
    //   setLoading(false);
    // } else {
    //   setLoginSuccess(true);
    //   setTimeout(() => {
    //     router.push('/');
    //     router.refresh(); // Important to refresh and trigger middleware/layout changes
    //   }, 1500); // Wait 1.5 seconds before redirecting
    // }
    // setLoading remains true during success state until redirect

    // Temp logic for UI testing without auth
    console.log("Simulating login...");
    setLoginSuccess(true);
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
              <Truck className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold ml-2">Ngila</h1>
          </div>
          <CardTitle className="text-2xl">Manager Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2" suppressHydrationWarning>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || loginSuccess}
              />
            </div>
            <div className="space-y-2" suppressHydrationWarning>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || loginSuccess}
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || loginSuccess}>
              {loginSuccess ? (
                <>
                  <CheckCircle2Icon className="mr-2 h-5 w-5" />
                  Success! Redirecting...
                </>
              ) : loading ? (
                <>
                  <RefreshCwIcon className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
