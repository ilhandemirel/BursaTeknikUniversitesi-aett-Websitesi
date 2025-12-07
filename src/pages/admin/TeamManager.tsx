import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image_url: string;
}

const TeamManager = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', role: '', image_url: '' });

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
        setLoading(false);
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
                setFormData({ name: '', role: '', image_url: '' });
                setEditingId(null);
                fetchMembers();
            }
        } else {
            const { error } = await supabase
                .from('team_members')
                .insert([formData]);

            if (!error) {
                setIsModalOpen(false);
                setFormData({ name: '', role: '', image_url: '' });
                fetchMembers();
            }
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingId(member.id);
        setFormData({
            name: member.name,
            role: member.role,
            image_url: member.image_url || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu üyeyi silmek istediğinize emin misiniz?')) {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (!error) {
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

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {members.map((member) => (
                    <div key={member.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group">
                        <div className="aspect-square bg-gray-800 relative">
                            {member.image_url ? (
                                <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">Fotoğraf Yok</div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-bold text-lg">{member.name}</h3>
                            <p className="text-lime-400 text-sm">{member.role}</p>
                        </div>
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
                                        setFormData({ name: '', role: '', image_url: '' });
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
