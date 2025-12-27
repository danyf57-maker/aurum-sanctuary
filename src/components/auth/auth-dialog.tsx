'use client';

import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, sendPasswordlessLink } from '@/lib/firebase/auth';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.512-11.024-8.294l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.218,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState< 'google' | 'email' | false>(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Sign-in Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');
    const { success, error } = await sendPasswordlessLink(email);
    if (success) {
      setEmailSent(true);
      toast({
        title: 'Check your inbox',
        description: `A sign-in link has been sent to ${email}.`,
      });
    }
    if (error) {
       toast({
        title: 'Error sending link',
        description: error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">Enter the Sanctuary</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to preserve your golden thoughts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={!!isLoading}
          >
            {isLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2" />}
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-popover px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
            <form onSubmit={handleEmailSignIn}>
              <div className="grid gap-2">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!isLoading || emailSent}
                />
                <Button type="submit" disabled={!!isLoading || emailSent}>
                  {isLoading === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {emailSent ? 'Link Sent!' : 'Send Sign-in Link'}
                </Button>
              </div>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
