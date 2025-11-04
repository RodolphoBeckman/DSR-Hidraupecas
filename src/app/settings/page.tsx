"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Save } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { AppSettings } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', { pixQrCode: null });
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

  const qrPlaceholder = PlaceHolderImages.find(p => p.id === 'pix-qr-code')!;

  useEffect(() => {
    setQrCodePreview(settings.pixQrCode);
  }, [settings.pixQrCode]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSettings({ pixQrCode: qrCodePreview });
    toast({
      title: 'Settings Saved',
      description: 'Your PIX QR Code has been updated successfully.',
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Settings" />
      <Card>
        <CardHeader>
          <CardTitle>PIX Payment</CardTitle>
          <CardDescription>
            Upload your PIX QR Code image here. It will be displayed on the generated PDF budgets.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full space-y-2">
            <Label htmlFor="qr-code-upload">QR Code Image</Label>
            <div className="flex items-center gap-2">
              <Input id="qr-code-upload" type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
              <Button size="icon" className="md:hidden" asChild>
                <label htmlFor="qr-code-upload"><Upload className="h-4 w-4" /></label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a square image for best results.
            </p>
          </div>
          <div className="flex-shrink-0">
            <p className="text-sm font-medium mb-2 text-center">Image Preview</p>
            <div className="w-40 h-40 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
              <Image
                src={qrCodePreview || qrPlaceholder.imageUrl}
                alt="PIX QR Code Preview"
                width={160}
                height={160}
                className="object-contain"
                data-ai-hint={qrPlaceholder.imageHint}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
