import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Sponsor {
    id: string;
    name: string;
    logo_url: string;
    website_url: string;
}

const Sponsors = () => {
    const [description, setDescription] = useState('Bize destek olan kurum ve kuruluşlar');
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'desc_sponsors')
                .single();

            if (data && data.value) {
                setDescription(data.value);
            }
        };

        const fetchSponsors = async () => {
            const { data } = await supabase
                .from('sponsors')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setSponsors(data);
            }
        };

        fetchSettings();
        fetchSponsors();
    }, []);

    return (
        <section id="sponsorlar" className="py-20 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Sponsorlar</span>
                    </h2>
                    <p className="text-gray-400 text-lg">{description}</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {sponsors.map((sponsor, index) => (
                        <motion.a
                            href={sponsor.website_url || '#'}
                            target={sponsor.website_url ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            key={sponsor.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={`aspect-[3/2] bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors ${sponsor.website_url ? 'cursor-pointer' : 'cursor-default'} p-4`}
                        >
                            {sponsor.logo_url ? (
                                <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
                            ) : (
                                <span className="text-gray-500 font-bold">{sponsor.name}</span>
                            )}
                        </motion.a>
                    ))}

                    {sponsors.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            Henüz eklenmiş bir sponsor bulunmamaktadır.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Sponsors;
