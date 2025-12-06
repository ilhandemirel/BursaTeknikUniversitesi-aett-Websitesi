import React, { useState, useEffect } from 'react';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Footer = () => {
    const [socialLinks, setSocialLinks] = useState({
        instagram: '',
        twitter: '',
        linkedin: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', ['social_instagram', 'social_twitter', 'social_linkedin']);

            if (data) {
                const newLinks = { ...socialLinks };
                data.forEach(setting => {
                    if (setting.key === 'social_instagram') newLinks.instagram = setting.value;
                    if (setting.key === 'social_twitter') newLinks.twitter = setting.value;
                    if (setting.key === 'social_linkedin') newLinks.linkedin = setting.value;
                });
                setSocialLinks(newLinks);
            }
        };

        fetchSettings();
    }, []);
    return (
        <footer className="relative bg-black border-t border-lime-500/20 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-center md:text-left">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} YILDIRIM - Bursa Teknik Üniversitesi
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Alternatif Enerjili Taşıtlar Topluluğu
                        </p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <a href={socialLinks.instagram ? `https://instagram.com/${socialLinks.instagram}` : '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lime-400 transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href={socialLinks.twitter ? `https://x.com/${socialLinks.twitter}` : '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lime-400 transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href={socialLinks.linkedin ? `https://linkedin.com/in/${socialLinks.linkedin}` : '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lime-400 transition-colors">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
