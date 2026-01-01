import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

// Admin paneli için küçük boyutlu görsel URL'i oluştur (Supabase Render API)
const getThumbnailUrl = (url: string): string => {
    if (!url) return '';
    // Supabase Storage URL'i ise, render API'yi kullan
    if (url.includes('supabase.co/storage/v1/object/public/')) {
        // /storage/v1/object/public/bucket/path -> /storage/v1/render/image/public/bucket/path
        return url.replace(
            '/storage/v1/object/public/',
            '/storage/v1/render/image/public/'
        ) + '?width=150&height=150&resize=cover&quality=50';
    }
    return url;
};

// Supabase Storage'dan görsel dosya yolunu çıkar
const extractFilePath = (url: string): string | null => {
    if (!url) return null;
    // URL format: https://xxx.supabase.co/storage/v1/object/public/images/filename.jpg
    const match = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/);
    return match ? match[1] : null;
};

const TeamManager = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', role: '', image_url: '', group_type: 'Ekip Üyesi', sub_group: 'Donanım' as string | null });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setMembers(data);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `team-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);

        try {
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: publicUrl });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Görsel yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, image_url: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            const { error } = await supabase
                .from('team_members')
                .update(formData)
                .eq('id', editingId);

            if (!error) {
                setIsModalOpen(false);
                setFormData({ name: '', role: '', image_url: '', group_type: 'Ekip Üyesi', sub_group: 'Donanım' });
                setEditingId(null);
                fetchMembers();
            }
        } else {
            const { error } = await supabase
                .from('team_members')
                .insert([formData]);

            if (!error) {
                setIsModalOpen(false);
                setFormData({ name: '', role: '', image_url: '', group_type: 'Ekip Üyesi', sub_group: 'Donanım' });
                fetchMembers();
            }
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingId(member.id);
        setFormData({
            name: member.name,
            role: member.role,
            image_url: member.image_url || '',
            group_type: member.group_type || 'Ekip Üyesi',
            sub_group: member.sub_group || (member.group_type === 'Ekip Üyesi' ? 'Donanım' : null)
        });
        setIsModalOpen(true);
    };

    // Üyeleri gruba ve alt gruba göre sırala (Memoized)
    const groupedMembers = useMemo(() => {
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

        // Gruplara göre üyeleri grupla (Ekip Üyesi için alt gruplar dahil)
        return GROUP_TYPES.map(groupType => {
            if (groupType === 'Ekip Üyesi') {
                // Alt grupları alfabetik sırala
                const sortedSubGroups = [...SUB_GROUPS].sort((a, b) => a.localeCompare(b, 'tr'));
                // Alt grubu olan üyeler
                const subGroupsWithMembers: { subGroup: string; members: TeamMember[] }[] = sortedSubGroups.map(subGroup => ({
                    subGroup: subGroup as string,
                    members: sortedMembers.filter(m => m.group_type === 'Ekip Üyesi' && m.sub_group === subGroup)
                })).filter(sg => sg.members.length > 0);

                // Alt grubu olmayanlar (null veya boş)
                const unassignedMembers = sortedMembers.filter(m =>
                    m.group_type === 'Ekip Üyesi' && (!m.sub_group || m.sub_group === '')
                );

                // Atanmamış grup varsa ekle
                if (unassignedMembers.length > 0) {
                    subGroupsWithMembers.push({
                        subGroup: 'Atanmamış',
                        members: unassignedMembers
                    });
                }

                return {
                    groupType,
                    subGroups: subGroupsWithMembers,
                    members: [] as TeamMember[]
                };
            }
            return {
                groupType,
                subGroups: [],
                members: sortedMembers.filter(m => m.group_type === groupType)
            };
        }).filter(g => g.members.length > 0 || g.subGroups.length > 0);
    }, [members]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu üyeyi silmek istediğinize emin misiniz?')) {
            // Önce üyenin görselini bul
            const memberToDelete = members.find(m => m.id === id);
            const imagePath = memberToDelete?.image_url ? extractFilePath(memberToDelete.image_url) : null;

            // Veritabanından sil
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (!error) {
                // Görseli storage'dan sil (varsa)
                if (imagePath) {
                    await supabase.storage
                        .from('images')
                        .remove([imagePath]);
                }
                fetchMembers();
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Takım Yönetimi</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-lime-400 text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-lime-500 transition-colors"
                >
                    <Plus size={20} />
                    <span>Yeni Üye Ekle</span>
                </button>
            </div>

            {/* Bilgi notu */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-400 text-sm">
                    💡 <strong>Not:</strong> Buradaki fotoğraflar performans için düşük çözünürlükte gösterilmektedir.
                    Ana sayfada orijinal kalitede görüntülenecektir.
                </p>
            </div>

            {/* Gruplara göre üyeleri göster */}
            <div className="space-y-8">
                {groupedMembers.map(({ groupType, members: groupMembers, subGroups }) => (
                    <div key={groupType}>
                        <h2 className="text-xl font-bold text-lime-400 mb-4 border-b border-lime-400/20 pb-2">
                            {groupType} ({groupType === 'Ekip Üyesi' ? subGroups.reduce((acc, sg) => acc + sg.members.length, 0) : groupMembers.length})
                        </h2>

                        {/* Normal gruplar için */}
                        {groupMembers.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {groupMembers.map((member) => (
                                    <div key={member.id} className="team-card bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                                        <div className="aspect-square bg-gray-800">
                                            {member.image_url ? (
                                                <img src={getThumbnailUrl(member.image_url)} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">Fotoğraf Yok</div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-white font-bold text-sm truncate">{member.name}</h3>
                                            <p className="text-lime-400 text-xs truncate">{member.role}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleEdit(member)}
                                                    className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Ekip Üyesi alt grupları için */}
                        {subGroups.length > 0 && (
                            <div className="space-y-6 mt-4">
                                {subGroups.map(({ subGroup, members: subMembers }) => (
                                    <div key={subGroup}>
                                        <h3 className="text-lg font-semibold text-gray-300 mb-3 pl-2 border-l-2 border-lime-400/50">
                                            {subGroup} ({subMembers.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {subMembers.map((member) => (
                                                <div key={member.id} className="team-card bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                                                    <div className="aspect-square bg-gray-800">
                                                        {member.image_url ? (
                                                            <img src={getThumbnailUrl(member.image_url)} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600">Fotoğraf Yok</div>
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <h3 className="text-white font-bold text-sm truncate">{member.name}</h3>
                                                        <p className="text-lime-400 text-xs truncate">{member.role}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => handleEdit(member)}
                                                                className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(member.id)}
                                                                className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Üyeyi Düzenle' : 'Yeni Üye Ekle'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Ad Soyad</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Ünvan</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Grup</label>
                                <select
                                    required
                                    value={formData.group_type}
                                    onChange={(e) => {
                                        const newGroupType = e.target.value;
                                        setFormData({
                                            ...formData,
                                            group_type: newGroupType,
                                            sub_group: newGroupType === 'Ekip Üyesi' ? 'Donanım' : null
                                        });
                                    }}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                >
                                    {GROUP_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Alt Grup Seçimi - Sadece Ekip Üyesi için */}
                            {formData.group_type === 'Ekip Üyesi' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Alt Grup</label>
                                    <select
                                        required
                                        value={formData.sub_group || 'Donanım'}
                                        onChange={(e) => setFormData({ ...formData, sub_group: e.target.value })}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                    >
                                        {SUB_GROUPS.map((subGroup) => (
                                            <option key={subGroup} value={subGroup}>{subGroup}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Profil Fotoğrafı</label>

                                {formData.image_url ? (
                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700 group">
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
                                            >
                                                <X size={20} />
                                                Görseli Kaldır
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-800/50 hover:border-lime-400 transition-colors group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploading ? (
                                                <Loader2 className="animate-spin text-lime-400 mb-2" size={32} />
                                            ) : (
                                                <Upload className="text-gray-400 group-hover:text-lime-400 mb-2 transition-colors" size={32} />
                                            )}
                                            <p className="text-sm text-gray-400 group-hover:text-gray-300">
                                                {uploading ? 'Yükleniyor...' : 'Fotoğraf Yüklemek İçin Tıklayın'}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFormData({ name: '', role: '', image_url: '', group_type: 'Ekip Üyesi', sub_group: 'Donanım' });
                                        setEditingId(null);
                                    }}
                                    className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Yükleniyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManager;
