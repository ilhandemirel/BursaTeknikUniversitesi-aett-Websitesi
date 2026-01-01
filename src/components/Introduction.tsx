import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Introduction = () => {
    const [content, setContent] = useState({
        headline_start: "BTÜ'nün elektromobil/hidromobil araç takımlarını bünyesinde bulunduran AETT'ye bağlı, tamamen öğrencilerin özgün proje ve tasarımlarını hayata geçiren",
        headline_highlight: "YILDIRIM takımıyız.",
        description_1: "YILDIRIM, Alternatif Enerjili Taşıtlar Topluluğu, Bursa Teknik Üniversitesi'nin 2017 yılından itibaren aktif olarak yurtiçi Elektrikli Araç yarışmalarına, 2020 yılından beri Otonom Araç yarışmalarına katılan bir öğrenci topluluğudur.",
        description_2: "Kar amacı gütmeksizin, yerli ve milli teknoloji hamlesi kapsamında %100 öğrenci işi olarak adlandırdığımız özgün tasarım ve fikirlerimizi hayata geçirerek sektör öncesi deneyim kazanmak ana hedefimiz olmakla beraber uluslararası yarışmalarda ülkemizi ve üniversitemizi en iyi şekilde temsil etmek bir diğer önemli hedefimizdir.",
        image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop'
    });

    useEffect(() => {
        const fetchContent = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', [
                    'intro_headline_start',
                    'intro_headline_highlight',
                    'intro_description_1',
                    'intro_description_2',
                    'intro_image_url'
                ]);

            if (data) {
                const newContent = { ...content };
                data.forEach(setting => {
                    if (setting.key === 'intro_headline_start') newContent.headline_start = setting.value;
                    if (setting.key === 'intro_headline_highlight') newContent.headline_highlight = setting.value;
                    if (setting.key === 'intro_description_1') newContent.description_1 = setting.value;
                    if (setting.key === 'intro_description_2') newContent.description_2 = setting.value;
                    if (setting.key === 'intro_image_url') newContent.image_url = setting.value;
                });
                setContent(newContent);
            }
        };

        fetchContent();
    }, []);

    return (
        <section id="hakkimizda" className="py-20 relative overflow-hidden">
            {/* Top gradient to blend seamlessly with Hero section above */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none z-0"></div>

            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <span className="text-lime-400 font-bold tracking-wider text-sm uppercase mb-4 block">Hakkımızda</span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-5xl">
                        {content.headline_start}{' '}
                        <span className="text-lime-400">{content.headline_highlight}</span>
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Grunge/Rough Edge Effect - Using CSS Mask or Border Image is complex, using simple borders for now as MVP */}
                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-800 shadow-2xl shadow-lime-500/10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                            <img
                                src={content.image_url}
                                alt="Hakkımızda Görseli"
                                className="w-full h-auto object-cover min-h-[400px]"
                            />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-lime-400/30 rounded-br-3xl -z-10"></div>
                        <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-lime-400/30 rounded-tl-3xl -z-10"></div>
                    </motion.div>

                    {/* Text Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                        className="space-y-6 text-lg text-gray-400 leading-relaxed"
                    >
                        <p>
                            {content.description_1}
                        </p>
                        <p>
                            {content.description_2}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Introduction;
