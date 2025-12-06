import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Vehicle {
    id: string;
    name: string;
    specs: { label: string; value: string }[];
    image_url: string;
}

const VehicleShowcase = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [description, setDescription] = useState('Yüksek mühendislik ürünü yerli tasarım araçlarımız');

    useEffect(() => {
        const fetchVehicles = async () => {
            const { data } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setVehicles(data);
            }
        };

        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'desc_vehicles')
                .single();

            if (data && data.value) {
                setDescription(data.value);
            }
        };


        fetchVehicles();
        fetchSettings();

        // Auto-rotation interval
        const interval = setInterval(() => {
            setVehicles(currentVehicles => {
                if (currentVehicles.length > 1) {
                    setCurrentIndex(prev => (prev + 1) % currentVehicles.length);
                }
                return currentVehicles;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const nextVehicle = () => {
        setCurrentIndex((prev) => (prev + 1) % vehicles.length);
    };

    const prevVehicle = () => {
        setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
    };

    if (vehicles.length === 0) return null;

    return (
        <section id="araçlar" className="py-20 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Araçlarımız</span>
                    </h2>
                    <p className="text-gray-400 text-lg">{description}</p>
                </motion.div>

                <div className="relative">
                    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-lime-500/20 shadow-2xl">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.5 }}
                                    className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border border-lime-500/10 relative"
                                >
                                    {vehicles[currentIndex].image_url ? (
                                        <img src={vehicles[currentIndex].image_url} alt={vehicles[currentIndex].name} className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-lime-900/20"></div>
                                            <div className="text-center space-y-4 p-8 relative z-10">
                                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center shadow-lg shadow-lime-500/50">
                                                    <svg className="w-16 h-16 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                                                    </svg>
                                                </div>
                                                <p className="text-lime-400 font-semibold text-xl">{vehicles[currentIndex].name}</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="space-y-8">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h3 className="text-3xl font-bold text-white mb-6">{vehicles[currentIndex].name}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {vehicles[currentIndex].specs.map((spec, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-black/50 rounded-xl p-4 border border-lime-500/20 hover:border-lime-500/40 transition-all duration-300"
                                                >
                                                    <p className="text-gray-400 text-sm mb-1">{spec.label}</p>
                                                    <p className="text-lime-400 text-xl font-bold">{spec.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={prevVehicle}
                        className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-lime-400/10 hover:bg-lime-400/20 backdrop-blur-sm border border-lime-400/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
                    >
                        <ChevronLeft className="text-lime-400" size={24} />
                    </button>
                    <button
                        onClick={nextVehicle}
                        className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-lime-400/10 hover:bg-lime-400/20 backdrop-blur-sm border border-lime-400/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
                    >
                        <ChevronRight className="text-lime-400" size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default VehicleShowcase;
