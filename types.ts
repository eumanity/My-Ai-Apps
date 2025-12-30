
export interface VideoResult {
  id: string;
  url: string;
  title: string;
  channelName: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  transcript?: string;
  summary?: string;
  segments?: Array<{
    time: string;
    text: string;
  }>;
  metadata?: {
    views?: string;
    date?: string;
  };
  groundingUrls?: Array<{
    title: string;
    url: string;
  }>;
}

export interface TranscriptionExport {
  projectName: string;
  timestamp: string;
  videos: VideoResult[];
  count: number;
}

// Added to resolve import errors in components/VideoCard.tsx and components/AnalysisView.tsx
export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  isOutlier?: boolean;
  views: number;
  publishedAt?: string;
  zScore: number;
}

export interface StoryStep {
  phase: string;
  timing: string;
  description: string;
  purpose: string;
}

export interface VideoAnalysis {
  aiPromptContext: string;
  storyStructure: StoryStep[];
  fullScriptOutline: string;
  retentionHooks: string[];
  engagementTriggers: string[];
  keyPoints: string[];
  transcriptSnippet: string;
}
