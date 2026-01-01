import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image_url: string;
    group_type: string;
    sub_group: string | null;
}

// Grup öncelik sıralaması
const GROUP_TYPES = [
    'Topluluk Başkanı',
    'Takım Kaptanı',
    'Ekip Kaptanı',
    'Ekip Mentörü',
    'Ekip Üyesi'
] as const;

// Ekip Üyesi ve Ekip Kaptanı alt grupları sıralaması
const SUB_GROUPS = [
    'Sponsorluk',
    'Mekanik',
    'Yazılım',
    'Donanım',
    'Motor'
] as const;
const Team = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [description, setDescription] = useState('Başarının arkasındaki güç');
    const [isAnimating, setIsAnimating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsAnimating(true);
                    if (scrollRef.current) {
                        observer.unobserve(scrollRef.current);
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (scrollRef.current) {
            observer.observe(scrollRef.current);
        }

        return () => {
            if (scrollRef.current) {
                observer.unobserve(scrollRef.current);
            }
        };
    }, [members.length]);

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

    // Üyeleri önce gruba göre, sonra alt gruba göre sırala
    const sortedMembers = [...members].sort((a, b) => {
        const aGroupIndex = GROUP_TYPES.indexOf(a.group_type as typeof GROUP_TYPES[number]);
        const bGroupIndex = GROUP_TYPES.indexOf(b.group_type as typeof GROUP_TYPES[number]);
        const aGroupPriority = aGroupIndex === -1 ? GROUP_TYPES.length : aGroupIndex;
        const bGroupPriority = bGroupIndex === -1 ? GROUP_TYPES.length : bGroupIndex;

        if (aGroupPriority !== bGroupPriority) return aGroupPriority - bGroupPriority;

        // Ekip Kaptanı için SADECE alt grup sıralaması (alfabetik yok)
        if (a.group_type === 'Ekip Kaptanı' && b.group_type === 'Ekip Kaptanı') {
            const aSubIndex = SUB_GROUPS.indexOf(a.sub_group as typeof SUB_GROUPS[number]);
            const bSubIndex = SUB_GROUPS.indexOf(b.sub_group as typeof SUB_GROUPS[number]);
            const aSubPriority = aSubIndex === -1 ? SUB_GROUPS.length : aSubIndex;
            const bSubPriority = bSubIndex === -1 ? SUB_GROUPS.length : bSubIndex;
            return aSubPriority - bSubPriority;
        }

        // Ekip Üyesi için alt grup alfabetik sıralaması
        if (a.group_type === 'Ekip Üyesi' && b.group_type === 'Ekip Üyesi') {
            const aSubGroup = a.sub_group || '';
            const bSubGroup = b.sub_group || '';
            const subGroupCompare = aSubGroup.localeCompare(bSubGroup, 'tr');
            if (subGroupCompare !== 0) return subGroupCompare;
        }

        return a.name.localeCompare(b.name, 'tr');
    });

    // Rotate array so president appears in center (4 members before)
    const rotatedMembers = [...sortedMembers.slice(-4), ...sortedMembers.slice(0, -4)];
    // Duplicate for seamless loop
    const marqueeMembers = [...rotatedMembers, ...rotatedMembers, ...rotatedMembers];

    return (
        <section id="takım" className="py-20 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation: marquee ${members.length * 2.24}s linear infinite;
                }
            `}</style>

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

            <div className="relative w-full" ref={scrollRef}>
                <div className="flex overflow-hidden">
                    <div className={`flex gap-6 ${isAnimating ? 'animate-marquee' : ''}`}>
                        {marqueeMembers.map((member, index) => (
                            <div
                                key={`${member.id}-${index}`}
                                className="w-48 sm:w-56 flex-shrink-0 bg-gray-900 rounded-xl overflow-hidden border border-lime-500/10 hover:border-lime-500/30 transition-colors"
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
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Team;
