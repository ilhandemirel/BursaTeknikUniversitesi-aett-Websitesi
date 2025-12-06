import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    image_url: string;
    published_at: string;
}

const Media = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [description, setDescription] = useState('Basında biz');

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase
                .from('news')
                .select('*')
                .order('published_at', { ascending: false });

            if (data) {
                setNews(data as NewsItem[]); // Cast data to NewsItem[]
            }
        };

        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'desc_media')
                .single();

            if (data && data.value) {
                setDescription(data.value);
            }
        };

        fetchNews();
        fetchSettings();
    }, []);

    return (
        <section id="medya" className="py-20 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Medya</span>
                    </h2>
                    <p className="text-gray-400 text-lg">{description}</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black rounded-xl overflow-hidden border border-lime-500/10"
                        >
                            <div className="aspect-video bg-gray-800 relative">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">Haber Görseli</div>
                                )}
                            </div>
                            <div className="p-6">
                                <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">Haberler</span>
                                <h3 className="text-xl font-bold text-white mt-2 mb-4">{item.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.content}</p>
                                <Link to={`/haber/${item.id}`} className="text-gray-400 hover:text-lime-400 text-sm transition-colors">Haberi Oku →</Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Media;
