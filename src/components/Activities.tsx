import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Activity {
    id: string;
    title: string;
    description: string;
    image_url: string;
}

const Activities = () => {
    const [description, setDescription] = useState('Yıl boyunca gerçekleştirdiğimiz etkinlikler');
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'desc_activities')
                .single();

            if (data && data.value) {
                setDescription(data.value);
            }
        };

        const fetchActivities = async () => {
            const { data } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setActivities(data);
            }
        };

        fetchSettings();
        fetchActivities();
    }, []);

    return (
        <section id="faaliyetler" className="py-20 bg-gradient-to-b from-black to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Faaliyetler</span>
                    </h2>
                    <p className="text-gray-400 text-lg">{description}</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {activities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black rounded-xl overflow-hidden border border-lime-500/10 hover:border-lime-500/30 transition-all duration-300"
                        >
                            <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                                {activity.image_url ? (
                                    <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-600">Görsel Yok</span>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{activity.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-3">{activity.description}</p>
                            </div>
                        </motion.div>
                    ))}

                    {activities.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            Henüz eklenmiş bir faaliyet bulunmamaktadır.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Activities;
