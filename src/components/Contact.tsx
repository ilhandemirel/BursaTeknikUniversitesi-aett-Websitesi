import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

import emailjs from '@emailjs/browser';

const Contact = () => {
    const [contactInfo, setContactInfo] = useState({
        address: 'Bursa Teknik Üniversitesi<br />Mimar Sinan Yerleşkesi<br />Yıldırım/BURSA',
        phone: '+90 224 300 30 00',
        email: 'aett@btu.edu.tr'
    });

    const [emailJsConfig, setEmailJsConfig] = useState({
        serviceId: '',
        templateId: '',
        publicKey: ''
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        const { data } = await supabase
            .from('site_settings')
            .select('*')
            .in('key', [
                'contact_address',
                'contact_phone',
                'contact_email',
                'emailjs_service_id',
                'emailjs_template_id',
                'emailjs_public_key'
            ]);

        if (data) {
            const newInfo = { ...contactInfo };
            data.forEach(setting => {
                if (setting.key === 'contact_address') newInfo.address = setting.value;
                if (setting.key === 'contact_phone') newInfo.phone = setting.value;
                if (setting.key === 'contact_email') newInfo.email = setting.value;
            });
            const newEmailConfig = { ...emailJsConfig };

            data.forEach(setting => {
                if (setting.key === 'contact_address') newInfo.address = setting.value;
                if (setting.key === 'contact_phone') newInfo.phone = setting.value;
                if (setting.key === 'contact_email') newInfo.email = setting.value;

                if (setting.key === 'emailjs_service_id') newEmailConfig.serviceId = setting.value;
                if (setting.key === 'emailjs_template_id') newEmailConfig.templateId = setting.value;
                if (setting.key === 'emailjs_public_key') newEmailConfig.publicKey = setting.value;
            });
            setContactInfo(newInfo);
            setEmailJsConfig(newEmailConfig);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            // 1. Save to Database (First priority - Backup)
            const { error: dbError } = await supabase
                .from('contact_messages')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                }]);

            if (dbError) console.error('DB Save Error:', dbError);

            // 2. Send Email via EmailJS (If configured)
            if (emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey) {
                await emailjs.send(
                    emailJsConfig.serviceId,
                    emailJsConfig.templateId,
                    {
                        from_name: formData.name,
                        from_email: formData.email,
                        message: formData.message,
                        to_email: contactInfo.email
                    },
                    emailJsConfig.publicKey
                );
            }

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus(''), 5000);
        } catch (error) {
            console.error('Contact Form Error:', error);
            setStatus('error'); // Start showing error message
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <section id="iletişim" className="py-20 bg-black relative">
            <div className="absolute inset-0 bg-gradient-to-t from-lime-900/10 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">İletişim</span>
                    </h2>
                    <p className="text-gray-400 text-lg">Bizimle iletişime geçin</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-lime-400/10 rounded-lg flex items-center justify-center text-lime-400">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Adres</h3>
                                <p className="text-gray-400" dangerouslySetInnerHTML={{ __html: contactInfo.address }}></p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-lime-400/10 rounded-lg flex items-center justify-center text-lime-400">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">E-posta</h3>
                                <p className="text-gray-400">{contactInfo.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-lime-400/10 rounded-lg flex items-center justify-center text-lime-400">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Telefon</h3>
                                <p className="text-gray-400">{contactInfo.phone}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        onSubmit={handleSubmit}
                        className="space-y-6 bg-gray-900/50 p-8 rounded-2xl border border-lime-500/20"
                    >
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Ad Soyad</label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"
                                placeholder="Adınız Soyadınız"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">E-posta</label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"
                                placeholder="ornek@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Mesaj</label>
                            <textarea
                                id="message"
                                required
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"
                                placeholder="Mesajınız..."
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-gradient-to-r from-lime-400 to-lime-600 text-black font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-lime-500/50 transition-all duration-300 disabled:opacity-50"
                        >
                            {status === 'sending' ? 'Gönderiliyor...'
                                : status === 'success' ? 'Başarıyla Gönderildi!'
                                    : status === 'error' ? 'Bir Hata Oluştu (Yine de Kaydedildi)'
                                        : 'Gönder'}
                        </button>
                    </motion.form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
