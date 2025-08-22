/**
 * Advanced Deduplication Utilities
 * Implements Levenshtein distance for intelligent memory merging
 */

export class DeduplicationUtils {
  /**
   * Calculate Levenshtein distance between two strings
   * Returns normalized distance (0 = identical, 1 = completely different)
   */
  static levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length > 0 ? 1 : 0;
    if (b.length === 0) return a.length > 0 ? 1 : 0;

    // Dynamic programming matrix for edit distance
    const matrix = Array.from({length: a.length + 1}, () => Array(b.length + 1).fill(0));
    
    // Initialize base cases
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    
    // Fill matrix
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,        // Delete
          matrix[i][j-1] + 1,        // Insert  
          matrix[i-1][j-1] + cost    // Substitute
        );
      }
    }
    
    // Return normalized distance (0-1 scale)
    const maxLength = Math.max(a.length, b.length);
    return maxLength > 0 ? matrix[a.length][b.length] / maxLength : 0;
  }

  /**
   * Merge duplicate memories based on similarity threshold
   */
  static mergeDuplicateMemories(
    memories: Array<{content: string, score: number}>, 
    similarityThreshold: number = 0.8
  ): Array<{content: string, score: number}> {
    const merged: Array<{content: string, score: number}> = [];
    
    for (const memory of memories) {
      // Check if this memory is similar to any already merged
      const existingIndex = merged.findIndex(existing => {
        const distance = this.levenshteinDistance(existing.content, memory.content);
        return (1 - distance) >= similarityThreshold; // Convert to similarity
      });
      
      if (existingIndex >= 0) {
        // Merge with existing - keep higher score content
        if (memory.score > merged[existingIndex].score) {
          merged[existingIndex] = memory;
        }
        // Otherwise keep existing
      } else {
        // Add as new unique memory
        merged.push(memory);
      }
    }
    
    console.log(`[DEDUP] 🔄 Merged ${memories.length} → ${merged.length} memories (${((memories.length - merged.length) / memories.length * 100).toFixed(1)}% reduction)`);
    
    return merged;
  }

  /**
   * Remove near-duplicate strings from array
   */
  static removeDuplicateStrings(
    strings: string[], 
    similarityThreshold: number = 0.85
  ): string[] {
    if (strings.length <= 1) return strings;
    
    const unique: string[] = [];
    
    for (const str of strings) {
      // Check if this string is similar to any in unique array
      const isDuplicate = unique.some(existing => {
        const distance = this.levenshteinDistance(existing, str);
        return (1 - distance) >= similarityThreshold;
      });
      
      if (!isDuplicate) {
        unique.push(str);
      }
    }
    
    return unique;
  }

  /**
   * Smart content compression by merging similar patterns
   */
  static compressContent(
    contents: string[],
    maxLength: number = 1000
  ): string[] {
    if (contents.length === 0) return [];
    
    // First pass: remove near duplicates
    const deduplicated = this.removeDuplicateStrings(contents, 0.8);
    
    // Second pass: merge similar short snippets
    const grouped = this.groupSimilarContent(deduplicated, 0.7);
    
    // Third pass: truncate if needed
    const totalLength = grouped.join(' ').length;
    if (totalLength <= maxLength) {
      return grouped;
    }
    
    // Truncate from least important (end of array)
    const compressed: string[] = [];
    let currentLength = 0;
    
    for (const content of grouped) {
      if (currentLength + content.length + 1 <= maxLength) {
        compressed.push(content);
        currentLength += content.length + 1;
      } else {
        break;
      }
    }
    
    console.log(`[DEDUP] ✂️ Compressed ${totalLength} → ${currentLength} chars (${compressed.length}/${grouped.length} items)`);
    
    return compressed;
  }

  /**
   * Group similar content together for better compression
   */
  private static groupSimilarContent(
    contents: string[],
    threshold: number = 0.7
  ): string[] {
    const groups: string[][] = [];
    
    for (const content of contents) {
      // Find existing group this content belongs to
      let groupIndex = -1;
      for (let i = 0; i < groups.length; i++) {
        const representative = groups[i][0]; // Use first item as representative
        const similarity = 1 - this.levenshteinDistance(representative, content);
        if (similarity >= threshold) {
          groupIndex = i;
          break;
        }
      }
      
      if (groupIndex >= 0) {
        groups[groupIndex].push(content);
      } else {
        groups.push([content]);
      }
    }
    
    // Merge groups into single strings
    const merged = groups.map(group => {
      if (group.length === 1) {
        return group[0];
      } else {
        // Create combined summary for group
        const shortest = group.reduce((a, b) => a.length < b.length ? a : b);
        const additionalInfo = group.filter(item => item !== shortest)
          .map(item => this.extractUniqueInfo(item, shortest))
          .filter(info => info.length > 10)
          .join('; ');
        
        return additionalInfo ? `${shortest} (also: ${additionalInfo})` : shortest;
      }
    });
    
    return merged;
  }

  /**
   * Extract information from string B that's not in string A
   */
  private static extractUniqueInfo(stringB: string, stringA: string): string {
    const wordsA = new Set(stringA.toLowerCase().split(/\s+/));
    const wordsB = stringB.toLowerCase().split(/\s+/);
    
    const uniqueWords = wordsB.filter(word => !wordsA.has(word) && word.length > 2);
    
    return uniqueWords.slice(0, 5).join(' '); // Limit to prevent bloat
  }
}