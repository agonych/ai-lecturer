const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate lecture content for a slide using AI
 * @param {string} slideContent - Content extracted from the slide
 * @param {string} basePrompt - Base prompt for the AI
 * @param {string} language - Target language for the lecture
 * @returns {string} Generated lecture script
 */
async function generateLectureContent(slideContent, basePrompt, language) {
  try {
    const systemPrompt = `You are an expert lecturer. Your task is to create an engaging and informative lecture script based on the provided slide content.

${basePrompt}

Requirements:
- Make it conversational and engaging
- Include relevant examples and explanations
- Ensure it flows naturally and is suitable for text-to-speech
- Target language: ${language}
- Keep it concise but comprehensive
- Make it sound like a natural lecture delivery

Slide Content:
${slideContent}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const generatedContent = completion.choices[0].message.content;
    
    // Clean up the generated content
    return cleanGeneratedContent(generatedContent);
    
  } catch (error) {
    console.error('AI content generation error:', error);
    
    // Fallback content if AI generation fails
    return generateFallbackContent(slideContent, language);
  }
}

/**
 * Generate multiple lecture scripts for a series of slides
 * @param {Array} slides - Array of slide objects
 * @param {string} basePrompt - Base prompt for the AI
 * @param {string} language - Target language for the lecture
 * @returns {Array} Array of generated scripts
 */
async function generateLectureContentBatch(slides, basePrompt, language) {
  try {
    const scripts = [];
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Add context about previous slides for continuity
      let contextPrompt = basePrompt;
      if (i > 0) {
        contextPrompt += `\n\nThis slide follows after slide ${i}. Ensure continuity with the previous content.`;
      }
      
      const script = await generateLectureContent(slide.content, contextPrompt, language);
      scripts.push({
        slideNumber: i + 1,
        script,
        content: slide.content
      });
      
      // Add delay to avoid rate limiting
      if (i < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return scripts;
    
  } catch (error) {
    console.error('Batch AI content generation error:', error);
    throw new Error('Failed to generate lecture content batch');
  }
}

/**
 * Clean up generated content
 * @param {string} content - Raw generated content
 * @returns {string} Cleaned content
 */
function cleanGeneratedContent(content) {
  return content
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\n+/g, ' ') // Replace multiple newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Generate fallback content if AI generation fails
 * @param {string} slideContent - Original slide content
 * @param {string} language - Target language
 * @returns {string} Fallback lecture script
 */
function generateFallbackContent(slideContent, language) {
  const languageGreetings = {
    english: 'Hello everyone,',
    russian: 'Здравствуйте,',
    spanish: 'Hola a todos,',
    french: 'Bonjour à tous,',
    german: 'Hallo zusammen,'
  };
  
  const greeting = languageGreetings[language] || languageGreetings.english;
  
  return `${greeting} today we will be discussing the following topic: ${slideContent.substring(0, 200)}. This is an important subject that we need to understand thoroughly. Let me explain the key points and provide some examples to help clarify the concepts.`;
}

/**
 * Validate AI-generated content
 * @param {string} content - Generated content to validate
 * @returns {boolean} Whether content is valid
 */
function validateGeneratedContent(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  if (content.length < 50) {
    return false;
  }
  
  if (content.length > 2000) {
    return false;
  }
  
  // Check for common AI generation issues
  const problematicPatterns = [
    /^I'm sorry/i,
    /^I cannot/i,
    /^I don't have access/i,
    /^As an AI/i
  ];
  
  return !problematicPatterns.some(pattern => pattern.test(content));
}

module.exports = {
  generateLectureContent,
  generateLectureContentBatch,
  validateGeneratedContent,
  cleanGeneratedContent
};
