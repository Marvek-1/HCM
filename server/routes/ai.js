const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { authenticate } = require('../middleware/auth');

// @route   POST api/ai/analyze-outbreak
// @desc    Analyze outbreak data and recommend commodities
// @access  Private
router.post('/analyze-outbreak', authenticate, async (req, res) => {
  try {
    const { outbreakData } = req.body;
    
    if (!outbreakData) {
      return res.status(400).json({
        success: false,
        message: 'Outbreak data is required'
      });
    }

    const analysis = await aiService.analyzeOutbreak(outbreakData);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('AI Analysis Route Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST api/ai/chat
// @desc    Generic chat completion with Azure OpenAI
// @access  Private
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { messages, options } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    const completion = await aiService.generateChatCompletion(messages, options);
    
    res.json({
      success: true,
      data: completion
    });
  } catch (error) {
    console.error('AI Chat Route Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
