import React, { useState, useEffect } from 'react';
import { Upload, Save, Loader2, Image as ImageIcon, Trash2, Info, FileText, Type, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AboutCard {
    title: string;
    description: string;
}

const SettingsManager = () => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
    const [aboutDescription, setAboutDescription] = useState('');
    const [aboutCards, setAboutCards] = useState<AboutCard[]>([
        { title: 'Yenilikçi', description: 'En son teknolojileri kullanarak sürdürülebilir çözümler üretiyoruz' },
        { title: 'Öğrenci Odaklı', description: '%100 öğrenci projesi olarak tamamen kendi kaynaklarımızla çalışıyoruz' },
        { title: 'Yarışmacı', description: 'Ulusal ve uluslararası yarışmalarda üniversitemizi başarıyla temsil ediyoruz' }
    ]);

    const [sectionDescriptions, setSectionDescriptions] = useState({
        team: '',
        vehicles: '',
        races: '',
        activities: '',
        sponsors: '',
        media: ''
    });

    const [introSettings, setIntroSettings] = useState({
        headlineStart: '',
        headlineHighlight: '',
        description1: '',
        description2: '',
        imageUrl: ''
    });

    const [heroSettings, setHeroSettings] = useState({
        subtitle: '',
        titleStart: '',
        titleHighlight: '',
        description: ''
    });

    const [socialLinks, setSocialLinks] = useState({
        instagram: '',
        twitter: '',
        linkedin: ''
    });

    const [contactInfo, setContactInfo] = useState({
        address: '',
        phone: '',
        email: ''
    });

    const [emailJsSettings, setEmailJsSettings] = useState({
        serviceId: '',
        templateId: '',
        publicKey: ''
    });


    const [sectionVisibility, setSectionVisibility] = useState({
        show_about: true,
        show_team: true,
        show_vehicles: true,
        show_races: true,
        show_activities: true,
        show_sponsors: true,
        show_media: true
    });

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingDesc, setSavingDesc] = useState(false);
    const [savingVis, setSavingVis] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', [
                    'logo_url',
                    'favicon_url',
                    'about_description',
                    'about_cards',
                    'desc_team',
                    'desc_vehicles',
                    'desc_races',
                    'desc_activities',
                    'desc_sponsors',
                    'desc_media',
                    'intro_headline_start',
                    'intro_headline_highlight',
                    'intro_description_1',
                    'intro_description_2',
                    'intro_image_url',
                    'hero_subtitle',
                    'hero_title_start',
                    'hero_title_highlight',
                    'hero_description',
                    'show_about',
                    'show_team',
                    'show_vehicles',
                    'show_races',
                    'show_activities',
                    'show_sponsors',
                    'show_media',
                    'social_instagram',
                    'social_twitter',
                    'social_linkedin',
                    'contact_address',
                    'contact_phone',
                    'contact_email',
                    'emailjs_service_id',
                    'emailjs_template_id',
                    'emailjs_public_key'
                ]);

            if (error) throw error;

            if (data) {
                const newDescriptions = { ...sectionDescriptions };

                data.forEach(setting => {
                    if (setting.key === 'logo_url') setLogoUrl(setting.value);
                    if (setting.key === 'favicon_url') setFaviconUrl(setting.value);
                    if (setting.key === 'about_description') setAboutDescription(setting.value || '');
                    if (setting.key === 'about_cards' && setting.value) {
                        try {
                            setAboutCards(JSON.parse(setting.value));
                        } catch (e) {
                            console.error('Error parsing about_cards', e);
                        }
                    }
                    if (setting.key === 'desc_team') newDescriptions.team = setting.value;
                    if (setting.key === 'desc_vehicles') newDescriptions.vehicles = setting.value;
                    if (setting.key === 'desc_races') newDescriptions.races = setting.value;
                    if (setting.key === 'desc_activities') newDescriptions.activities = setting.value;
                    if (setting.key === 'desc_sponsors') newDescriptions.sponsors = setting.value;
                    if (setting.key === 'desc_media') newDescriptions.media = setting.value;
                    if (setting.key === 'hero_subtitle') setHeroSettings(prev => ({ ...prev, subtitle: setting.value }));
                    if (setting.key === 'hero_title_start') setHeroSettings(prev => ({ ...prev, titleStart: setting.value }));
                    if (setting.key === 'hero_title_highlight') setHeroSettings(prev => ({ ...prev, titleHighlight: setting.value }));
                    if (setting.key === 'hero_description') setHeroSettings(prev => ({ ...prev, description: setting.value }));

                    if (setting.key === 'show_about') setSectionVisibility(prev => ({ ...prev, show_about: setting.value === 'true' }));
                    if (setting.key === 'show_team') setSectionVisibility(prev => ({ ...prev, show_team: setting.value === 'true' }));
                    if (setting.key === 'show_vehicles') setSectionVisibility(prev => ({ ...prev, show_vehicles: setting.value === 'true' }));
                    if (setting.key === 'show_races') setSectionVisibility(prev => ({ ...prev, show_races: setting.value === 'true' }));
                    if (setting.key === 'show_activities') setSectionVisibility(prev => ({ ...prev, show_activities: setting.value === 'true' }));
                    if (setting.key === 'show_sponsors') setSectionVisibility(prev => ({ ...prev, show_sponsors: setting.value === 'true' }));
                    if (setting.key === 'show_media') setSectionVisibility(prev => ({ ...prev, show_media: setting.value === 'true' }));
                    if (setting.key === 'social_instagram') setSocialLinks(prev => ({ ...prev, instagram: setting.value }));
                    if (setting.key === 'social_twitter') setSocialLinks(prev => ({ ...prev, twitter: setting.value }));
                    if (setting.key === 'social_linkedin') setSocialLinks(prev => ({ ...prev, linkedin: setting.value }));
                    if (setting.key === 'contact_address') setContactInfo(prev => ({ ...prev, address: setting.value }));
                    if (setting.key === 'contact_phone') setContactInfo(prev => ({ ...prev, phone: setting.value }));
                    if (setting.key === 'contact_email') setContactInfo(prev => ({ ...prev, email: setting.value }));
                    if (setting.key === 'emailjs_service_id') setEmailJsSettings(prev => ({ ...prev, serviceId: setting.value }));
                    if (setting.key === 'emailjs_template_id') setEmailJsSettings(prev => ({ ...prev, templateId: setting.value }));
                    if (setting.key === 'emailjs_public_key') setEmailJsSettings(prev => ({ ...prev, publicKey: setting.value }));
                    if (setting.key === 'intro_headline_start') setIntroSettings(prev => ({ ...prev, headlineStart: setting.value }));
                    if (setting.key === 'intro_headline_highlight') setIntroSettings(prev => ({ ...prev, headlineHighlight: setting.value }));
                    if (setting.key === 'intro_description_1') setIntroSettings(prev => ({ ...prev, description1: setting.value }));
                    if (setting.key === 'intro_description_2') setIntroSettings(prev => ({ ...prev, description2: setting.value }));
                    if (setting.key === 'intro_image_url') setIntroSettings(prev => ({ ...prev, imageUrl: setting.value }));
                });

                setSectionDescriptions(newDescriptions);
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'logo_url',
                    value: publicUrl,
                    type: 'image'
                }, { onConflict: 'key' });

            if (dbError) throw dbError;

            setLogoUrl(publicUrl);
            setSuccess('Logo başarıyla güncellendi!');
        } catch (err: any) {
            setError('Logo yüklenirken bir hata oluştu: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLogo = async () => {
        if (!confirm('Logoyu silmek istediğinize emin misiniz?')) return;

        setUploading(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .delete()
                .eq('key', 'logo_url');

            if (error) throw error;

            setLogoUrl(null);
            setSuccess('Logo başarıyla silindi.');
        } catch (err: any) {
            setError('Silme işlemi başarısız: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `favicon-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'favicon_url',
                    value: publicUrl,
                    type: 'image'
                }, { onConflict: 'key' });

            if (dbError) throw dbError;

            setFaviconUrl(publicUrl);
            setSuccess('Favicon başarıyla güncellendi! (Değişikliklerin görünmesi için sayfayı yenileyin)');
        } catch (err: any) {
            setError('Favicon yüklenirken bir hata oluştu: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFavicon = async () => {
        if (!confirm('Faviconu silmek istediğinize emin misiniz?')) return;

        setUploading(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .delete()
                .eq('key', 'favicon_url');

            if (error) throw error;

            setFaviconUrl(null);
            setSuccess('Favicon başarıyla silindi.');
        } catch (err: any) {
            setError('Silme işlemi başarısız: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveAbout = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'about_description', value: aboutDescription, type: 'text' },
                { key: 'about_cards', value: JSON.stringify(aboutCards), type: 'json' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('Hakkımızda bölümü güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDescriptions = async () => {
        setSavingDesc(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'desc_team', value: sectionDescriptions.team, type: 'text' },
                { key: 'desc_vehicles', value: sectionDescriptions.vehicles, type: 'text' },
                { key: 'desc_races', value: sectionDescriptions.races, type: 'text' },
                { key: 'desc_activities', value: sectionDescriptions.activities, type: 'text' },
                { key: 'desc_sponsors', value: sectionDescriptions.sponsors, type: 'text' },
                { key: 'desc_media', value: sectionDescriptions.media, type: 'text' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('Bölüm açıklamaları güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSavingDesc(false);
        }
    };

    const handleSaveVisibility = async () => {
        setSavingVis(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'show_about', value: String(sectionVisibility.show_about), type: 'boolean' },
                { key: 'show_team', value: String(sectionVisibility.show_team), type: 'boolean' },
                { key: 'show_vehicles', value: String(sectionVisibility.show_vehicles), type: 'boolean' },
                { key: 'show_races', value: String(sectionVisibility.show_races), type: 'boolean' },
                { key: 'show_activities', value: String(sectionVisibility.show_activities), type: 'boolean' },
                { key: 'show_sponsors', value: String(sectionVisibility.show_sponsors), type: 'boolean' },
                { key: 'show_media', value: String(sectionVisibility.show_media), type: 'boolean' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('Görünürlük ayarları güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSavingVis(false);
        }
    };

    const handleSaveHero = async () => {
        setSavingDesc(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'hero_subtitle', value: heroSettings.subtitle, type: 'text' },
                { key: 'hero_title_start', value: heroSettings.titleStart, type: 'text' },
                { key: 'hero_title_highlight', value: heroSettings.titleHighlight, type: 'text' },
                { key: 'hero_description', value: heroSettings.description, type: 'text' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('Hero bölümü güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSavingDesc(false);
        }
    };

    const handleSaveIntro = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'intro_headline_start', value: introSettings.headlineStart, type: 'text' },
                { key: 'intro_headline_highlight', value: introSettings.headlineHighlight, type: 'text' },
                { key: 'intro_description_1', value: introSettings.description1, type: 'text' },
                { key: 'intro_description_2', value: introSettings.description2, type: 'text' },
                { key: 'intro_image_url', value: introSettings.imageUrl, type: 'image' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('Hakkımızda (Üst Bölüm) güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleIntroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `intro-${Math.random()}.${fileExt}`;
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

            setIntroSettings(prev => ({ ...prev, imageUrl: publicUrl }));
        } catch (err: any) {
            setError('Görsel yüklenirken hata oluştu: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveSocialLinks = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'social_instagram', value: socialLinks.instagram, type: 'text' },
                { key: 'social_twitter', value: socialLinks.twitter, type: 'text' },
                { key: 'social_linkedin', value: socialLinks.linkedin, type: 'text' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('Sosyal medya bağlantıları güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveContact = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'contact_address', value: contactInfo.address, type: 'text' },
                { key: 'contact_phone', value: contactInfo.phone, type: 'text' },
                { key: 'contact_email', value: contactInfo.email, type: 'text' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('İletişim bilgileri güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEmailJs = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updates = [
                { key: 'emailjs_service_id', value: emailJsSettings.serviceId, type: 'text' },
                { key: 'emailjs_template_id', value: emailJsSettings.templateId, type: 'text' },
                { key: 'emailjs_public_key', value: emailJsSettings.publicKey, type: 'text' }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            setSuccess('EmailJS ayarları güncellendi.');
        } catch (err: any) {
            setError('Kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setPasswordLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            setSuccess('Şifreniz başarıyla güncellendi.');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError('Şifre güncellenirken hata oluştu: ' + err.message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleCardChange = (index: number, field: keyof AboutCard, value: string) => {
        const newCards = [...aboutCards];
        newCards[index] = { ...newCards[index], [field]: value };
        setAboutCards(newCards);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-lime-400" size={32} /></div>;
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Site Ayarları</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Logo Settings */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <ImageIcon className="text-lime-400" />
                        Logo Ayarları
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center bg-black/50 border-2 border-dashed border-gray-700 rounded-xl p-8 hover:border-lime-500/50 transition-colors">
                            {logoUrl ? (
                                <div className="text-center">
                                    <div className="h-16 mb-4 flex items-center justify-center">
                                        <img src={logoUrl} alt="Site Logo" className="h-full object-contain" />
                                    </div>
                                    <button
                                        onClick={handleDeleteLogo}
                                        className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 mx-auto"
                                    >
                                        <Trash2 size={16} />
                                        Logoyu Kaldır
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Upload className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>Logo Yükle</p>
                                </div>
                            )}
                        </div>

                        <label className="block w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <div className={`w-full bg-lime-500 text-black py-3 rounded-lg font-bold text-center cursor-pointer hover:bg-lime-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Yükleniyor...</span> : 'Görsel Seç'}
                            </div>
                        </label>
                    </div>
                </div>

                {/* Favicon Settings */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <ImageIcon className="text-lime-400" />
                        Favicon Ayarları
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center bg-black/50 border-2 border-dashed border-gray-700 rounded-xl p-8 hover:border-lime-500/50 transition-colors">
                            {faviconUrl ? (
                                <div className="text-center">
                                    <div className="h-16 w-16 mb-4 mx-auto flex items-center justify-center bg-white/10 rounded-lg">
                                        <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                                    </div>
                                    <button
                                        onClick={handleDeleteFavicon}
                                        className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 mx-auto"
                                    >
                                        <Trash2 size={16} />
                                        Faviconu Kaldır
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Upload className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>Favicon Yükle</p>
                                </div>
                            )}
                        </div>

                        <label className="block w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFaviconUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <div className={`w-full bg-lime-500 text-black py-3 rounded-lg font-bold text-center cursor-pointer hover:bg-lime-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Yükleniyor...</span> : 'Görsel Seç'}
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-lime-500/10 border border-lime-500 text-lime-500 p-4 rounded-lg">
                    {success}
                </div>
            )}

            {/* Section Visibility Settings */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Type className="text-lime-400" />
                        Bölüm Görünürlüğü
                    </h2>
                    <button
                        onClick={handleSaveVisibility}
                        disabled={savingVis}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {savingVis ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Kaydet</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-white font-medium">Kurumsal</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sectionVisibility.show_about}
                                onChange={e => setSectionVisibility({ ...sectionVisibility, show_about: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                    </div>
                    {/* Add other visibility toggles here if needed, keeping simple for now */}
                    <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-white font-medium">Takım</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sectionVisibility.show_team}
                                onChange={e => setSectionVisibility({ ...sectionVisibility, show_team: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-white font-medium">Araçlar</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sectionVisibility.show_vehicles}
                                onChange={e => setSectionVisibility({ ...sectionVisibility, show_vehicles: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-white font-medium">Yarışlar</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sectionVisibility.show_races}
                                onChange={e => setSectionVisibility({ ...sectionVisibility, show_races: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-white font-medium">Faaliyetler</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sectionVisibility.show_activities}
                                onChange={e => setSectionVisibility({ ...sectionVisibility, show_activities: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-white font-medium">Sponsorlar</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sectionVisibility.show_sponsors}
                                onChange={e => setSectionVisibility({ ...sectionVisibility, show_sponsors: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                        <span className="text-white font-medium">Medya</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sectionVisibility.show_media}
                                onChange={e => setSectionVisibility({ ...sectionVisibility, show_media: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Hero Section Settings */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Type className="text-lime-400" />
                        Hero Bölümü (Ana Sayfa Üst)
                    </h2>
                    <button
                        onClick={handleSaveHero}
                        disabled={savingDesc}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {savingDesc ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Kaydet</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Üst Başlık (Subtitle)
                        </label>
                        <input
                            type="text"
                            value={heroSettings.subtitle}
                            onChange={e => setHeroSettings({ ...heroSettings, subtitle: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="Örn: Bize Yapılan Yatırım"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Ana Başlık - Başlangıç
                            </label>
                            <input
                                type="text"
                                value={heroSettings.titleStart}
                                onChange={e => setHeroSettings({ ...heroSettings, titleStart: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                placeholder="Örn: Geleceğe Yapılan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Ana Başlık - Vurgu (Renkli)
                            </label>
                            <input
                                type="text"
                                value={heroSettings.titleHighlight}
                                onChange={e => setHeroSettings({ ...heroSettings, titleHighlight: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                placeholder="Örn: Yatırımdır"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Açıklama Metni
                        </label>
                        <textarea
                            rows={3}
                            value={heroSettings.description}
                            onChange={e => setHeroSettings({ ...heroSettings, description: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none resize-none"
                            placeholder="Örn: Bursa Teknik Üniversitesi Alternati..."
                        />
                    </div>
                </div>
            </div>

            {/* Intro Section Settings (NEW) */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <Info className="text-lime-500" size={24} />
                    <h2 className="text-xl font-bold text-white">Hakkımızda (Üst Bölüm)</h2>
                </div>
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Başlık (Normal Kısım)</label>
                            <textarea
                                rows={3}
                                value={introSettings.headlineStart}
                                onChange={(e) => setIntroSettings({ ...introSettings, headlineStart: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                placeholder="Örn: BTÜ'nün elektromobil ..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Başlık (Yeşil Vurgulu Kısım)</label>
                            <input
                                type="text"
                                value={introSettings.headlineHighlight}
                                onChange={(e) => setIntroSettings({ ...introSettings, headlineHighlight: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                placeholder="Örn: YILDIRIM takımıyız."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Açıklama 1 (Sağ Üst Metin)</label>
                        <textarea
                            rows={4}
                            value={introSettings.description1}
                            onChange={(e) => setIntroSettings({ ...introSettings, description1: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Açıklama 2 (Sağ Alt Metin)</label>
                        <textarea
                            rows={4}
                            value={introSettings.description2}
                            onChange={(e) => setIntroSettings({ ...introSettings, description2: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Sol Görsel</label>
                        <div className="flex items-center gap-4">
                            {introSettings.imageUrl && (
                                <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={introSettings.imageUrl} alt="Intro" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <label className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-700">
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                <span>{uploading ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleIntroImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSaveIntro}
                            disabled={saving}
                            className="bg-lime-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-lime-400 transition-colors flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>

            {/* Section Descriptions */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Type className="text-lime-400" />
                        Bölüm Açıklamaları
                    </h2>
                    <button
                        onClick={handleSaveDescriptions}
                        disabled={savingDesc}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {savingDesc ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Kaydet</span>
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Takım Bölümü</label>
                        <textarea
                            value={sectionDescriptions.team}
                            onChange={(e) => setSectionDescriptions({ ...sectionDescriptions, team: e.target.value })}
                            className="w-full h-20 bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                            placeholder="Başarının arkasındaki güç"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Araçlar Bölümü</label>
                        <textarea
                            value={sectionDescriptions.vehicles}
                            onChange={(e) => setSectionDescriptions({ ...sectionDescriptions, vehicles: e.target.value })}
                            className="w-full h-20 bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                            placeholder="Yüksek mühendislik ürünü yerli tasarım araçlarımız"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Yarışlar Bölümü</label>
                        <textarea
                            value={sectionDescriptions.races}
                            onChange={(e) => setSectionDescriptions({ ...sectionDescriptions, races: e.target.value })}
                            className="w-full h-20 bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                            placeholder="Katıldığımız ve derece aldığımız yarışlar"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Etkinlikler Bölümü</label>
                        <textarea
                            value={sectionDescriptions.activities}
                            onChange={(e) => setSectionDescriptions({ ...sectionDescriptions, activities: e.target.value })}
                            className="w-full h-20 bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                            placeholder="Yıl boyunca gerçekleştirdiğimiz etkinlikler"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Sponsorlar Bölümü</label>
                        <textarea
                            value={sectionDescriptions.sponsors}
                            onChange={(e) => setSectionDescriptions({ ...sectionDescriptions, sponsors: e.target.value })}
                            className="w-full h-20 bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                            placeholder="Bize destek olan kurum ve kuruluşlar"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Basında Biz Bölümü</label>
                        <textarea
                            value={sectionDescriptions.media}
                            onChange={(e) => setSectionDescriptions({ ...sectionDescriptions, media: e.target.value })}
                            className="w-full h-20 bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                            placeholder="Basında biz"
                        />
                    </div>
                </div>
            </div>


            {/* About Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Info className="text-lime-400" />
                        Hakkımızda Bölümü (Biz Kimiz?)
                    </h2>
                    <button
                        onClick={handleSaveAbout}
                        disabled={saving}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Kaydet</span>
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Main Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <FileText size={16} />
                            Ana Açıklama Metni
                        </label>
                        <textarea
                            value={aboutDescription}
                            onChange={(e) => setAboutDescription(e.target.value)}
                            className="w-full h-32 bg-black border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                            placeholder="Sürdürülebilir enerji ve teknoloji odaklı geleceği şekillendiren öğrencilerden oluşan dinamik bir topluluk"
                        />
                    </div>

                    {/* Feature Cards */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2">Özellik Kartları</h3>
                        <div className="grid gap-6">
                            {aboutCards.map((card, index) => (
                                <div key={index} className="bg-black/50 p-4 rounded-lg border border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lime-400 font-bold text-xl">#{index + 1}</span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Başlık</label>
                                            <input
                                                type="text"
                                                value={card.title}
                                                onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">Açıklama</label>
                                            <input
                                                type="text"
                                                value={card.description}
                                                onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Settings */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Info className="text-lime-400" />
                        İletişim Bilgileri
                    </h2>
                    <button
                        onClick={handleSaveContact}
                        disabled={saving}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Kaydet</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Adres
                        </label>
                        <textarea
                            rows={3}
                            value={contactInfo.address}
                            onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none resize-none"
                            placeholder="Adres bilgisi giriniz (HTML etiketi kullanabilirsiniz, örn: <br>)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Adres satırlarını ayırmak için &lt;br&gt; etiketi kullanabilirsiniz.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Telefon
                        </label>
                        <input
                            type="text"
                            value={contactInfo.phone}
                            onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="+90 224 300 30 00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            E-posta
                        </label>
                        <input
                            type="text"
                            value={contactInfo.email}
                            onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="aett@btu.edu.tr"
                        />
                    </div>
                </div>
            </div>

            {/* Social Media Settings */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Info className="text-lime-400" />
                        Sosyal Medya
                    </h2>
                    <button
                        onClick={handleSaveSocialLinks}
                        disabled={saving}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Kaydet</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Instagram URL
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">instagram.com/</span>
                            <input
                                type="text"
                                value={socialLinks.instagram}
                                onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg pl-32 pr-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                placeholder="kullaniciadi"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            X (Twitter) URL
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">x.com/</span>
                            <input
                                type="text"
                                value={socialLinks.twitter}
                                onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg pl-20 pr-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                placeholder="kullaniciadi"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            LinkedIn URL
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">linkedin.com/in/</span>
                            <input
                                type="text"
                                value={socialLinks.linkedin}
                                onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-lg pl-32 pr-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                                placeholder="kullaniciadi"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* EmailJS Settings */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Type className="text-lime-400" />
                        Email Bildirim Ayarları (EmailJS)
                    </h2>
                    <button
                        onClick={handleSaveEmailJs}
                        disabled={saving}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Kaydet</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Service ID
                        </label>
                        <input
                            type="text"
                            value={emailJsSettings.serviceId}
                            onChange={e => setEmailJsSettings({ ...emailJsSettings, serviceId: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="service_..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Template ID
                        </label>
                        <input
                            type="text"
                            value={emailJsSettings.templateId}
                            onChange={e => setEmailJsSettings({ ...emailJsSettings, templateId: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="template_..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Public Key
                        </label>
                        <input
                            type="text"
                            value={emailJsSettings.publicKey}
                            onChange={e => setEmailJsSettings({ ...emailJsSettings, publicKey: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="*************"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                    Bu bilgileri EmailJS panelinden ("Account &gt; API Keys") alabilirsiniz. Bu ayarları yapmazsanız iletişim formu sadece veritabanına kaydeder, mail atmaz.
                </p>
            </div>

            {/* Password Settings */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Lock className="text-lime-400" />
                        Şifre Değiştir
                    </h2>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="Yeni şifreniz"
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Yeni Şifre (Tekrar)
                        </label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-lime-500 focus:outline-none"
                            placeholder="Yeni şifrenizi tekrar girin"
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={passwordLoading || !passwordData.newPassword}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-400 transition-colors flex items-center gap-2 disabled:opacity-50 w-full justify-center sm:w-auto"
                    >
                        {passwordLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Şifreyi Güncelle</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsManager;
