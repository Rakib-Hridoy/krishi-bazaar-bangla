import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 border-primary shadow-lg z-50 bg-background">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            অ্যাপ ইনস্টল করুন
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            দ্রুত অ্যাক্সেস এবং অফলাইন ব্যবহারের জন্য AgroBid বাংলা অ্যাপটি ইনস্টল করুন।
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={installApp}
              size="sm" 
              className="flex-1 h-8 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              ইনস্টল করুন
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
};

export default PWAInstallPrompt;