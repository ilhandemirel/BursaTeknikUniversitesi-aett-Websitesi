import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords = [],
    image,
    url
}) => {
    const siteTitle = "Bursa Teknik Üniversitesi AETT";
    const defaultDescription = "Bursa Teknik Üniversitesi Alternatif Enerjili Taşıtlar Topluluğu (AETT), elektrikli araç teknolojileri üzerine çalışan öğrenci topluluğudur.";
    const defaultKeywords = ["btu", "bursa teknik üniversitesi", "btü", "aett", "yıldırım", "elektrikli araç"];
    const siteUrl = "https://aett.vercel.app";
    const defaultImage = `${siteUrl}/logo.png`; // Assuming there is a logo or fallback image

    const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const finalDescription = description || defaultDescription;
    const finalKeywords = [...defaultKeywords, ...keywords].join(", ");
    const finalImage = image || defaultImage;
    const finalUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={finalUrl} />
            <meta property="twitter:title" content={finalTitle} />
            <meta property="twitter:description" content={finalDescription} />
            <meta property="twitter:image" content={finalImage} />

            <link rel="canonical" href={finalUrl} />
        </Helmet>
    );
};

export default SEO;
