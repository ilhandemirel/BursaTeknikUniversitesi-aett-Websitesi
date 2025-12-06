import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface HeroVehicle {
    id: string;
    name: string;
    image_url: string;
}

const Hero = () => {
    const [vehicles, setVehicles] = useState<HeroVehicle[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [heroText, setHeroText] = useState({
        subtitle: 'Bize Yapılan Yatırım',
        titleStart: 'Geleceğe Yapılan',
        titleHighlight: ' Yatırımdır',
        description: 'Bursa Teknik Üniversitesi Alternatif Enerjili Taşıtlar Topluluğu'
    });

    const scrollToContact = () => {
        document.getElementById('iletişim')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToAbout = () => {
        document.getElementById('kurumsal')?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', ['hero_subtitle', 'hero_title_start', 'hero_title_highlight', 'hero_description']);

            if (data) {
                const newText = { ...heroText };
                data.forEach(setting => {
                    if (setting.key === 'hero_subtitle') newText.subtitle = setting.value;
                    if (setting.key === 'hero_title_start') newText.titleStart = setting.value;
                    if (setting.key === 'hero_title_highlight') newText.titleHighlight = setting.value;
                    if (setting.key === 'hero_description') newText.description = setting.value;
                });
                setHeroText(newText);
            }
        };

        const fetchVehicles = async () => {
            const { data } = await supabase
                .from('vehicles')
                .select('id, name, image_url')
                .not('image_url', 'is', null);

            if (data && data.length > 0) {
                setVehicles(data);
            }
        };

        fetchSettings();
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (vehicles.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % vehicles.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [vehicles]);

    return (
        <section id="anasayfa" className="relative min-h-screen flex items-center pt-20">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/50"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6 lg:space-y-8"
                    >
                        <div className="space-y-4">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-lime-400 text-lg sm:text-xl font-light tracking-wide"
                            >
                                {heroText.subtitle}
                            </motion.p>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white">
                                {heroText.titleStart}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600"> {heroText.titleHighlight}</span>
                            </h1>
                        </div>

                        <div className="inline-flex items-center space-x-3 bg-lime-400 text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg shadow-lime-500/50">
                            <span>%100 Öğrenci İşi</span>
                        </div>

                        <div className="pt-4">
                            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
                                {heroText.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <button
                                onClick={scrollToContact}
                                className="px-8 py-3 bg-gradient-to-r from-lime-400 to-lime-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-lime-500/50 transition-all duration-300 hover:scale-105"
                            >
                                İletişime Geç
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/20 to-transparent rounded-3xl blur-3xl"></div>

                        {/* Vehicle Carousel */}
                        <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-lime-500/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-lime-500/10 relative">
                                {vehicles.length > 0 ? (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentIndex}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <img
                                                src={vehicles[currentIndex].image_url}
                                                alt={vehicles[currentIndex].name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                                <p className="text-lime-400 font-semibold text-xl text-center">
                                                    {vehicles[currentIndex].name}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                ) : (
                                    <div className="text-center space-y-4 p-8">
                                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center shadow-lg shadow-lime-500/50 animate-pulse">
                                            <svg className="w-16 h-16 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                                            </svg>
                                        </div>
                                        <p className="text-lime-400 font-semibold text-xl">Elektromobil</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToAbout}>
                <div className="w-12 h-12 rounded-full bg-lime-400/10 backdrop-blur-sm border border-lime-400/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default Hero;
