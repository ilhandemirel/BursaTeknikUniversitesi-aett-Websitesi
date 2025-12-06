import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    image_url: string;
    published_at: string;
}

const NewsManager = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '', image_url: '' });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false });

        if (!error && data) {
            setNews(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            const { error } = await supabase
                .from('news')
                .update(formData)
                .eq('id', editingId);

            if (!error) {
                setIsModalOpen(false);
                setFormData({ title: '', content: '', image_url: '' });
                setEditingId(null);
                fetchNews();
            }
        } else {
            const { error } = await supabase
                .from('news')
                .insert([formData]);

            if (!error) {
                setIsModalOpen(false);
                setFormData({ title: '', content: '', image_url: '' });
                fetchNews();
            }
        }
    };

    const handleEdit = (item: NewsItem) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            content: item.content,
            image_url: item.image_url || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu haberi silmek istediğinize emin misiniz?')) {
            const { error } = await supabase
                .from('news')
                .delete()
                .eq('id', id);

            if (!error) {
                fetchNews();
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Haber Yönetimi</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-lime-400 text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-lime-500 transition-colors"
                >
                    <Plus size={20} />
                    <span>Yeni Haber Ekle</span>
                </button>
            </div>

            <div className="space-y-4">
                {news.map((item) => (
                    <div key={item.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center gap-6 group">
                        <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Görsel Yok</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-lg truncate">{item.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-1 break-all">{item.content}</p>
                            <p className="text-gray-500 text-xs mt-1">{new Date(item.published_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-2xl border border-gray-800">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Başlık</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">İçerik</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Görsel URL</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                />
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFormData({ title: '', content: '', image_url: '' });
                                        setEditingId(null);
                                    }}
                                    className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-500 transition-colors"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsManager;
