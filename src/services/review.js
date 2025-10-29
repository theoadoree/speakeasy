/**
 * ReviewService - Tracks user struggles and generates personalized review content
 *
 * This service maintains a history of user performance across lessons and quizzes,
 * identifies weak areas, and generates targeted review lessons using the LLM.
 */

import LLMService from './llm';

class ReviewService {
  constructor() {
    this.struggles = [];
    this.reviewLessons = [];
  }

  /**
   * Record a struggle event during a lesson or quiz
   * @param {Object} struggle - The struggle data
   * @param {string} struggle.type - Type: 'word', 'phrase', 'grammar', 'pronunciation', 'comprehension'
   * @param {string} struggle.content - The actual content user struggled with
   * @param {string} struggle.context - Surrounding context or sentence
   * @param {string} struggle.targetLanguage - Language being learned
   * @param {string} struggle.source - Source: 'lesson', 'quiz', 'practice', 'reading'
   * @param {number} struggle.timestamp - When it occurred
   * @param {Object} struggle.metadata - Additional data (e.g., attempts, correctAnswer)
   */
  recordStruggle(struggle) {
    const entry = {
      id: `struggle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      reviewed: false,
      ...struggle
    };

    this.struggles.push(entry);
    return entry;
  }

  /**
   * Get all struggles, optionally filtered
   * @param {Object} filters - Filter criteria
   * @param {boolean} filters.unreviewed - Only unreviewed struggles
   * @param {string} filters.type - Filter by type
   * @param {string} filters.source - Filter by source
   * @param {number} filters.since - Timestamp to filter from
   */
  getStruggles(filters = {}) {
    let filtered = [...this.struggles];

    if (filters.unreviewed) {
      filtered = filtered.filter(s => !s.reviewed);
    }

    if (filters.type) {
      filtered = filtered.filter(s => s.type === filters.type);
    }

    if (filters.source) {
      filtered = filtered.filter(s => s.source === filters.source);
    }

    if (filters.since) {
      filtered = filtered.filter(s => s.timestamp >= filters.since);
    }

    return filtered;
  }

  /**
   * Analyze struggles to identify patterns and weak areas
   * @returns {Object} Analysis with categories and priorities
   */
  analyzeStruggles() {
    const unreviewed = this.getStruggles({ unreviewed: true });

    if (unreviewed.length === 0) {
      return { weakAreas: [], totalStruggles: 0, priorityTopics: [] };
    }

    // Group by type
    const byType = {};
    unreviewed.forEach(struggle => {
      if (!byType[struggle.type]) {
        byType[struggle.type] = [];
      }
      byType[struggle.type].push(struggle);
    });

    // Identify weak areas with frequency
    const weakAreas = Object.entries(byType).map(([type, items]) => ({
      type,
      count: items.length,
      items: items.slice(0, 5), // Top 5 examples
      priority: items.length > 5 ? 'high' : items.length > 2 ? 'medium' : 'low'
    })).sort((a, b) => b.count - a.count);

    // Extract priority topics (most common content)
    const contentFrequency = {};
    unreviewed.forEach(struggle => {
      const key = struggle.content.toLowerCase();
      contentFrequency[key] = (contentFrequency[key] || 0) + 1;
    });

    const priorityTopics = Object.entries(contentFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([content, count]) => ({ content, count }));

    return {
      weakAreas,
      totalStruggles: unreviewed.length,
      priorityTopics,
      lastUpdated: Date.now()
    };
  }

  /**
   * Generate a personalized review lesson based on struggles
   * @param {Object} userProfile - User's learning profile
   * @param {string} targetLanguage - Language being learned
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated review lesson
   */
  async generateReviewLesson(userProfile, targetLanguage, options = {}) {
    const analysis = this.analyzeStruggles();

    if (analysis.totalStruggles === 0) {
      return {
        success: false,
        message: 'No struggles recorded yet. Complete some lessons first!'
      };
    }

    const {
      focusType = null, // Specific type to focus on, or null for mixed
      maxTopics = 5
    } = options;

    // Determine what to focus on
    let focusAreas;
    if (focusType) {
      focusAreas = analysis.weakAreas.filter(area => area.type === focusType);
    } else {
      // Mix of high and medium priority areas
      focusAreas = analysis.weakAreas.filter(area =>
        area.priority === 'high' || area.priority === 'medium'
      ).slice(0, 3);
    }

    if (focusAreas.length === 0) {
      focusAreas = analysis.weakAreas.slice(0, 1);
    }

    // Build prompt for LLM
    const strugglesContext = focusAreas.map(area => ({
      type: area.type,
      examples: area.items.map(item => ({
        content: item.content,
        context: item.context
      }))
    }));

    const prompt = `You are a language teacher creating a personalized review lesson.

Student Profile:
- Target Language: ${targetLanguage}
- Native Language: ${userProfile.nativeLanguage}
- Level: ${userProfile.level}
- Interests: ${userProfile.interests.join(', ')}

The student has struggled with the following areas:
${strugglesContext.map(area => `
${area.type.toUpperCase()}:
${area.examples.map((ex, i) => `  ${i + 1}. "${ex.content}" (in context: "${ex.context}")`).join('\n')}
`).join('\n')}

Create a focused review lesson that:
1. Addresses these specific weak areas
2. Provides clear explanations and examples
3. Includes practice exercises (5-7 questions)
4. Uses vocabulary from the student's struggle history
5. Maintains an encouraging, supportive tone

Format your response as JSON:
{
  "title": "Review lesson title",
  "focusAreas": ["area1", "area2"],
  "explanation": {
    "intro": "Brief introduction to what we'll review",
    "sections": [
      {
        "topic": "Topic name",
        "explanation": "Clear explanation",
        "examples": ["example1", "example2"]
      }
    ]
  },
  "exercises": [
    {
      "type": "multiple-choice|fill-blank|translation",
      "question": "The question",
      "options": ["A", "B", "C", "D"], // for multiple-choice
      "correctAnswer": "The correct answer",
      "explanation": "Why this is correct"
    }
  ],
  "summary": "Key takeaways from this review"
}`;

    try {
      const response = await LLMService.generateText(prompt, {
        temperature: 0.7,
        max_tokens: 2000
      });

      // Parse JSON response
      let lessonData;
      try {
        lessonData = JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, extract JSON from markdown code blocks
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          lessonData = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not parse LLM response as JSON');
        }
      }

      // Create lesson object
      const lesson = {
        id: `review_${Date.now()}`,
        type: 'review',
        generatedAt: Date.now(),
        basedOnStruggles: focusAreas.map(area => area.type),
        strugglesAddressed: focusAreas.reduce((sum, area) => sum + area.count, 0),
        ...lessonData
      };

      this.reviewLessons.push(lesson);
      return { success: true, lesson };

    } catch (error) {
      console.error('Error generating review lesson:', error);
      return {
        success: false,
        message: 'Failed to generate review lesson. Please check LLM connection.',
        error: error.message
      };
    }
  }

  /**
   * Mark struggles as reviewed after completing a review lesson
   * @param {string[]} struggleIds - IDs of struggles to mark as reviewed
   */
  markAsReviewed(struggleIds) {
    struggleIds.forEach(id => {
      const struggle = this.struggles.find(s => s.id === id);
      if (struggle) {
        struggle.reviewed = true;
        struggle.reviewedAt = Date.now();
      }
    });
  }

  /**
   * Mark all struggles related to a lesson as reviewed
   * @param {Object} lesson - The completed review lesson
   */
  markLessonComplete(lesson) {
    // Mark all unreviewed struggles of the focus types as reviewed
    const strugglesInLesson = this.struggles.filter(s =>
      !s.reviewed &&
      lesson.basedOnStruggles.includes(s.type)
    );

    this.markAsReviewed(strugglesInLesson.map(s => s.id));
  }

  /**
   * Get all generated review lessons
   * @param {number} limit - Maximum number to return
   */
  getReviewLessons(limit = 10) {
    return this.reviewLessons
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, limit);
  }

  /**
   * Load review data from storage
   * @param {Object} data - Stored review data
   */
  loadData(data) {
    if (data.struggles) {
      this.struggles = data.struggles;
    }
    if (data.reviewLessons) {
      this.reviewLessons = data.reviewLessons;
    }
  }

  /**
   * Export review data for storage
   * @returns {Object} Serializable review data
   */
  exportData() {
    return {
      struggles: this.struggles,
      reviewLessons: this.reviewLessons
    };
  }

  /**
   * Clear all review data (for testing or reset)
   */
  clearAll() {
    this.struggles = [];
    this.reviewLessons = [];
  }
}

// Export singleton instance
export default new ReviewService();
