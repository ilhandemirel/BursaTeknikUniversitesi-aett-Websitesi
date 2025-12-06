import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image_url: string;
}

const Team = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [description, setDescription] = useState('Başarının arkasındaki güç');

    useEffect(() => {
        const fetchMembers = async () => {
            const { data } = await supabase
                .from('team_members')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setMembers(data);
            }
        };

        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'desc_team')
                .single();

            if (data && data.value) {
                setDescription(data.value);
            }
        };

        fetchMembers();
        fetchSettings();
    }, []);

    if (members.length === 0) return null;

    // Duplicate members to create seamless loop
    const marqueeMembers = [...members, ...members, ...members, ...members];

    return (
        <section id="takım" className="py-20 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Takımımız</span>
                    </h2>
                    <p className="text-gray-400 text-lg">{description}</p>
                </motion.div>
            </div>

            <div className="relative w-full">
                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-6"
                        animate={{ x: "-50%" }}
                        transition={{
                            duration: members.length * 3, // Adjust speed based on number of items
                            ease: "linear",
                            repeat: Infinity,
                        }}
                    >
                        {marqueeMembers.map((member, index) => (
                            <div
                                key={`${member.id}-${index}`}
                                className="w-48 sm:w-56 flex-shrink-0 bg-gray-900 rounded-xl overflow-hidden border border-lime-500/10 hover:border-lime-500/30 transition-all duration-300"
                            >
                                <div className="aspect-square bg-gray-800 relative">
                                    {member.image_url ? (
                                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">Fotoğraf Yok</div>
                                    )}
                                </div>
                                <div className="p-3 text-center">
                                    <h3 className="text-white font-bold text-base line-clamp-1">{member.name}</h3>
                                    <p className="text-lime-400 text-xs line-clamp-1">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Team;
