import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { supabase } from '../lib/supabase';

interface AboutCard {
    title: string;
    description: string;
}

const About = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const [description, setDescription] = useState('Sürdürülebilir enerji ve teknoloji odaklı geleceği şekillendiren öğrencilerden oluşan dinamik bir topluluk');
    const [cards, setCards] = useState<AboutCard[]>([
        { title: 'Yenilikçi', description: 'En son teknolojileri kullanarak sürdürülebilir çözümler üretiyoruz' },
        { title: 'Öğrenci Odaklı', description: '%100 öğrenci projesi olarak tamamen kendi kaynaklarımızla çalışıyoruz' },
        { title: 'Yarışmacı', description: 'Ulusal ve uluslararası yarışmalarda üniversitemizi başarıyla temsil ediyoruz' }
    ]);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('*')
                    .in('key', ['about_description', 'about_cards']);

                if (data) {
                    data.forEach(setting => {
                        if (setting.key === 'about_description' && setting.value) setDescription(setting.value);
                        if (setting.key === 'about_cards' && setting.value) {
                            try {
                                setCards(JSON.parse(setting.value));
                            } catch (e) {
                                console.error('Error parsing cards', e);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching about content:', error);
            }
        };

        fetchContent();
    }, []);

    return (
        <section id="kurumsal" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Biz Kimiz?</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {description}
                    </p>
                </motion.div>

                <div ref={ref} className="grid md:grid-cols-3 gap-8">
                    {cards.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-lime-500/20 hover:border-lime-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/20 group"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-bold text-black">{index + 1}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-lime-400 mb-4">{item.title}</h3>
                            <p className="text-gray-400">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
