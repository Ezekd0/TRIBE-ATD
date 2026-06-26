import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight, Fingerprint, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-white/20">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-black" />
          </div>
          <div className="text-xl font-bold tracking-widest uppercase">Cave Tribe</div>
        </div>
        <div className="space-x-6 flex items-center">
          <a href="#about" className="hidden md:inline text-secondary hover:text-white transition-colors text-sm font-medium tracking-wide">About Us</a>
          <a href="#how-it-works" className="hidden md:inline text-secondary hover:text-white transition-colors text-sm font-medium tracking-wide">How It Works</a>
          <Link to="/login" className="text-secondary hover:text-white transition-colors text-sm font-medium tracking-wide">Log in</Link>
          <Link to="/register" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Register Now
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium tracking-wider uppercase text-secondary">System Active</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter max-w-4xl mb-6 leading-tight">
              Enterprise Access <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-500">
                Redefined.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto mb-12 font-light">
              The exclusive digital identity platform for the Cave Tribe. Secure, verifiable, and seamless access management.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/register" className="w-full sm:w-auto flex items-center justify-center bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                Request Access <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 px-6 border-t border-white/5 bg-[#0D0D0D]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">About Cave Tribe</h2>
              <p className="text-secondary text-lg leading-relaxed mb-6">
                We are an exclusive community requiring the highest standards of security and identity verification. The Cave Tribe Access System was built from the ground up to ensure that our physical spaces remain strictly accessible only to verified members.
              </p>
              <p className="text-secondary text-lg leading-relaxed">
                By integrating enterprise-grade authentication with blockchain verification, we provide a seamless check-in experience without compromising on security.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl aspect-square flex flex-col justify-center items-center text-center">
                <Shield className="w-10 h-10 mb-4 text-white" />
                <div className="font-bold text-xl">Military Grade</div>
                <div className="text-sm text-secondary mt-2">End-to-end security</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl aspect-square flex flex-col justify-center items-center text-center mt-8">
                <Activity className="w-10 h-10 mb-4 text-white" />
                <div className="font-bold text-xl">Real-time</div>
                <div className="text-sm text-secondary mt-2">Live attendance tracking</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-6 border-t border-white/5 relative">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">A seamless onboarding process designed to maintain absolute ecosystem integrity.</p>
          </div>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black text-xl mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">Register</h3>
              <p className="text-secondary leading-relaxed">Submit your profile, including your emergency contacts and details, to request entry into the system.</p>
            </div>
            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] hover:bg-white/5 transition-colors relative">
               <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black text-xl mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">Verification</h3>
              <p className="text-secondary leading-relaxed">Administrators review your application. Upon approval, your unique Tribe Number is minted.</p>
            </div>
            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] hover:bg-white/5 transition-colors">
               <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black text-xl mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">Access Granted</h3>
              <p className="text-secondary leading-relaxed">Receive your Digital ID Card with a dynamic QR code for instant, secure physical access.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10 text-center text-secondary text-sm">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Fingerprint className="w-4 h-4 opacity-50" />
          <span className="font-bold tracking-widest uppercase opacity-50">Cave Tribe</span>
        </div>
        &copy; {new Date().getFullYear()} Cave Tribe Access System. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
