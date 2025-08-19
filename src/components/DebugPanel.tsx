"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp, AlertCircle, Activity, Eye, DollarSign, Heart, Shield, Zap } from "lucide-react";

interface DebugPanelProps {
  userId: string;
  profile: any;
  events: any[];
  probeQueue: any[];
  messageCount: number;
}

export default function DebugPanel({ userId, profile, events, probeQueue, messageCount }: DebugPanelProps) {
  if (!profile) {
    return (
      <Card className="bg-black/40 border-purple-500/20">
        <CardContent className="p-6">
          <p className="text-gray-400">Initializing profile...</p>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-green-400';
    if (confidence > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreColor = (score: number, reverse = false) => {
    const high = reverse ? score < 30 : score > 70;
    const medium = reverse ? score < 60 : score > 40;
    
    if (high) return 'bg-green-500';
    if (medium) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] overflow-y-auto pr-2">
      {/* User Profile Panel */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Current Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Vulnerability:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{profile.vulnerability}</span>
                <span className={`text-xs ${getConfidenceColor(profile.confidence)}`}>
                  ({(profile.confidence * 100).toFixed(0)}% conf)
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-400">Ego Type:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{profile.ego}</span>
                {profile.ego === 'HERO' && <Shield className="w-4 h-4 text-blue-400" />}
                {profile.ego === 'ALPHA' && <Zap className="w-4 h-4 text-red-400" />}
                {profile.ego === 'PROVIDER' && <DollarSign className="w-4 h-4 text-green-400" />}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Attachment:</span>
              <span className="text-white font-semibold ml-2">{profile.attachment}</span>
            </div>
            <div>
              <span className="text-gray-400">Leverage:</span>
              <span className="text-white font-semibold ml-2">{profile.leverage}</span>
            </div>
            <div>
              <span className="text-gray-400">Spender Level:</span>
              <span className="text-white font-semibold ml-2">
                {profile.spenderLevel} 
                {profile.estimatedValue > 0 && (
                  <span className="text-green-400 ml-1">
                    (${profile.estimatedValue}/mo)
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Data Points:</span>
              <span className="text-white font-semibold ml-2">{profile.dataPoints}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-sm">Conversion Probability</span>
              <span className="text-white font-semibold">
                {(profile.conversionProbability * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={profile.conversionProbability * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Metrics */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Behavioral Metrics (Live)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Response Time</span>
                <span className="text-white">{(profile.responseTime / 1000).toFixed(1)}s avg</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Hesitation</span>
                <span className="text-white">{(profile.hesitationLevel * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-sm">Engagement Score</span>
                <span className="text-white text-sm font-semibold">{profile.engagementScore}/100</span>
              </div>
              <Progress value={profile.engagementScore} className={`h-2`} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-sm">Manipulability</span>
                <span className="text-white text-sm font-semibold">{profile.manipulabilityScore}/100</span>
              </div>
              <Progress value={profile.manipulabilityScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Psychological Insights */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-pink-400" />
            Psychological Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile.insights && Object.entries(profile.insights).map(([key, value]: [string, any]) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-sm capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-white text-sm font-semibold">
                  {value}/100
                  {key === 'self_esteem' && value < 40 && (
                    <span className="text-red-400 ml-2">(LOW)</span>
                  )}
                </span>
              </div>
              <Progress 
                value={value} 
                className={`h-2 ${key === 'self_esteem' ? '[&>div]:bg-red-500' : ''}`} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Probe Queue */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            Probe Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {probeQueue && probeQueue.length > 0 ? (
            <div className="space-y-2">
              {probeQueue.map((probe, idx) => (
                <div key={probe.id} className="p-2 bg-gray-900 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-purple-400">{probe.id}</span>
                    <Badge variant="outline" className="text-xs">
                      Phase {probe.phase}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-xs italic">"{probe.question}"</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="text-xs">{probe.category}</Badge>
                    {!probe.asked && (
                      <span className="text-yellow-400 text-xs">
                        ⏳ Inject at msg #{messageCount + 2}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No probes queued for current phase</p>
          )}
        </CardContent>
      </Card>

      {/* Strategy Recommendations */}
      {profile.strategy && (
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Strategy Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Current Strategy:</span>
              <p className="text-white font-semibold">{profile.recommendedStrategy}</p>
            </div>
            {profile.strategy?.tactics && (
              <div>
                <span className="text-gray-400 text-sm">Recommended Tactics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.strategy.tactics.map((tactic: string) => (
                    <Badge key={tactic} variant="secondary" className="text-xs">
                      {tactic.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Est. Revenue:</span>
                <span className="text-green-400 font-semibold ml-2">
                  ${profile.strategy?.estimatedRevenue || 0}/mo
                </span>
              </div>
              <div>
                <span className="text-gray-400">Confidence:</span>
                <span className={`font-semibold ml-2 ${getConfidenceColor(profile.strategy?.confidence || 0)}`}>
                  {((profile.strategy?.confidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Statements */}
      {profile.keyStatements && profile.keyStatements.length > 0 && (
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              Key Statements & Triggers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Key Statements:</span>
              <ul className="mt-1 space-y-1">
                {profile.keyStatements.map((statement: string, idx: number) => (
                  <li key={idx} className="text-white text-sm">• {statement}</li>
                ))}
              </ul>
            </div>
            {profile.triggerWords && profile.triggerWords.length > 0 && (
              <div>
                <span className="text-gray-400 text-sm">Trigger Words Detected:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.triggerWords.map((word: string) => (
                    <Badge key={word} variant="destructive" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Event Stream */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Live Event Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {events.length > 0 ? (
              events.slice(0, 20).map((event, idx) => (
                <div key={idx} className="text-xs font-mono p-1 bg-gray-900 rounded flex items-start gap-2">
                  <span className="text-gray-500">
                    [{event.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={`font-semibold ${
                    event.type.includes('probe') ? 'text-yellow-400' :
                    event.type.includes('profile') ? 'text-purple-400' :
                    event.type.includes('behavior') ? 'text-blue-400' :
                    event.type.includes('message') ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {event.type}
                  </span>
                  {event.data && (
                    <span className="text-gray-300">
                      {JSON.stringify(event.data, null, 0).substring(0, 100)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No events yet. Start chatting to see events.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}