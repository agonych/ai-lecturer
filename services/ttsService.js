const OpenAI = require('openai');
const AWS = require('aws-sdk');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure AWS S3 for audio storage
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Language to voice mapping for OpenAI TTS
 */
const LANGUAGE_VOICES = {
  english: 'alloy',
  russian: 'echo', // OpenAI doesn't have specific Russian voices, using echo as fallback
  spanish: 'onyx',
  french: 'nova',
  german: 'shimmer'
};

/**
 * Generate speech from text using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @param {string} language - Target language
 * @returns {string} URL to the generated audio file
 */
async function generateSpeech(text, language) {
  try {
    // Clean and prepare text for TTS
    const cleanedText = prepareTextForTTS(text, language);
    
    // Select appropriate voice based on language
    const voice = LANGUAGE_VOICES[language] || 'alloy';
    
    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: cleanedText,
    });
    
    // Convert the response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Upload to S3
    const fileName = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `audio/${fileName}`,
      Body: buffer,
      ContentType: 'audio/mpeg',
      ACL: 'public-read'
    };
    
    const s3Result = await s3.upload(s3Params).promise();
    
    return s3Result.Location;
    
  } catch (error) {
    console.error('TTS generation error:', error);
    
    // Return a placeholder audio URL or throw error based on requirements
    throw new Error('Failed to generate speech');
  }
}

/**
 * Generate speech for multiple texts in batch
 * @param {Array} texts - Array of text objects with slideNumber and content
 * @param {string} language - Target language
 * @returns {Array} Array of audio URLs
 */
async function generateSpeechBatch(texts, language) {
  try {
    const results = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      
      try {
        const audioUrl = await generateSpeech(text.content, language);
        
        results.push({
          slideNumber: text.slideNumber,
          audioUrl,
          content: text.content
        });
        
        // Add delay to avoid rate limiting
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`TTS error for slide ${text.slideNumber}:`, error);
        
        // Add placeholder for failed generation
        results.push({
          slideNumber: text.slideNumber,
          audioUrl: null,
          content: text.content,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Batch TTS generation error:', error);
    throw new Error('Failed to generate speech batch');
  }
}

/**
 * Prepare text for TTS by cleaning and formatting
 * @param {string} text - Raw text
 * @param {string} language - Target language
 * @returns {string} Cleaned text suitable for TTS
 */
function prepareTextForTTS(text, language) {
  let cleanedText = text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters that might cause TTS issues
    .trim();
  
  // Language-specific text preparation
  switch (language) {
    case 'russian':
      // Ensure proper Russian text formatting
      cleanedText = cleanedText.replace(/[а-яё]/gi, char => char.toLowerCase());
      break;
      
    case 'german':
      // Ensure proper German text formatting
      cleanedText = cleanedText.replace(/ß/g, 'ss');
      break;
      
    default:
      // Default English formatting
      break;
  }
  
  // Limit text length for TTS (OpenAI has limits)
  if (cleanedText.length > 4000) {
    cleanedText = cleanedText.substring(0, 4000) + '...';
  }
  
  return cleanedText;
}

/**
 * Get audio duration estimate based on text length
 * @param {string} text - Text content
 * @param {string} language - Language (affects speaking rate)
 * @returns {number} Estimated duration in seconds
 */
function estimateAudioDuration(text, language) {
  // Average speaking rates (words per minute) by language
  const speakingRates = {
    english: 150,
    russian: 120,
    spanish: 140,
    french: 130,
    german: 125
  };
  
  const rate = speakingRates[language] || 150;
  const wordCount = text.split(/\s+/).length;
  
  return Math.ceil((wordCount / rate) * 60);
}

/**
 * Validate TTS parameters
 * @param {string} text - Text to validate
 * @param {string} language - Language to validate
 * @returns {Object} Validation result
 */
function validateTTSParameters(text, language) {
  const errors = [];
  
  if (!text || text.trim().length === 0) {
    errors.push('Text cannot be empty');
  }
  
  if (text.length > 4000) {
    errors.push('Text is too long for TTS (max 4000 characters)');
  }
  
  if (!LANGUAGE_VOICES[language]) {
    errors.push(`Unsupported language: ${language}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  generateSpeech,
  generateSpeechBatch,
  prepareTextForTTS,
  estimateAudioDuration,
  validateTTSParameters,
  LANGUAGE_VOICES
};
