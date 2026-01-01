import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

interface Activity {
    id: string;
    title: string;
    description: string;
    image_url: string;
    created_at: string;
}

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching activity:', error);
                navigate('/');
                return;
            }

            if (data) {
                setActivity(data);
            }
            setLoading(false);
        };

        fetchActivity();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-400"></div>
            </div>
        );
    }

    if (!activity) return null;

    return (
        <div className="min-h-screen bg-black text-white">
            <SEO
                title={activity.title}
                description={activity.description.substring(0, 150) + "..."}
                image={activity.image_url}
                url={`/faaliyet/${activity.id}`}
            />
            <Navbar />

            <article className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/', { state: { scrollTo: 'faaliyetler' } })}
                    className="inline-flex items-center text-gray-400 hover:text-lime-400 transition-colors mb-8 group"
                >
                    <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Faaliyetlere Dön
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {activity.image_url && (
                        <div className="aspect-video w-[70%] mx-auto rounded-2xl overflow-hidden mb-8 border border-gray-800">
                            <img
                                src={activity.image_url}
                                alt={activity.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                        <span className="flex items-center gap-1">
                            <Calendar size={16} className="text-lime-400" />
                            {new Date(activity.created_at).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span className="text-lime-400 font-medium">Faaliyet</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight">
                        {activity.title}
                    </h1>

                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {activity.description}
                        </p>
                    </div>
                </motion.div>
            </article>

            <Footer />
        </div>
    );
};

export default ActivityDetail;
