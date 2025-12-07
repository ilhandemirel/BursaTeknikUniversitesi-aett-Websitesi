import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Race {
    id: string;
    title: string;
    description: string;
    rank: string;
    image_url: string;
    year: string;
}

const Races = () => {
    const [description, setDescription] = useState('Katıldığımız ve derece aldığımız yarışlar');
    const [races, setRaces] = useState<Race[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'desc_races')
                .single();

            if (data && data.value) {
                setDescription(data.value);
            }
        };

        const fetchRaces = async () => {
            const { data } = await supabase
                .from('races')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setRaces(data);
            }
        };

        fetchSettings();
        fetchRaces();
    }, []);

    return (
        <section id="yarışlar" className="py-20 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Yarışlar</span>
                    </h2>
                    <p className="text-gray-400 text-lg">{description}</p>
                </motion.div>

                <div className="space-y-8">
                    {races.map((race, index) => (
                        <motion.div
                            key={race.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-900 rounded-2xl p-6 border border-lime-500/20 flex flex-col md:flex-row gap-6 items-center"
                        >
                            <div className="w-full md:w-1/3 aspect-video bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                                {race.image_url ? (
                                    <img src={race.image_url} alt={race.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-600">Görsel Yok</span>
                                )}
                                {race.year && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg border border-white/10 shadow-lg">
                                        {race.year}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-2/3">
                                <h3 className="text-2xl font-bold text-white mb-2">{race.title}</h3>
                                <p className="text-gray-400 mb-4">{race.description}</p>
                                {race.rank && (
                                    <span className="text-lime-400 font-bold">Derece: {race.rank}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {races.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            Henüz eklenmiş bir yarış bulunmamaktadır.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Races;
