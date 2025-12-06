import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    image_url: string;
    published_at: string;
}

const NewsDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setNews(data);
            }
            setLoading(false);
        };

        fetchNews();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-lime-400" size={48} />
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4">Haber Bulunamadı</h2>
                <Link to="/#medya" className="text-lime-400 hover:text-lime-300 flex items-center gap-2">
                    <ArrowLeft size={20} />
                    Geri Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <article className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <Link to="/#medya" className="inline-flex items-center text-gray-400 hover:text-lime-400 transition-colors mb-8">
                            <ArrowLeft className="mr-2" size={20} />
                            Haberlere Dön
                        </Link>

                        <div className="aspect-video w-full md:w-1/2 mx-auto bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                            {news.image_url ? (
                                <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    Haber Görseli Yok
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center text-lime-400 text-sm font-medium">
                                <Calendar size={16} className="mr-2" />
                                {new Date(news.published_at).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                {news.title}
                            </h1>

                            <div className="prose prose-invert prose-lg max-w-none">
                                {news.content.split('\n').map((paragraph, index) => (
                                    paragraph.trim() && (
                                        <p key={index} className="text-gray-300 leading-relaxed mb-4 break-words">
                                            {paragraph}
                                        </p>
                                    )
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default NewsDetail;
