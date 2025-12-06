import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Vehicle {
    id: string;
    name: string;
    specs: { label: string; value: string }[];
    image_url: string;
}

const VehicleManager = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        image_url: '',
        specs: [{ label: '', value: '' }]
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setVehicles(data);
        }
    };

    const handleAddSpec = () => {
        setFormData({
            ...formData,
            specs: [...formData.specs, { label: '', value: '' }]
        });
    };

    const handleSpecChange = (index: number, field: 'label' | 'value', value: string) => {
        const newSpecs = [...formData.specs];
        newSpecs[index][field] = value;
        setFormData({ ...formData, specs: newSpecs });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `vehicle-${Math.random()}.${fileExt}`;
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
        const { error } = await supabase
            .from('vehicles')
            .insert([formData]);

        if (!error) {
            setIsModalOpen(false);
            setFormData({ name: '', image_url: '', specs: [{ label: '', value: '' }] });
            fetchVehicles();
        } else {
            console.error('Error adding vehicle:', error);
            alert('Araç eklenirken bir hata oluştu.');
        }
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (window.confirm('Bu aracı silmek istediğinize emin misiniz?')) {
            // Optimistically can try to delete image from storage too if needed, 
            // but for now just deleting the record.

            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (!error) {
                fetchVehicles();
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Araç Yönetimi</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-lime-400 text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-lime-500 transition-colors"
                >
                    <Plus size={20} />
                    <span>Yeni Araç Ekle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group">
                        <div className="aspect-video bg-gray-800 relative">
                            {vehicle.image_url ? (
                                <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">Görsel Yok</div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(vehicle.id, vehicle.image_url)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-white mb-4">{vehicle.name}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {vehicle.specs.map((spec, idx) => (
                                    <div key={idx} className="bg-black/50 p-3 rounded-lg">
                                        <p className="text-gray-400 text-xs">{spec.label}</p>
                                        <p className="text-lime-400 font-bold">{spec.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-2xl border border-gray-800 my-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Yeni Araç Ekle</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Araç Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400"
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Araç Görseli</label>

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
                                                {uploading ? 'Yükleniyor...' : 'Görsel Yüklemek İçin Tıklayın'}
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

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-400">Teknik Özellikler</label>
                                    <button
                                        type="button"
                                        onClick={handleAddSpec}
                                        className="text-lime-400 text-sm hover:text-lime-300"
                                    >
                                        + Özellik Ekle
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.specs.map((spec, index) => (
                                        <div key={index} className="flex space-x-4">
                                            <input
                                                type="text"
                                                placeholder="Özellik (örn: Hız)"
                                                value={spec.label}
                                                onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                                                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Değer (örn: 100 km/h)"
                                                value={spec.value}
                                                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
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

export default VehicleManager;
