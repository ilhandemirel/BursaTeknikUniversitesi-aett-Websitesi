import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Race {
    id: string;
    title: string;
    description: string;
    rank: string;
    image_url: string;
    year: string;
}

const RacesManager = () => {
    const [races, setRaces] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [currentRace, setCurrentRace] = useState<Partial<Race>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRaces();
    }, []);

    const fetchRaces = async () => {
        try {
            const { data, error } = await supabase
                .from('races')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRaces(data || []);
        } catch (err: any) {
            console.error('Error fetching races:', err);
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
        const filePath = `${fileName}`;

        setUploading(true);
        setError(null);

        try {
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setCurrentRace({ ...currentRace, image_url: publicUrl });
        } catch (err: any) {
            setError('Görsel yüklenirken hata oluştu: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (currentRace.id) {
                const { error } = await supabase
                    .from('races')
                    .update(currentRace)
                    .eq('id', currentRace.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('races')
                    .insert([currentRace]);
                if (error) throw error;
            }

            await fetchRaces();
            setIsEditing(false);
            setCurrentRace({});
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl?: string) => {
        if (!confirm('Bu yarışı silmek istediğinize emin misiniz?')) return;

        try {
            if (imageUrl) {
                const imageName = imageUrl.split('/').pop();
                if (imageName) {
                    await supabase.storage.from('images').remove([imageName]);
                }
            }

            const { error } = await supabase.from('races').delete().eq('id', id);
            if (error) throw error;

            setRaces(races.filter(race => race.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Yarış Yönetimi</h1>
                <button
                    onClick={() => {
                        setCurrentRace({});
                        setIsEditing(true);
                    }}
                    className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Yeni Yarış Ekle
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
                                {currentRace.id ? 'Yarışı Düzenle' : 'Yeni Yarış Ekle'}
                            </h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Yarış Adı
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={currentRace.title || ''}
                                        onChange={e => setCurrentRace({ ...currentRace, title: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Yıl
                                    </label>
                                    <input
                                        type="text"
                                        value={currentRace.year || ''}
                                        onChange={e => setCurrentRace({ ...currentRace, year: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Derece
                                </label>
                                <input
                                    type="text"
                                    value={currentRace.rank || ''}
                                    onChange={e => setCurrentRace({ ...currentRace, rank: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={currentRace.description || ''}
                                    onChange={e => setCurrentRace({ ...currentRace, description: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Görsel
                                </label>
                                <div className="space-y-4">
                                    {currentRace.image_url && (
                                        <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden border border-gray-700">
                                            <img
                                                src={currentRace.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCurrentRace({ ...currentRace, image_url: '' })}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-700">
                                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                            <span>{uploading ? 'Yükleniyor...' : 'Görsel Seç'}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                        <span className="text-sm text-gray-500">veya</span>
                                        <input
                                            type="url"
                                            placeholder="Görsel URL'si yapıştırın"
                                            value={currentRace.image_url || ''}
                                            onChange={e => setCurrentRace({ ...currentRace, image_url: e.target.value })}
                                            className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                        />
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
                                    {currentRace.id ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {races.map((race) => (
                    <div
                        key={race.id}
                        className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center group hover:border-lime-500/30 transition-colors"
                    >
                        <div className="w-full sm:w-32 h-32 sm:h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                            {race.image_url ? (
                                <img
                                    src={race.image_url}
                                    alt={race.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white truncate">{race.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {race.year && (
                                    <span className="text-gray-400 text-sm bg-gray-800 px-2 py-0.5 rounded">
                                        {race.year}
                                    </span>
                                )}
                                {race.rank && (
                                    <span className="text-lime-400 text-sm font-medium bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                                        {race.rank}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mt-2 line-clamp-1">{race.description}</p>
                        </div>

                        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => {
                                    setCurrentRace(race);
                                    setIsEditing(true);
                                }}
                                className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/40 transition-colors"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(race.id, race.image_url)}
                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/40 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {races.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                        Henüz hiç yarış eklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RacesManager;
