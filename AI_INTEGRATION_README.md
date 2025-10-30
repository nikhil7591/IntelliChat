# IntelliChat AI Integration

This document explains how to integrate and use the AI analytics features in your IntelliChat application.

## Features Added

### 1. AI Analysis Types
- **Sentiment Analysis**: Analyze emotional tone and sentiment patterns
- **Topic Analysis**: Identify main conversation topics and themes  
- **Activity Patterns**: Analyze messaging patterns and user activity
- **User Engagement**: Measure user participation and engagement levels
- **Trend Predictions**: Predict future messaging patterns and trends
- **Chat Summary**: Generate comprehensive chat analysis summary

### 2. AI Chat Assistant
- Interactive AI assistant that can answer questions about conversations
- Real-time analysis results display
- User-friendly interface with analysis cards

## Backend Integration

### New Files Created:
- `backend/controllers/aiController.js` - AI analysis controller
- `backend/routes/aiRoute.js` - AI routes
- `WhatsAppChatAnalsys/analyze_chat.py` - Python analysis script

### API Endpoints:
- `GET /api/ai/analysis-types` - Get available analysis types
- `POST /api/ai/analyze` - Analyze conversation
- `POST /api/ai/send-message` - Send AI message

## Frontend Integration

### New Files Created:
- `frontend/src/services/ai.service.js` - AI service for API calls
- `frontend/src/pages/chatSection/AIChatWindow.jsx` - AI chat window component
- `frontend/src/store/aiStore.js` - AI state management

### Updated Files:
- `frontend/src/components/Layout.jsx` - Added AI mode support
- `frontend/src/components/Sidebar.jsx` - Added AI assistant button
- `frontend/src/store/layoutStore.js` - Added AI mode state
- `frontend/src/App.js` - Added AI route

## How to Use

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Using AI Features

1. **Access AI Assistant**: Click the robot icon (🤖) in the sidebar
2. **Select Analysis Type**: Choose from the available analysis cards
3. **View Results**: Analysis results will be displayed in a modal
4. **Ask Questions**: Use the AI chat input to ask questions about conversations

### 4. Analysis Types Explained

- **Sentiment Analysis**: Shows positive/negative/neutral message distribution
- **Topic Analysis**: Identifies main conversation themes using ML
- **Activity Patterns**: Shows peak hours, days, and messaging trends
- **User Engagement**: Measures how active each user is in conversations
- **Trend Predictions**: Uses Prophet to predict future messaging patterns
- **Chat Summary**: Provides comprehensive overview of conversation statistics

## Technical Details

### Python Integration
- Uses `child_process` to execute Python scripts from Node.js
- Python scripts analyze chat data using pandas, scikit-learn, and other ML libraries
- Results are returned as JSON for frontend consumption

### Real-time Features
- Socket.IO integration for real-time AI message delivery
- Live analysis progress indicators
- Instant result updates

### Security
- JWT authentication required for all AI endpoints
- User authorization checks for conversation access
- Secure file handling for temporary chat data

## Troubleshooting

### Common Issues:

1. **Python Import Errors**: Make sure all required Python packages are installed
   ```bash
   pip install -r WhatsAppChatAnalsys/requirements.txt
   ```

2. **Analysis Fails**: Check if conversation has enough messages (minimum 10)

3. **Backend Errors**: Check console logs for Python script execution errors

4. **Frontend Errors**: Check browser console for API call errors

### Dependencies Required:

**Backend:**
- Node.js with child_process (built-in)
- All existing dependencies

**Python:**
- pandas
- numpy
- scikit-learn
- matplotlib
- seaborn
- textblob
- nltk
- plotly
- prophet

## Future Enhancements

- More analysis types (emotion detection, personality analysis)
- Custom analysis parameters
- Export analysis results
- Historical analysis tracking
- Advanced ML models integration
