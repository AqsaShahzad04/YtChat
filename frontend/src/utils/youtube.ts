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

/**
 * Fetches the transcript for a video directly from the browser using youtubei.js
 */
export const getTranscriptText = async (videoId: string): Promise<string> => {
    try {
        const yt = await Innertube.create();
        const info = await yt.getInfo(videoId);

        // Check if transcript is available
        const transcriptInfo = await info.getTranscript();

        if (!transcriptInfo || !transcriptInfo.transcript || !transcriptInfo.transcript.content) {
            throw new Error('No transcript available for this video.');
        }

        // Extract all transcript text into a single string
        const body = transcriptInfo.transcript.content.body;
        let fullText = '';

        if (body.initial_segments) {
            for (const segment of body.initial_segments) {
                if (segment.snippet && segment.snippet.text) {
                    fullText += segment.snippet.text + ' ';
                }
            }
        }

        return fullText.trim();
    } catch (err) {
        console.error('Error fetching transcript:', err);
        throw new Error('Could not fetch transcript. Make sure the video has captions enabled.');
    }
};
