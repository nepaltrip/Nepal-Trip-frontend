import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, type = "website", url }) {
    return (
        <Helmet>
            {/* Standard SEO Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Facebook / Open Graph Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {url && <meta property="og:url" content={url} />}

            {/* Twitter Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
}