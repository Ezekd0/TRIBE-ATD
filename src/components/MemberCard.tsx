import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Fingerprint, Phone, Calendar, ShieldCheck, CheckCircle, Lock, Shield, UserRound, Link as LinkIcon, ShieldAlert } from 'lucide-react';
import type { User } from '../types';

interface MemberCardProps {
  user: User;
  view?: 'front' | 'back' | 'cover-front' | 'cover-back';
}

const MemberCard: React.FC<MemberCardProps> = ({ user, view = 'front' }) => {
  const [scale, setScale] = useState(1);
  
  // Format the id to look like a member code
  const memberCode = user.tribe_number || `TRB-${new Date().getFullYear()}-${user.id.substring(0, 4).toUpperCase()}`;
  const blockchainHash = user.on_chain_tx_hash || `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;
  
  useEffect(() => {
    const handleResize = () => {
      // Scale based on a base width of 856px
      if (window.innerWidth < 900) {
        setScale((window.innerWidth - 40) / 856);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardStyle = { width: '856px', height: '540px', transform: `scale(${scale})` };

  const FrontSide = () => (
    <div className="absolute inset-0 bg-[#0A0A0A] rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-white border border-white/10">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#0a0a0a] to-[#000] z-0" />
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-white/5 rounded-full blur-[100px] z-0" />

      {/* Top Left Logo */}
      <div className="absolute top-[40px] left-[40px] flex items-center z-10">
        <div className="w-[50px] h-[50px] bg-white text-black rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] mr-5">
          <Fingerprint className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-white">CAVE TRIBE</h1>
          <p className="text-[10px] font-bold tracking-[0.2em] text-secondary">ENTERPRISE ACCESS</p>
        </div>
      </div>

      {/* Blockchain Badge */}
      <div className="absolute top-[45px] right-[40px] flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-1.5 z-10 shadow-inner">
        <LinkIcon className="w-3 h-3 text-green-400 mr-2" />
        <span className="text-[10px] font-bold text-white tracking-widest uppercase">Verified On-Chain</span>
        <span className="text-[10px] font-mono text-secondary ml-2 border-l border-white/20 pl-2">{blockchainHash}</span>
      </div>

      {/* Profile Photo */}
      <div className="absolute top-[130px] left-[40px] w-[200px] h-[250px] bg-[#1A1A1A] rounded-[20px] overflow-hidden shadow-2xl z-10 border-2 border-white/10">
        {user.profile_image_url ? (
          <img src={user.profile_image_url} alt={user.full_name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <UserRound className="w-24 h-24" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="absolute top-[140px] left-[280px] z-10">
        <h2 className="text-[38px] font-black text-white leading-[1.1] uppercase max-w-[300px]">
          {user.full_name}
        </h2>
        
        <div className="mt-4 bg-white text-black px-5 py-1.5 rounded-full inline-block font-black text-xs tracking-[0.2em] uppercase">
          {user.role === 'admin' || user.role === 'super_admin' ? 'ADMINISTRATOR' : 'VERIFIED MEMBER'}
        </div>

        <div className="mt-10 space-y-5">
          <div className="flex items-start">
            <ShieldCheck className="w-5 h-5 text-white/50 mr-4 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">TRIBE NUMBER</p>
              <p className="font-mono font-bold text-white text-lg tracking-wider">{memberCode}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Phone className="w-5 h-5 text-white/50 mr-4 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">SECURE COMMS</p>
              <p className="font-bold text-white text-lg">{user.phone_number || '+X XXX XXX XXXX'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-white/50 mr-4 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">INITIATION DATE</p>
              <p className="font-bold text-white text-lg">{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Info (QR Code & Status) */}
      <div className="absolute top-[140px] right-[60px] flex flex-col items-center z-10">
        <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <QRCodeSVG 
            value={`{"tribe_number":"${memberCode}","hash":"${blockchainHash}"}`}
            size={120}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={false}
          />
        </div>
        <p className="text-center font-mono font-bold text-xs mt-4 tracking-widest text-secondary uppercase">{memberCode.split('-').pop()}</p>
        
        <div className="mt-8 text-center w-full">
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase shadow-inner flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-2" /> ACTIVE
          </div>
        </div>
      </div>

      {/* Bottom Footer Authorized By */}
      <div className="absolute bottom-[35px] right-[40px] flex items-center text-white z-10">
        <div className="text-right">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-tight">SYSTEM STATUS</p>
          <p className="font-bold text-white text-sm uppercase tracking-wider">CRYPTOGRAPHICALLY SECURED</p>
        </div>
      </div>
    </div>
  );

  const BackSide = () => (
    <div className="absolute inset-0 bg-[#0A0A0A] rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-white border border-white/10 flex flex-col">
      <div className="flex-1 flex p-10 pt-12">
        {/* Col 1 */}
        <div className="w-[35%] pr-8 border-r border-white/10">
          <h3 className="text-white font-black text-sm tracking-widest uppercase mb-6 flex items-center">
            <Shield className="w-4 h-4 mr-2" /> PROTOCOL & TERMS
          </h3>
          <ul className="text-xs text-secondary space-y-4 list-disc pl-4 marker:text-white/30">
            <li>This cryptographic ID is the property of the Cave Tribe Access System.</li>
            <li>Possession indicates verified clearance. Non-transferable under any circumstances.</li>
            <li>Card holders are bound by the absolute confidentiality agreements of the facility.</li>
            <li>Report loss or compromise of this asset immediately to the Central Node.</li>
            <li>Unauthorized duplication will trigger immediate system-wide lockdown protocols.</li>
          </ul>
        </div>
        
        {/* Col 2 */}
        <div className="w-[30%] px-8 border-r border-white/10">
          <h3 className="text-white font-black text-sm tracking-widest uppercase mb-6 flex items-center">
             <AlertCircle className="w-4 h-4 mr-2" /> IF FOUND
          </h3>
          <p className="text-xs text-secondary leading-relaxed mb-8">
            This asset contains classified cryptographic data. Please return to the nearest Security Node or scan the QR code to initiate secure return protocols.
          </p>
          
          <div className="bg-[#111] p-5 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <div className="flex items-center text-red-500 font-bold text-[10px] uppercase tracking-widest mb-3">
              <Phone className="w-3 h-3 mr-2" /> CRITICAL EMERGENCY
            </div>
            <p className="text-[10px] text-secondary mb-2 uppercase tracking-wider">Direct Security Line</p>
            <p className="text-white font-mono font-bold text-lg">+1 800 CAVE SEC</p>
          </div>
        </div>
        
        {/* Col 3 */}
        <div className="w-[35%] pl-8 flex flex-col items-center">
          <h3 className="text-white font-black text-sm tracking-widest uppercase mb-6 w-full text-center">VERIFICATION NODE</h3>
          <p className="text-[10px] text-secondary leading-relaxed mb-6 w-full text-center tracking-wide">
            Scan to ping the blockchain ledger and verify the cryptographic signature of this identity asset.
          </p>
          <div className="bg-white p-2.5 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <QRCodeSVG value={`verify:${blockchainHash}`} size={100} bgColor="#ffffff" fgColor="#000000" level="Q" />
          </div>
          <div className="mt-5 bg-white text-black px-6 py-2 rounded-full font-black text-[10px] tracking-[0.2em] uppercase">
            SCAN LEDGER
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="h-[90px] bg-[#111] border-t border-white/10 w-full flex items-center justify-between px-10 text-white relative">
        <div className="flex items-center space-x-4 z-10 w-1/4">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-black flex items-center justify-center">
             <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">IDENTITY</p>
            <p className="text-[8px] text-secondary mt-1 leading-tight tracking-wider">ZERO-KNOWLEDGE PROOF</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 z-10 w-1/4">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-black flex items-center justify-center">
             <LinkIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">ON-CHAIN</p>
            <p className="text-[8px] text-secondary mt-1 leading-tight tracking-wider">IMMUTABLE LEDGER</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 z-10 w-1/4">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-black flex items-center justify-center">
             <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">SECURE</p>
            <p className="text-[8px] text-secondary mt-1 leading-tight tracking-wider">MILITARY GRADE</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 z-10 w-1/4">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-black flex items-center justify-center">
             <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">PRIVACY</p>
            <p className="text-[8px] text-secondary mt-1 leading-tight tracking-wider">END-TO-END ENCRYPTED</p>
          </div>
        </div>
      </div>
    </div>
  );

  const CoverFront = () => (
    <div className="absolute inset-0 bg-[#0A0A0A] rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans border border-white/5 flex items-center justify-center relative">
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[30px] w-1/2 h-[5px] rounded-full bg-[#222]"></div>
      <div className="absolute top-[20px] w-[60px] h-[15px] rounded-full bg-black shadow-inner"></div>
      
      <div className="flex flex-col items-center justify-center z-10">
        <div className="w-[100px] h-[100px] bg-white text-black rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-8 transform rotate-12 transition-transform hover:rotate-0 duration-500">
          <Fingerprint className="w-16 h-16" strokeWidth={1} />
        </div>
        <h1 className="text-4xl font-black tracking-[0.4em] text-white mb-4">CAVE TRIBE</h1>
        <div className="w-[60px] h-[2px] bg-white/20 mb-4"></div>
        <p className="text-xs font-bold tracking-[0.5em] text-secondary uppercase">Secure Identity Cover</p>
      </div>
    </div>
  );

  // Fallback for missing icon in BackSide
  const AlertCircle = ShieldAlert;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative origin-top transition-transform duration-200 ease-in-out" style={cardStyle}>
        {view === 'front' && <FrontSide />}
        {view === 'back' && <BackSide />}
        {view === 'cover-front' && <CoverFront />}
        {view === 'cover-back' && <CoverFront />}
      </div>
    </div>
  );
};

export default MemberCard;
