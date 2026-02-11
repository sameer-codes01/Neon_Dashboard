const { YoutubeTranscript } = require('youtube-transcript');

async function testTranscript() {
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (Has manual captions)
    console.log(`Testing transcript extraction for: ${videoUrl}`);

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        console.log(`✅ Success! Found ${transcript.length} segments.`);
        console.log(`Preview: ${transcript[0].text}`);
    } catch (error) {
        console.error('❌ Error fetching transcript:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testTranscript();
