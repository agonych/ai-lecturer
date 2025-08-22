const pptxgen = require('pptxgenjs');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const AWS = require('aws-sdk');

// Configure AWS S3 for temporary image storage
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Process PPTX file and extract slides
 * @param {Buffer} buffer - PPTX file buffer
 * @returns {Array} Array of slide objects with content and image URLs
 */
async function processPPTX(buffer) {
  try {
    // For PPTX, we'll need to use a different approach since pptxgenjs is for creating, not reading
    // For now, we'll create a placeholder implementation
    // In production, you might want to use libraries like 'officegen' or 'mammoth' for better PPTX parsing
    
    const slides = [];
    
    // This is a simplified implementation
    // In a real scenario, you'd extract actual slide content and images
    slides.push({
      content: 'Slide content extracted from PPTX',
      imageUrl: await generateSlideImage('Slide 1', 1)
    });
    
    return slides;
  } catch (error) {
    console.error('PPTX processing error:', error);
    throw new Error('Failed to process PPTX file');
  }
}

/**
 * Process PDF file and extract slides
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Array} Array of slide objects with content and image URLs
 */
async function processPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    
    // Split PDF into logical sections (pages)
    const pages = text.split('\n\n').filter(page => page.trim().length > 0);
    
    const slides = [];
    
    for (let i = 0; i < pages.length; i++) {
      const pageContent = pages[i].trim();
      
      if (pageContent.length > 10) { // Only include pages with substantial content
        slides.push({
          content: pageContent,
          imageUrl: await generateSlideImage(pageContent.substring(0, 100), i + 1)
        });
      }
    }
    
    return slides;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to process PDF file');
  }
}

/**
 * Generate a slide image from content (placeholder implementation)
 * @param {string} content - Slide content
 * @param {number} slideNumber - Slide number
 * @returns {string} Image URL
 */
async function generateSlideImage(content, slideNumber) {
  try {
    // Create a simple image with the slide content
    const width = 800;
    const height = 600;
    
    // Create a simple SVG image
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
          Slide ${slideNumber}
        </text>
        <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
          ${content.substring(0, 50)}...
        </text>
      </svg>
    `;
    
    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
    
    // Upload to S3 (in production, you'd want to use a proper image hosting service)
    const fileName = `slide-${slideNumber}-${Date.now()}.png`;
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `slides/${fileName}`,
      Body: pngBuffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    };
    
    const s3Result = await s3.upload(s3Params).promise();
    return s3Result.Location;
    
  } catch (error) {
    console.error('Image generation error:', error);
    // Return a placeholder image URL
    return 'https://via.placeholder.com/800x600/f8f9fa/333?text=Slide+' + slideNumber;
  }
}

/**
 * Extract text content from a slide
 * @param {string} slideContent - Raw slide content
 * @returns {string} Cleaned text content
 */
function extractTextContent(slideContent) {
  // Remove extra whitespace and normalize
  return slideContent
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 1000); // Limit content length
}

module.exports = {
  processPPTX,
  processPDF,
  extractTextContent
};
