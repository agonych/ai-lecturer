# AI Lecturer

An AI-powered lecture generation platform that transforms PowerPoint presentations and PDFs into engaging, narrated lectures using OpenAI's AI and text-to-speech capabilities.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **File Upload**: Support for PPTX and PDF files up to 10MB
- **AI Content Generation**: Automatically generates lecture scripts based on slide content
- **Multi-language Support**: Generate lectures in English, Russian, Spanish, French, and German
- **Text-to-Speech**: High-quality audio narration using OpenAI's TTS API
- **Cloud Storage**: Secure file storage using AWS S3
- **Real-time Processing**: Live progress tracking during lecture generation
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **Lecture Player**: Interactive lecture viewer with synchronized slides and audio

## 🏗️ Architecture

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: AWS S3
- **AI Services**: OpenAI GPT-4 and TTS APIs
- **Frontend**: React with Tailwind CSS
- **Authentication**: JWT-based authentication
- **File Processing**: PDF parsing and slide extraction

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- AWS S3 account
- OpenAI API key
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-lecturer
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-lecturer

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Base AI Prompt for Lecture Generation
BASE_LECTURE_PROMPT=You are an expert lecturer. Based on the provided slide content, create an engaging and informative lecture script. Make it conversational, include examples, and ensure it flows naturally from one slide to the next. The script should be suitable for text-to-speech conversion.

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pptx,pdf
```

### 5. Database Setup

Ensure MongoDB is running and accessible. The application will automatically create the necessary collections.

### 6. AWS S3 Setup

1. Create an S3 bucket for file storage
2. Configure CORS settings for your bucket
3. Create an IAM user with S3 access permissions
4. Update the environment variables with your credentials

### 7. OpenAI API Setup

1. Sign up for OpenAI API access
2. Generate an API key
3. Add the key to your environment variables

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Start the frontend development server:**
   ```bash
   npm run client
   ```

3. **Or run both simultaneously:**
   ```bash
   npm run dev & npm run client
   ```

### Production Mode

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## 📱 Usage

### 1. User Registration
- Create an account with email, username, and password
- Select your preferred language

### 2. Creating a Lecture
- Navigate to "Create Lecture"
- Enter lecture name and select target language
- Upload PPTX or PDF file (max 10MB)
- Add optional AI instructions for customization
- Submit and wait for processing

### 3. Lecture Processing
- File upload to S3
- Content extraction from slides
- AI-generated lecture scripts
- Text-to-speech audio generation
- Progress tracking throughout the process

### 4. Viewing Lectures
- Access completed lectures from dashboard
- Play synchronized slides with audio narration
- View AI-generated transcripts
- Navigate between slides

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Lectures
- `GET /api/lectures` - Get user's lectures
- `POST /api/lectures` - Create new lecture
- `GET /api/lectures/:id` - Get specific lecture
- `PUT /api/lectures/:id` - Update lecture
- `DELETE /api/lectures/:id` - Delete lecture

### File Upload
- `POST /api/upload/lecture/:id` - Upload lecture file
- `GET /api/upload/progress/:id` - Get upload progress

## 🏗️ Project Structure

```
ai-lecturer/
├── client/                 # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind configuration
├── models/                 # Database models
├── routes/                 # API routes
├── services/               # Business logic services
├── middleware/             # Express middleware
├── server.js               # Main server file
├── package.json            # Backend dependencies
└── README.md               # Project documentation
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

## 🎨 UI/UX Features

- Responsive design for all devices
- Modern, clean interface with Tailwind CSS
- Loading states and progress indicators
- Toast notifications for user feedback
- Intuitive navigation and user flow
- Accessibility considerations

## 🚀 Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Docker (Recommended)
The easiest way to run the application is using Docker:

1. **Quick Start:**
   ```bash
   # Start production environment
   ./deploy.sh start          # Linux/Mac
   deploy.bat start           # Windows
   
   # Start development environment
   ./deploy.sh start-dev      # Linux/Mac
   deploy.bat start-dev       # Windows
   ```

2. **Manual Docker commands:**
   ```bash
   # Build and start
   docker compose up -d
   
   # View logs
   docker compose logs -f
   
   # Stop
   docker compose down
   ```

3. **For detailed Docker instructions, see [DOCKER_README.md](DOCKER_README.md)**

### VPS/Cloud
1. Set up Node.js environment
2. Configure PM2 for process management
3. Set up Nginx reverse proxy
4. Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- Video lecture generation
- More language support
- Advanced AI customization options
- Collaborative lecture creation
- Analytics and insights
- Mobile app development
- Integration with LMS platforms

## 📊 Performance Considerations

- File size limits for optimal processing
- Rate limiting for API endpoints
- Efficient database queries with indexing
- CDN integration for static assets
- Caching strategies for improved response times

---

**Built with ❤️ using modern web technologies**
