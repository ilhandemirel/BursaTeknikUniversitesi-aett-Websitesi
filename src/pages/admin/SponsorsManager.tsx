import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Sponsor {
    id: string;
    name: string;
    logo_url: string;
    website_url: string;
}

const SponsorsManager = () => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [currentSponsor, setCurrentSponsor] = useState<Partial<Sponsor>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSponsors();
    }, []);

    const fetchSponsors = async () => {
        try {
            const { data, error } = await supabase
                .from('sponsors')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSponsors(data || []);
        } catch (err: any) {
            console.error('Error fetching sponsors:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `sponsors/${fileName}`; // Organize sponsors in a subfolder if desired, or root

        setUploading(true);
        setError(null);

        try {
            // Re-using 'images' bucket.
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setCurrentSponsor({ ...currentSponsor, logo_url: publicUrl });
        } catch (err: any) {
            setError('Logo yüklenirken hata oluştu: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (currentSponsor.id) {
                const { error } = await supabase
                    .from('sponsors')
                    .update(currentSponsor)
                    .eq('id', currentSponsor.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('sponsors')
                    .insert([currentSponsor]);
                if (error) throw error;
            }

            await fetchSponsors();
            setIsEditing(false);
            setCurrentSponsor({});
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, logoUrl?: string) => {
        if (!confirm('Bu sponsoru silmek istediğinize emin misiniz?')) return;

        try {
            if (logoUrl) {
                // Extract path from URL to delete from storage
                const urlParts = logoUrl.split('/storage/v1/object/public/images/');
                if (urlParts.length > 1) {
                    const storagePath = urlParts[1];
                    await supabase.storage.from('images').remove([storagePath]);
                }
            }

            const { error } = await supabase.from('sponsors').delete().eq('id', id);
            if (error) throw error;

            setSponsors(sponsors.filter(sponsor => sponsor.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Sponsor Yönetimi</h1>
                <button
                    onClick={() => {
                        setCurrentSponsor({});
                        setIsEditing(true);
                    }}
                    className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Yeni Sponsor Ekle
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {currentSponsor.id ? 'Sponsoru Düzenle' : 'Yeni Sponsor Ekle'}
                            </h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Sponsor Adı
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={currentSponsor.name || ''}
                                    onChange={e => setCurrentSponsor({ ...currentSponsor, name: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Web Sitesi (Opsiyonel)
                                </label>
                                <input
                                    type="url"
                                    value={currentSponsor.website_url || ''}
                                    onChange={e => setCurrentSponsor({ ...currentSponsor, website_url: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Logo
                                </label>
                                <div className="space-y-4">
                                    {currentSponsor.logo_url && (
                                        <div className="relative w-full h-32 bg-white/5 rounded-lg border border-gray-700 flex items-center justify-center p-4">
                                            <img
                                                src={currentSponsor.logo_url}
                                                alt="Preview"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCurrentSponsor({ ...currentSponsor, logo_url: '' })}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-700">
                                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                            <span>{uploading ? 'Yükleniyor...' : 'Logo Seç'}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-lime-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {currentSponsor.id ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sponsors.map((sponsor) => (
                    <div
                        key={sponsor.id}
                        className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center group hover:border-lime-500/30 transition-colors relative"
                    >
                        <div className="w-full aspect-[3/2] bg-white/5 rounded-lg mb-4 flex items-center justify-center p-4">
                            {sponsor.logo_url ? (
                                <img
                                    src={sponsor.logo_url}
                                    alt={sponsor.name}
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <div className="text-gray-600 font-bold">{sponsor.name}</div>
                            )}
                        </div>

                        <h3 className="text-white font-medium truncate w-full text-center">{sponsor.name}</h3>

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                                onClick={() => {
                                    setCurrentSponsor(sponsor);
                                    setIsEditing(true);
                                }}
                                className="p-1.5 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/40 transition-colors"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(sponsor.id, sponsor.logo_url)}
                                className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {sponsors.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                        Henüz hiç sponsor eklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SponsorsManager;
