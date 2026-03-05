import { Innertube } from 'youtubei.js/web';

/**
 * Extracts the 11-character video ID from any YouTube URL.
 */
export const extractVideoId = (url: string): string => {
    const pattern1 = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
    const pattern2 = /youtu\.be\/([0-9A-Za-z_-]{11})/;

    const match1 = url.match(pattern1);
    if (match1) return match1[1];

    const match2 = url.match(pattern2);
    if (match2) return match2[1];

    throw new Error('Invalid YouTube URL');
};

// CORS proxy to bypass browser restrictions
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Custom fetch function that routes YouTube requests through a CORS proxy
 * Handles the case where GET requests have body (not allowed in fetch API)
 */
async function proxyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = input.toString();

    // Only proxy YouTube requests
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        console.log('[Transcript] Proxying:', init?.method || 'GET', url.substring(0, 50) + '...');
        
        // Clone init to avoid modifying the original
        const safeInit = init ? { ...init } : {};
        
        // If there's a body and method is GET or undefined, convert to POST
        if (safeInit.body && (safeInit.method === 'GET' || !safeInit.method)) {
            console.log('[Transcript] Converting GET with body to POST');
            safeInit.method = 'POST';
            safeInit.headers = {
                ...safeInit.headers,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }

        const proxyUrl = CORS_PROXY + encodeURIComponent(url);
        
        try {
            return await fetch(proxyUrl, safeInit);
        } catch (e) {
            console.error('[Transcript] Proxy fetch failed:', e);
            // Try direct fetch as fallback (might still fail due to CORS)
            return fetch(url, safeInit);
        }
    }

    return fetch(url, init);
}

/**
 * Fetches the transcript for a video directly from the browser using youtubei.js
 * Uses a CORS proxy to bypass browser restrictions
 */
export const getTranscriptText = async (videoId: string): Promise<string> => {
    console.log('[Transcript] Starting fetch for video:', videoId);
    
    try {
        // Create Innertube instance with CORS proxy
        console.log('[Transcript] Creating Innertube instance with proxy...');
        const yt = await Innertube.create({
            fetch: proxyFetch
        });
        console.log('[Transcript] Innertube instance created');
        
        console.log('[Transcript] Fetching video info...');
        const info = await yt.getInfo(videoId);
        console.log('[Transcript] Got video info, title:', info.basic_info?.title);

        console.log('[Transcript] Fetching transcript...');
        const transcript = await info.getTranscript();
        console.log('[Transcript] Got transcript response');

        if (!transcript) {
            throw new Error('No transcript available for this video.');
        }

        // Extract transcript text
        let fullText = '';
        const transcriptContent = transcript.transcript?.content;
        
        if (transcriptContent?.body) {
            const body = transcriptContent.body;
            
            if (body.initial_segments) {
                console.log('[Transcript] Processing initial_segments:', body.initial_segments.length);
                for (const segment of body.initial_segments) {
                    if (segment.snippet?.text) {
                        fullText += segment.snippet.text + ' ';
                    }
                }
            }
            
            if (!fullText && 'segments' in body) {
                console.log('[Transcript] Trying segments fallback');
                const segments = (body as Record<string, unknown>).segments;
                if (Array.isArray(segments)) {
                    for (const segment of segments as Array<{ snippet?: { text?: string } }>) {
                        if (segment.snippet?.text) {
                            fullText += segment.snippet.text + ' ';
                        }
                    }
                }
            }
        }

        // Fallback to caption tracks
        if (!fullText && info.captions) {
            console.log('[Transcript] Trying caption tracks fallback');
            const captionsAny = info.captions as unknown as { caption_tracks?: Array<{ baseUrl?: string; languageCode?: string }> };
            const captionTracks = captionsAny.caption_tracks;
            
            if (captionTracks && captionTracks.length > 0) {
                console.log('[Transcript] Found caption tracks:', captionTracks.length);
                for (const track of captionTracks) {
                    try {
                        const captionUrl = track.baseUrl;
                        if (captionUrl) {
                            console.log('[Transcript] Fetching caption from:', captionUrl?.substring(0, 50) + '...');
                            const response = await proxyFetch(captionUrl);
                            const captionXml = await response.text();
                            
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(captionXml, 'text/xml');
                            const textElements = xmlDoc.getElementsByTagName('text');
                            
                            for (let i = 0; i < textElements.length; i++) {
                                fullText += textElements[i].textContent + ' ';
                            }
                            
                            if (fullText) {
                                console.log('[Transcript] Got text from caption track');
                                break;
                            }
                        }
                    } catch (e) {
                        console.warn('[Transcript] Caption fetch failed:', e);
                    }
                }
            }
        }

        if (!fullText.trim()) {
            console.error('[Transcript] No transcript text extracted');
            throw new Error('No transcript text could be extracted. The video may not have captions/subtitles available.');
        }

        console.log('[Transcript] Success! Transcript length:', fullText.length);
        return fullText.trim();
        
    } catch (err) {
        console.error('[Transcript] Error:', err);
        console.error('[Transcript] Error type:', typeof err);
        console.error('[Transcript] Error message:', err instanceof Error ? err.message : String(err));
        
        if (err instanceof Error) {
            throw err;
        }
        throw new Error('Could not fetch transcript. Make sure the video has captions enabled.');
    }
};
