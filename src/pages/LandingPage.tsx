import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
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
        fetchSettings();
    }, []);

    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="absolute inset-0 opacity-10 pointer-events-none fixed">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #7cb342 35px, #7cb342 70px), repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(124, 179, 66, 0.5) 35px, rgba(124, 179, 66, 0.5) 70px)`
                }}></div>
            </div>

            <Navbar />

            <main className="relative">
                <Hero />
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
