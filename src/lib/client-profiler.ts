// Client-side profiling functions that call API endpoints
import { BehaviorData } from '@/types/profiling';

export const initProfile = async (userId: string) => {
  try {
    const response = await fetch('/api/profiling/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to initialize profile');
    }
    
    return data.profile;
  } catch (error) {
    console.error('Error initializing profile:', error);
    throw error;
  }
};

export const getNextProbe = async (userId: string, messageCount: number) => {
  try {
    const response = await fetch('/api/profiling/probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, messageCount })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get probe');
    }
    
    return data.probe;
  } catch (error) {
    console.error('Error getting probe:', error);
    return null;
  }
};

export const analyzeResponse = async (userId: string, probeId: string, response: string) => {
  try {
    const apiResponse = await fetch('/api/profiling/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, probeId, response })
    });
    
    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      throw new Error(data.error || 'Failed to analyze response');
    }
    
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing response:', error);
    throw error;
  }
};

export const trackBehavior = async (userId: string, behaviorData: BehaviorData) => {
  try {
    const response = await fetch('/api/profiling/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, behaviorData })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to track behavior');
    }
    
    return data.result;
  } catch (error) {
    console.error('Error tracking behavior:', error);
    throw error;
  }
};

export const getStrategy = async (userId: string) => {
  try {
    const response = await fetch('/api/profiling/strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get strategy');
    }
    
    return data.strategy;
  } catch (error) {
    console.error('Error getting strategy:', error);
    return null;
  }
};

export const getProfile = async (userId: string) => {
  try {
    const response = await fetch('/api/profiling/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get profile');
    }
    
    return data.profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};