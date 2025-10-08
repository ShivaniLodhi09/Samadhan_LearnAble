// Rate limiting for Gemini API calls
let lastGeminiCall = 0;
const GEMINI_RATE_LIMIT_MS = 2000; // 2 seconds between calls

export async function generateGeminiReply(prompt: string): Promise<string | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) return null;

    // Rate limiting: ensure at least 2 seconds between calls
    const now = Date.now();
    const timeSinceLastCall = now - lastGeminiCall;

    if (timeSinceLastCall < GEMINI_RATE_LIMIT_MS) {
        console.log(`Rate limiting: waiting ${GEMINI_RATE_LIMIT_MS - timeSinceLastCall}ms before next Gemini call`);
        await new Promise(resolve => setTimeout(resolve, GEMINI_RATE_LIMIT_MS - timeSinceLastCall));
    }

    lastGeminiCall = Date.now();

    try {
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(apiKey), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            })
        });

        if (!res.ok) {
            if (res.status === 429) {
                console.warn('Gemini API rate limit exceeded. Using fallback response.');
                return "I'm experiencing high demand right now. Please try again in a moment.";
            }
            console.error('Gemini API error:', res.status, res.statusText);
            return null;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
        return text ?? null;
    } catch (error) {
        console.error('Gemini API request failed:', error);
        return null;
    }
}




