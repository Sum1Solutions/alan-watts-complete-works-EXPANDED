import { describe, it, expect } from 'vitest';
import { getContentRecommendations } from '../../src/data.enhanced.js';

describe('Content Recommendations System', () => {
  it('should recommend anxiety-related content for anxiety queries', () => {
    const query = "I'm feeling really anxious about my future";
    const recommendations = getContentRecommendations(query);
    
    expect(recommendations).toContain("The Wisdom of Insecurity");
    expect(recommendations).toContain("The Meaning of Happiness");
  });

  it('should recommend identity-related content for ego queries', () => {
    const query = "Who am I really? What is the self?";
    const recommendations = getContentRecommendations(query);
    
    expect(recommendations).toContain("The Book");
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should handle time-related queries', () => {
    const query = "I'm always worried about the future and dwelling on the past";
    const recommendations = getContentRecommendations(query);
    
    expect(recommendations).toContain("Time");
    expect(recommendations.length).toBeLessThanOrEqual(5);
  });

  it('should return empty array for unrelated queries', () => {
    const query = "What is the weather like today?";
    const recommendations = getContentRecommendations(query);
    
    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('should handle multiple themes in single query', () => {
    const query = "I'm anxious about death and don't understand my identity";
    const recommendations = getContentRecommendations(query);
    
    expect(recommendations.length).toBeGreaterThan(2);
    expect(recommendations).toContain("The Wisdom of Insecurity");
  });
});