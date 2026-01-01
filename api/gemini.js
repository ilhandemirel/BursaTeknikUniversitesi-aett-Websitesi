
// ... (previous content logic)

export default async function handler(request, response) {
    // CORS configuration
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = request.body;
        // Trim API key to avoid copy-paste errors
        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

        if (!prompt) return response.status(400).json({ error: 'Prompt is required' });
        if (!apiKey) return response.status(500).json({ error: 'Configuration Error', details: 'GEMINI_API_KEY missing' });

        // 1. DYNAMIC MODEL DISCOVERY (Raw HTTP)
        // We list models available for this API key and pick the first one that supports content generation.
        // This avoids hardcoding model names that might not be available or require specific SDK versions.
        console.log("Auto-discovering available models...");
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) {
            const errorText = await listResponse.text();
            throw new Error(`Failed to list models: ${listResponse.status} ${errorText}`);
        }

        const listData = await listResponse.json();

        // Find the best model: must support 'generateContent' and preferably be '1.5-flash' or 'pro'
        let chosenModel = listData.models?.find(m =>
            m.name.includes('gemini-1.5-flash') &&
            m.supportedGenerationMethods.includes('generateContent')
        );

        // Fallback: any Gemini model
        if (!chosenModel) {
            chosenModel = listData.models?.find(m =>
                m.name.includes('gemini') &&
                m.supportedGenerationMethods.includes('generateContent')
            );
        }

        if (!chosenModel) {
            console.error("Available models:", JSON.stringify(listData, null, 2));
            throw new Error("No compatible Gemini model found for your API Key.");
        }

        const modelName = chosenModel.name.split('/').pop(); // e.g. "gemini-1.5-flash"
        console.log(`Selected Model: ${modelName}`);

        // 2. GENERATE CONTENT (Raw HTTP)
        const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const generateResponse = await fetch(generateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!generateResponse.ok) {
            const errorText = await generateResponse.text();
            throw new Error(`Generation failed (${modelName}): ${generateResponse.status} ${errorText}`);
        }

        const genData = await generateResponse.json();

        // Extract text safely
        const generatedText = genData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error("API returned success but no text content found.");
        }

        return response.status(200).json({ text: generatedText, usedModel: modelName });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return response.status(500).json({
            error: 'AI Generation Failed',
            details: error.message
        });
    }
}
