const { SENSITIVE_KEYWORDS, REGEX_PATTERNS, RISK_LEVELS, RISK_SCORES, CATEGORY_RISK } = require('../config/rulesConfig');

class LeakageDetector {
  /**
   * Analyze content for sensitive data leakage
   */
  analyzeContent(content) {
    if (!content || typeof content !== 'string') {
      return {
        riskScore: 0,
        verdict: 'SAFE',
        detectedPatterns: [],
        matchedKeywords: [],
        categories: {},
        totalMatches: 0,
        confidence: 0
      };
    }

    const details = {
      ssn: [],
      creditCards: [],
      emails: [],
      phoneNumbers: [],
      apiKeys: [],
      privateKeys: [],
      jwtTokens: [],
      bearerTokens: [],
      ipAddresses: [],
      awsKeys: [],
      mongoUris: [],
      keywords: {}
    };

    const patterns = [];
    const categories = {};
    let riskScore = 0;
    const lowerContent = content.toLowerCase();

    // Check all regex patterns
    const regexChecks = [
      { key: 'ssn', pattern: REGEX_PATTERNS.ssn, type: 'SSN', category: 'financial', weight: 25 },
      { key: 'creditCards', pattern: REGEX_PATTERNS.creditCard, type: 'Credit Card', category: 'financial', weight: 30 },
      { key: 'emails', pattern: REGEX_PATTERNS.email, type: 'Email', category: 'personal', weight: 15 },
      { key: 'phoneNumbers', pattern: REGEX_PATTERNS.phoneNumber, type: 'Phone Number', category: 'personal', weight: 15 },
      { key: 'apiKeys', pattern: REGEX_PATTERNS.apiKey, type: 'API Key', category: 'credentials', weight: 35 },
      { key: 'privateKeys', pattern: REGEX_PATTERNS.privateKey, type: 'Private Key', category: 'credentials', weight: 40 },
      { key: 'jwtTokens', pattern: REGEX_PATTERNS.jwtToken, type: 'JWT Token', category: 'credentials', weight: 35 },
      { key: 'bearerTokens', pattern: REGEX_PATTERNS.bearerToken, type: 'Bearer Token', category: 'credentials', weight: 30 },
      { key: 'ipAddresses', pattern: REGEX_PATTERNS.ipAddress, type: 'IP Address', category: 'network', weight: 10 },
      { key: 'awsKeys', pattern: REGEX_PATTERNS.awsKey, type: 'AWS Key', category: 'credentials', weight: 40 },
      { key: 'mongoUris', pattern: REGEX_PATTERNS.mongoUri, type: 'Database URI', category: 'credentials', weight: 38 }
    ];

    for (const check of regexChecks) {
      const matches = content.match(check.pattern) || [];
      if (matches.length > 0) {
        details[check.key] = [...new Set(matches)];
        const matchCount = details[check.key].length;
        
        patterns.push({
          type: check.type,
          description: `${check.type} detected`,
          count: matchCount,
          category: check.category,
          risk: check.weight,
          matches: details[check.key].slice(0, 3) // Show first 3 matches
        });

        // Calculate weighted risk
        const weight = Math.min(matchCount, 5) * check.weight;
        riskScore += weight;

        // Track by category
        if (!categories[check.category]) {
          categories[check.category] = {
            count: 0,
            patterns: [],
            severity: CATEGORY_RISK[check.category] || 'MEDIUM'
          };
        }
        categories[check.category].count += matchCount;
        categories[check.category].patterns.push(check.type);
      }
    }

    // Check sensitive keywords across all categories
    Object.entries(SENSITIVE_KEYWORDS).forEach(([category, keywords]) => {
      if (!details.keywords[category]) {
        details.keywords[category] = [];
      }

      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex) || [];
        
        if (matches.length > 0) {
          details.keywords[category].push({
            keyword: keyword,
            count: matches.length
          });

          const keywordWeight = category === 'credentials' ? 20 : category === 'financial' ? 15 : 8;
          riskScore += keywordWeight * Math.min(matches.length, 3);

          // Track by category
          if (!categories[category]) {
            categories[category] = {
              count: 0,
              patterns: [],
              severity: CATEGORY_RISK[category] || 'MEDIUM'
            };
          }
          categories[category].count += matches.length;

          if (!patterns.find(p => p.keyword === keyword)) {
            patterns.push({
              type: 'Sensitive Keyword',
              keyword,
              category,
              count: matches.length,
              description: `Sensitive keyword "${keyword}" detected`
            });
          }
        }
      });
    });

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine verdict and confidence
    let verdict = 'SAFE';
    let confidence = 0;

    if (riskScore >= 80) {
      verdict = 'CRITICAL';
      confidence = 0.95;
    } else if (riskScore >= 60) {
      verdict = 'HIGH';
      confidence = 0.90;
    } else if (riskScore >= 40) {
      verdict = 'MEDIUM';
      confidence = 0.80;
    } else if (riskScore >= 20) {
      verdict = 'LOW';
      confidence = 0.70;
    } else {
      verdict = 'SAFE';
      confidence = 0.99;
    }

    return {
      riskScore,
      verdict,
      confidence,
      patterns,
      categories,
      sensitiveDataFound: patterns.length > 0,
      totalMatches: patterns.reduce((sum, p) => sum + p.count, 0),
      details,
    };
  }

  /**
   * Generate detailed report
   */
  generateReport(content, fileName = 'unknown') {
    const analysis = this.analyzeContent(content);
    
    return {
      fileName,
      timestamp: new Date().toISOString(),
      contentLength: content.length,
      ...analysis,
      recommendations: this.getRecommendations(analysis)
    };
  }

  /**
   * Get security recommendations based on analysis
   */
  getRecommendations(analysis) {
    const recommendations = [];

    if (analysis.riskScore > 80) {
      recommendations.push('🔴 CRITICAL: Do not share or store this file. Sensitive credentials detected.');
      recommendations.push('Take immediate action: Rotate exposed credentials/keys');
      recommendations.push('Report to security team immediately');
    } else if (analysis.riskScore > 60) {
      recommendations.push('🟠 HIGH RISK: Review and redact sensitive information before sharing');
      recommendations.push('Implement access controls for this file');
    } else if (analysis.riskScore > 40) {
      recommendations.push('🟡 MEDIUM RISK: Exercise caution when sharing');
      recommendations.push('Consider limiting access to authorized personnel only');
    } else if (analysis.riskScore > 20) {
      recommendations.push('⚪ LOW RISK: General caution recommended');
    }

    if (analysis.categories.credentials && analysis.categories.credentials.count > 0) {
      recommendations.push('⚠️ Credentials detected - ensure proper secret management');
    }

    if (analysis.categories.financial && analysis.categories.financial.count > 0) {
      recommendations.push('💳 Financial information detected - ensure PCI-DSS compliance');
    }

    if (analysis.categories.personal && analysis.categories.personal.count > 0) {
      recommendations.push('👤 Personal data detected - ensure GDPR/privacy compliance');
    }

    return recommendations;
  }
}

module.exports = new LeakageDetector();
