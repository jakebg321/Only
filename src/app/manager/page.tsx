"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, DollarSign, TrendingUp, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
];

const creators = [
  { name: "Creator A", revenue: 12000, subscribers: 450 },
  { name: "Creator B", revenue: 9500, subscribers: 320 },
  { name: "Creator C", revenue: 15000, subscribers: 600 },
];

export default function ManagerDemo() {
  const router = useRouter();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "manager") {
      router.push("/auth");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Maximize Your Agency&apos;s Profits with AI</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card><CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader><CardContent><DollarSign className="w-8 h-8 mb-2 text-green-400" /><p className="text-2xl font-bold">$450,000</p><p className="text-sm text-gray-400">Strong Growth</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Active Creators</CardTitle></CardHeader><CardContent><Users className="w-8 h-8 mb-2 text-blue-400" /><p className="text-2xl font-bold">50</p><p className="text-sm text-gray-400">+10 New Signups</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Avg. Revenue/Creator</CardTitle></CardHeader><CardContent><TrendingUp className="w-8 h-8 mb-2 text-purple-400" /><p className="text-2xl font-bold">$9,000</p><p className="text-sm text-gray-400">Strong Performance</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Conversion Rate</CardTitle></CardHeader><CardContent><BarChart2 className="w-8 h-8 mb-2 text-orange-400" /><p className="text-2xl font-bold">4.2%</p><p className="text-sm text-gray-400">Excellent</p></CardContent></Card>
      </div>
      <Card className="mb-8">
        <CardHeader><CardTitle>Explosive Revenue Growth</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="revenue" fill="#8884d8" /></BarChart>
          </ResponsiveContainer>
          <p className="text-center mt-4 text-gray-400">See how AI drives consistent revenue acceleration</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Star Performers Driving Your Success</CardTitle></CardHeader>
        <CardContent>
          <ul>
            {creators.map((creator) => (
              <li key={creator.name} className="flex justify-between mb-2 border-b py-2"><span className="font-medium">{creator.name}</span><span className="text-green-400">${creator.revenue} ({creator.subscribers} subs)</span></li>
            ))}
          </ul>
          <p className="mt-4 text-gray-400">Leverage AI to elevate all creators to top-performer status</p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 