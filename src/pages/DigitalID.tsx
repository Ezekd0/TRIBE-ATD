import React, { useRef, useState } from 'react';
import { Download, Share2, CreditCard, Repeat, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MemberCard from '../components/MemberCard';
import { toPng } from 'html-to-image';

const DigitalID: React.FC = () => {
  const { user } = useAuth();
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeView, setActiveView] = useState<'front' | 'back' | 'cover-front'>('front');

  if (!user) return null;

  const handleDownload = async () => {
    if (!cardContainerRef.current) return;
    try {
      setDownloading(true);
      
      // Temporarily remove transform on the child container for high-res download
      const cardEl = cardContainerRef.current.querySelector('.relative') as HTMLElement;
      let originalTransform = '';
      if (cardEl) {
        originalTransform = cardEl.style.transform;
        cardEl.style.transform = 'none';
      }

      const dataUrl = await toPng(cardContainerRef.current, {
        quality: 1,
        pixelRatio: 3, // High quality
        cacheBust: true,
      });
      
      if (cardEl) {
        cardEl.style.transform = originalTransform;
      }
      
      const link = document.createElement('a');
      link.download = `KIEV_ACCESS_${activeView.toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to download ID card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Digital ID Card</h1>
          <p className="text-secondary text-sm">Your Kiev Access digital identity credential</p>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setActiveView('front')}
            className={`flex items-center justify-center text-sm px-4 py-2 rounded-full transition-colors whitespace-nowrap ${activeView === 'front' ? 'bg-primary text-background' : 'bg-card border border-border hover:bg-border'}`}
          >
            <CreditCard className="w-4 h-4 mr-2" /> Front
          </button>
          <button 
            onClick={() => setActiveView('back')}
            className={`flex items-center justify-center text-sm px-4 py-2 rounded-full transition-colors whitespace-nowrap ${activeView === 'back' ? 'bg-primary text-background' : 'bg-card border border-border hover:bg-border'}`}
          >
            <Repeat className="w-4 h-4 mr-2" /> Back
          </button>
          <button 
            onClick={() => setActiveView('cover-front')}
            className={`flex items-center justify-center text-sm px-4 py-2 rounded-full transition-colors whitespace-nowrap ${activeView === 'cover-front' ? 'bg-primary text-background' : 'bg-card border border-border hover:bg-border'}`}
          >
            <Shield className="w-4 h-4 mr-2" /> Cover
          </button>
        </div>
      </div>

      {/* Card Container */}
      <div className="w-full flex justify-center py-8 overflow-hidden bg-white/5 rounded-[2rem] border border-white/10 mb-8">
        {/* On mobile, we rotate it to fit the screen vertically but keep the landscape design */}
        <div className="transform scale-[0.55] sm:scale-[0.7] md:scale-100 rotate-90 md:rotate-0 origin-center transition-transform duration-500 ease-in-out">
          <div ref={cardContainerRef} className="w-[856px] h-[540px]">
            <MemberCard user={user} view={activeView} />
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-secondary mt-2 mb-8 md:hidden">
        Rotate phone for best viewing experience
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center text-sm bg-white text-black hover:scale-105 active:scale-95 px-8 py-3 rounded-full transition-all font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" /> 
          {downloading ? 'Generating High-Res Image...' : `Download ${activeView} View`}
        </button>
      </div>
    </div>
  );
};

export default DigitalID;
