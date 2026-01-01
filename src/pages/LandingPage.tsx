import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import Introduction from '../components/Introduction';
import About from '../components/About';
import Team from '../components/Team';
import VehicleShowcase from '../components/VehicleShowcase';
import Races from '../components/Races';
import Activities from '../components/Activities';
import Sponsors from '../components/Sponsors';
import Media from '../components/Media';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

// Holiday Feature Imports
import {
    useHoliday,
    HolidayBanner,
    HolidayOverlay,
    FlagAnimation,
    ConfettiEffect,
    AtaturkCorner
} from '../features/holidays';

function LandingPage() {
    const [visibleSections, setVisibleSections] = useState({
        show_about: true,
        show_team: true,
        show_vehicles: true,
        show_races: true,
        show_activities: true,
        show_sponsors: true,
        show_media: true
    });

    // Holiday state
    const { isHolidayActive, activeHoliday, isMourning } = useHoliday();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', [
                    'show_about',
                    'show_team',
                    'show_vehicles',
                    'show_races',
                    'show_activities',
                    'show_sponsors',
                    'show_media'
                ]);

            if (data) {
                const newVisibility = { ...visibleSections };
                data.forEach(setting => {
                    if (setting.key === 'show_about') newVisibility.show_about = setting.value === 'true';
                    if (setting.key === 'show_team') newVisibility.show_team = setting.value === 'true';
                    if (setting.key === 'show_vehicles') newVisibility.show_vehicles = setting.value === 'true';
                    if (setting.key === 'show_races') newVisibility.show_races = setting.value === 'true';
                    if (setting.key === 'show_activities') newVisibility.show_activities = setting.value === 'true';
                    if (setting.key === 'show_sponsors') newVisibility.show_sponsors = setting.value === 'true';
                    if (setting.key === 'show_media') newVisibility.show_media = setting.value === 'true';
                });
                setVisibleSections(newVisibility);
            }
        };

        fetchSettings();
    }, []);

    const location = useLocation();

    // Banner ve navbar yüksekliğini hesaplayarak hedef pozisyonu bul
    const getScrollOffset = () => {
        const navbar = document.querySelector('nav');
        const banner = document.querySelector('[class*="fixed top-0"][class*="z-[100]"]');
        const navbarHeight = navbar?.getBoundingClientRect().height || 80;
        const bannerHeight = banner?.getBoundingClientRect().height || 0;
        return navbarHeight + bannerHeight + 20; // 20px ekstra boşluk
    };

    // State ile gelen scroll isteğini işle (detay sayfalarından dönüş için)
    useEffect(() => {
        const state = location.state as { scrollTo?: string } | null;
        if (state?.scrollTo) {
            // Kısa bir gecikme ile scroll yap (sayfa tamamen yüklendikten sonra)
            setTimeout(() => {
                const element = document.getElementById(state.scrollTo!);
                if (element) {
                    // Manuel scroll ile banner/overlay'den etkilenme
                    const targetPosition = element.getBoundingClientRect().top + window.scrollY - getScrollOffset();
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 150);
            // State'i temizle (tarayıcı geçmişinde kalmasın)
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Holiday Components - Only render when holiday is active */}
            {isHolidayActive && <HolidayBanner />}
            {isHolidayActive && !isMourning && activeHoliday?.show_confetti && <ConfettiEffect />}
            {isHolidayActive && activeHoliday?.show_flag && <FlagAnimation />}
            {isHolidayActive && !isMourning && activeHoliday?.show_ataturk && <AtaturkCorner />}
            {isMourning && <HolidayOverlay />}

            <div className="absolute inset-0 opacity-10 pointer-events-none fixed">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #7cb342 35px, #7cb342 70px), repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(124, 179, 66, 0.5) 35px, rgba(124, 179, 66, 0.5) 70px)`
                }}></div>
            </div>

            <SEO />
            <Navbar />

            <main className="relative">
                <Hero />
                <Introduction />
                {visibleSections.show_about && <About />}
                {visibleSections.show_team && <Team />}
                {visibleSections.show_vehicles && <VehicleShowcase />}
                {visibleSections.show_races && <Races />}
                {visibleSections.show_activities && <Activities />}
                {visibleSections.show_sponsors && <Sponsors />}
                {visibleSections.show_media && <Media />}
                <Contact />
            </main>

            <Footer />
        </div>
    );
}

export default LandingPage;

