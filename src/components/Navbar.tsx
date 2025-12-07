import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Instagram, Twitter, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [contactEmail, setContactEmail] = useState('aett@btu.edu.tr');

  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    linkedin: ''
  });

  const [visibleSections, setVisibleSections] = useState({
    show_about: true,
    show_team: true,
    show_vehicles: true,
    show_races: true,
    show_activities: true,
    show_sponsors: true,
    show_media: true
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .in('key', [
            'logo_url',
            'show_about',
            'show_team',
            'show_vehicles',
            'show_races',
            'show_activities',
            'show_sponsors',
            'show_media',
            'social_instagram',
            'social_twitter',
            'social_linkedin',
            'contact_email'
          ]);

        if (data) {
          const newVisibility = { ...visibleSections };
          data.forEach(setting => {
            if (setting.key === 'logo_url') setLogoUrl(setting.value);
            if (setting.key === 'show_about') newVisibility.show_about = setting.value === 'true';
            if (setting.key === 'show_team') newVisibility.show_team = setting.value === 'true';
            if (setting.key === 'show_vehicles') newVisibility.show_vehicles = setting.value === 'true';
            if (setting.key === 'show_races') newVisibility.show_races = setting.value === 'true';
            if (setting.key === 'show_activities') newVisibility.show_activities = setting.value === 'true';
            if (setting.key === 'show_sponsors') newVisibility.show_sponsors = setting.value === 'true';
            if (setting.key === 'show_media') newVisibility.show_media = setting.value === 'true';
            if (setting.key === 'social_instagram') setSocialLinks(prev => ({ ...prev, instagram: setting.value }));
            if (setting.key === 'social_twitter') setSocialLinks(prev => ({ ...prev, twitter: setting.value }));
            if (setting.key === 'social_linkedin') setSocialLinks(prev => ({ ...prev, linkedin: setting.value }));
            if (setting.key === 'contact_email') setContactEmail(setting.value);
          });
          setVisibleSections(newVisibility);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    window.addEventListener('scroll', handleScroll);
    fetchSettings();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allMenuItems = [
    { id: 'ANASAYFA', elementId: 'anasayfa', show: true },
    { id: 'KURUMSAL', elementId: 'kurumsal', show: visibleSections.show_about },
    { id: 'TAKIM', elementId: 'takım', show: visibleSections.show_team },
    { id: 'ARAÇLAR', elementId: 'araçlar', show: visibleSections.show_vehicles },
    { id: 'YARIŞLAR', elementId: 'yarışlar', show: visibleSections.show_races },
    { id: 'FAALİYETLER', elementId: 'faaliyetler', show: visibleSections.show_activities },
    { id: 'SPONSORLAR', elementId: 'sponsorlar', show: visibleSections.show_sponsors },
    { id: 'MEDYA', elementId: 'medya', show: visibleSections.show_media },
    { id: 'İLETİŞİM', elementId: 'iletişim', show: true }
  ];

  const menuItems = allMenuItems.filter(item => item.show);

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-lime-500/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer" onClick={() => scrollToSection('anasayfa')}>
              <div className="absolute inset-0 bg-lime-400 blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center border-2 border-lime-300 shadow-lg shadow-lime-500/50 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="text-center">
                    <div className="text-xs font-bold text-black leading-tight">YIL</div>
                    <div className="text-xs font-bold text-black leading-tight">DIR</div>
                  </div>
                )}
              </div>
              {!logoUrl && (
                <div className="absolute -top-2 -left-2 w-20 h-20">
                  <svg className="w-full h-full opacity-60" viewBox="0 0 100 100">
                    <path d="M20,10 L30,50 L10,40 L50,90 L40,50 L60,60 L30,10 Z" fill="none" stroke="#7cb342" strokeWidth="2" className="animate-pulse" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.elementId)}
                className="px-3 py-2 text-sm font-semibold text-white hover:text-lime-400 transition-colors duration-300 relative group"
              >
                {item.id}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-400 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <a href={`mailto:${contactEmail}`} className="flex items-center space-x-2 text-sm hover:text-lime-400 transition-colors">
              <Mail size={18} />
              <span>{contactEmail}</span>
            </a>
            <div className="flex items-center space-x-3 ml-4">
              <a href={socialLinks.instagram ? `https://instagram.com/${socialLinks.instagram}` : '#'} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors"><Instagram size={20} /></a>
              <a href={socialLinks.twitter ? `https://x.com/${socialLinks.twitter}` : '#'} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors"><Twitter size={20} /></a>
              <a href={socialLinks.linkedin ? `https://linkedin.com/in/${socialLinks.linkedin}` : '#'} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-lime-500/10 transition-colors text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-md border-t border-lime-500/20 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(item.elementId)}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:text-lime-400 hover:bg-lime-500/10 rounded-md transition-colors"
                >
                  {item.id}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-lime-500/20">
                <a href={`mailto:${contactEmail}`} className="flex items-center space-x-2 px-3 py-2 text-white hover:text-lime-400">
                  <Mail size={18} />
                  <span className="text-sm">{contactEmail}</span>
                </a>
                <div className="flex items-center space-x-4 px-3 py-2 text-white">
                  <a href={socialLinks.instagram ? `https://instagram.com/${socialLinks.instagram}` : '#'} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors"><Instagram size={20} /></a>
                  <a href={socialLinks.twitter ? `https://x.com/${socialLinks.twitter}` : '#'} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors"><Twitter size={20} /></a>
                  <a href={socialLinks.linkedin ? `https://linkedin.com/in/${socialLinks.linkedin}` : '#'} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors"><Linkedin size={20} /></a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
