
'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { runIdVerification } from '@/lib/actions';
import { updateUserStatus } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type VerificationCardProps = {
  user: User;
  onStatusChange: (userId: string, status: 'approved' | 'rejected') => void;
};

export function VerificationCard({ user, onStatusChange }: VerificationCardProps) {
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleAiVerification = async () => {
    setIsVerifying(true);
    setAiError(null);
    setAiResult(null);

    const result = await runIdVerification({
      idCardImage: user.idCardImageURL,
      fullName: user.fullName,
      usn: user.usn,
    });
    
    if (result.success) {
      setAiResult(result.data.verificationResult);
    } else {
      setAiError(result.error);
    }
    setIsVerifying(false);
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    await updateUserStatus(user.userId, status);
    onStatusChange(user.userId, status);
    toast({
        title: `User ${status}`,
        description: `${user.fullName} has been ${status}.`
    });
    setIsUpdating(false);
  }

  const getStatusBadge = (status: User['verificationStatus']) => {
    switch(status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>{user.fullName}</CardTitle>
            {getStatusBadge(user.verificationStatus)}
        </div>
        <CardDescription>USN: {user.usn}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={user.idCardImageURL}
            alt={`ID Card for ${user.fullName}`}
            fill
            className="object-contain"
            data-ai-hint="id card"
            unoptimized
          />
        </div>
        {aiResult && (
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>AI Verification Result</AlertTitle>
                <AlertDescription>{aiResult}</AlertDescription>
            </Alert>
        )}
        {aiError && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>AI Verification Error</AlertTitle>
                <AlertDescription>{aiError}</AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={handleAiVerification} disabled={isVerifying || isUpdating}>
          {isVerifying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          AI Check
        </Button>
        <Button variant="destructive" onClick={() => handleUpdateStatus('rejected')} disabled={isUpdating}>
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
        <Button onClick={() => handleUpdateStatus('approved')} disabled={isUpdating}>
          <Check className="mr-2 h-4 w-4" /> Approve
        </Button>
      </CardFooter>
    </Card>
  );
}
