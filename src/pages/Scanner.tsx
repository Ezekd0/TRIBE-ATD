import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Search, ChevronLeft, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { SessionStatus } from '../types';

interface ScanResult {
  name: string;
  id: string;
  user_id: string;
  time: string;
  currentStatus: SessionStatus | null; // null means no active session (needs check-in)
}

/** Return the start-of-today ISO string in UTC for date filtering. */
const todayStart = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/**
 * Look up a user by tribe_number, then check whether they already have an
 * ACTIVE attendance session today.  Returns a ScanResult or throws.
 */
const lookupUser = async (
  tribeNumber: string,
): Promise<ScanResult> => {
  // 1. Find the user
  const { data: foundUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('tribe_number', tribeNumber)
    .single();

  if (userError || !foundUser) {
    throw new Error('Member not found. Please check the ID and try again.');
  }

  // Check user status
  if (foundUser.status !== 'ACTIVE') {
    if (foundUser.status === 'SUSPENDED') {
      throw new Error('Access Denied: This account is currently suspended.');
    } else if (foundUser.status === 'PENDING') {
      throw new Error('Access Denied: Account is pending admin approval.');
    } else {
      throw new Error(`Access Denied: Account is inactive (Status: ${foundUser.status}).`);
    }
  }

  // 2. Check for an active attendance session today
  const { data: activeLogs } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('user_id', foundUser.id)
    .eq('status', 'ACTIVE')
    .gte('check_in_time', todayStart())
    .limit(1);

  const hasActiveSession = activeLogs && activeLogs.length > 0;

  return {
    name: foundUser.full_name,
    id: foundUser.tribe_number ?? foundUser.id,
    user_id: foundUser.id,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentStatus: hasActiveSession ? 'ACTIVE' : null,
  };
};

/**
 * Search by tribe_number OR phone_number and return a ScanResult.
 */
const searchUser = async (query: string): Promise<ScanResult> => {
  // Try tribe_number first
  const { data: byTribe } = await supabase
    .from('users')
    .select('*')
    .eq('tribe_number', query)
    .single();

  if (byTribe) {
    return lookupUser(byTribe.tribe_number);
  }

  // Fall back to phone_number
  const { data: byPhone, error: phoneError } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', query)
    .single();

  if (phoneError || !byPhone) {
    throw new Error('Member not found. Please check the ID or phone number.');
  }

  return lookupUser(byPhone.tribe_number);
};

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualSearch, setManualSearch] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let reader: BrowserMultiFormatReader;

    if (isScanning && videoRef.current) {
      reader = new BrowserMultiFormatReader();
      reader.decodeFromVideoDevice(undefined, videoRef.current, async (result) => {
        if (result) {
          setLoading(true);
          setError(null);
          try {
            const data = JSON.parse(result.getText());
            if (!data.tribe_number) {
              throw new Error('Invalid QR code: missing tribe_number.');
            }
            const scanData = await lookupUser(data.tribe_number);
            setScanResult(scanData);
          } catch (err: any) {
            setError(err.message || 'Failed to process QR code.');
            setScanResult(null);
          } finally {
            setLoading(false);
            setIsScanning(false);
          }
        }
      });
    }

    return () => {};
  }, [isScanning]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearch) return;

    setLoading(true);
    setError(null);
    try {
      const result = await searchUser(manualSearch.trim());
      setScanResult(result);
      setManualSearch('');
      setIsScanning(false);
    } catch (err: any) {
      setError(err.message || 'Search failed.');
      setScanResult(null);
      setIsScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async () => {
    if (!scanResult) return;

    setLoading(true);
    setError(null);
    try {
      if (scanResult.currentStatus === 'ACTIVE') {
        // Check-out: update the active attendance log
        const { error: updateError } = await supabase
          .from('attendance_logs')
          .update({
            status: 'EXITED',
            check_out_time: new Date().toISOString(),
          })
          .eq('user_id', scanResult.user_id)
          .eq('status', 'ACTIVE')
          .gte('check_in_time', todayStart());

        if (updateError) throw updateError;
      } else {
        // Check-in: insert a new attendance log
        const { error: insertError } = await supabase
          .from('attendance_logs')
          .insert({
            user_id: scanResult.user_id,
            method: 'QR Scan',
            status: 'Present',
          });

        if (insertError) throw insertError;
      }

      setScanResult(null);
      setIsScanning(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col">
      {/* Mobile-style header */}
      <div className="flex items-center mb-6 pb-4 border-b border-border">
        <button onClick={() => navigate('/admin')} className="p-2 -ml-2 mr-2 text-secondary hover:text-primary transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Scanner / Check-Out</h1>
      </div>

      <div className="flex-1 flex flex-col space-y-6 relative">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-2xl text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => { setError(null); setIsScanning(true); }} className="ml-4 text-red-300 hover:text-white text-xs font-bold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Scanner Viewport */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden aspect-[3/4] relative flex flex-col">
          {isScanning ? (
            <>
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-80" />
              {/* Scan Overlay UI */}
              <div className="absolute inset-0 border-[40px] border-black/50">
                <div className="w-full h-full border-2 border-white/50 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1"></div>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/80 animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center text-sm font-medium z-10 text-white drop-shadow-md">
                {loading ? 'Looking up member…' : 'Scan QR to Check In / Out'}
              </div>
            </>
          ) : scanResult ? (
            <div className="flex flex-col h-full bg-transparent p-8 text-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white/10 mx-auto mb-6 overflow-hidden border-4 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                  {scanResult.name.charAt(0)}
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-1">{scanResult.name}</h2>
              <p className="text-sm text-secondary font-mono mb-6">{scanResult.id}</p>
              
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl mb-8 flex flex-col space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Action Needed</span>
                  {scanResult.currentStatus === 'ACTIVE' ? (
                    <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">CHECK OUT</span>
                  ) : (
                    <span className="text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">CHECK IN</span>
                  )}
                </div>
                {scanResult.currentStatus === 'ACTIVE' && (
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-secondary">Time Inside</span>
                    <span className="font-mono">4h 12m</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={confirmAction}
                disabled={loading}
                className={`w-full py-5 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:hover:scale-100 ${scanResult.currentStatus === 'ACTIVE' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white text-black shadow-white/20'}`}
              >
                {loading ? (
                  'Processing…'
                ) : scanResult.currentStatus === 'ACTIVE' ? (
                   <><LogOut className="w-5 h-5 mr-2" /> Complete Check Out</>
                ) : (
                   <><LogIn className="w-5 h-5 mr-2" /> Complete Check In</>
                )}
              </button>
              
              <button 
                onClick={() => { setScanResult(null); setError(null); setIsScanning(true); }}
                className="w-full mt-4 text-secondary py-4 hover:text-primary transition-colors text-sm font-medium"
              >
                Cancel / Rescan
              </button>
            </div>
          ) : (
             <div className="flex flex-col h-full items-center justify-center bg-card p-6">
               <p className="text-secondary mb-4">{error ? 'Scan failed. Try again or search manually.' : 'Camera unavailable or loading.'}</p>
               <button onClick={() => { setError(null); setIsScanning(true); }} className="bg-primary text-background px-4 py-2 rounded-md">Retry Camera</button>
             </div>
          )}
        </div>

        {/* OR Divider */}
        {isScanning && (
          <div className="flex items-center py-2">
            <div className="flex-1 border-t border-border"></div>
            <div className="px-4 text-xs font-bold tracking-widest text-secondary uppercase">OR</div>
            <div className="flex-1 border-t border-border"></div>
          </div>
        )}

        {/* Manual Search */}
        {isScanning && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 rounded-[2rem]">
            <form onSubmit={handleManualSearch}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Member ID / Phone Number"
                  className="w-full bg-black/20 border border-white/10 rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-white placeholder-white/30"
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!manualSearch || loading}
                  className="absolute right-2 p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Scanner;
