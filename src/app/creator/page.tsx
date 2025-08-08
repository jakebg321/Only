"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { DollarSign, Users, Clock, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageCarousel, { CarouselImage } from "@/components/ImageCarousel";

const timeSavedData = [
  { activity: "Content Creation", timeSaved: 20 },
  { activity: "Subscriber Interaction", timeSaved: 15 },
  { activity: "Scheduling", timeSaved: 5 },
];

const subData = [
  { name: 'Jan', subs: 100 },
  { name: 'Feb', subs: 150 },
  { name: 'Mar', subs: 220 },
  { name: 'Apr', subs: 300 },
  { name: 'May', subs: 450 },
  { name: 'Jun', subs: 600 },
];

export default function CreatorDemo() {
  const router = useRouter();
  const [remyImages, setRemyImages] = useState<CarouselImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "creator") {
      router.push("/auth");
    }
  }, [router]);

  useEffect(() => {
    async function fetchImages() {
      try {
        setIsLoadingImages(true);
        const res = await fetch("/api/images/remy");
        if (!res.ok) throw new Error("Failed to load images");
        const data: { images: string[] } = await res.json();
        const mapped: CarouselImage[] = data.images.map((src) => ({ src }));
        setRemyImages(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingImages(false);
      }
    }
    fetchImages();
  }, []);

      return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 gradient-text">Empower Your Content with AI</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card><CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader><CardContent><DollarSign className="w-8 h-8 mb-2 text-green-400" /><p className="text-2xl font-bold">$15,000</p><p className="text-sm text-gray-400">+40% with AI</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Subscribers</CardTitle></CardHeader><CardContent><Users className="w-8 h-8 mb-2 text-blue-400" /><p className="text-2xl font-bold">5,000</p><p className="text-sm text-gray-400">+1,200 this month</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Time Saved</CardTitle></CardHeader><CardContent><Clock className="w-8 h-8 mb-2 text-purple-400" /><p className="text-2xl font-bold">60 hours/week</p><p className="text-sm text-gray-400">Focus on what matters</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Content Created</CardTitle></CardHeader><CardContent><FileText className="w-8 h-8 mb-2 text-orange-400" /><p className="text-2xl font-bold">300 posts</p><p className="text-sm text-gray-400">Effortlessly</p></CardContent></Card>
      </div>
      <Card className="mb-8">
        <CardHeader><CardTitle>Reclaim Your Life with AI Efficiency</CardTitle></CardHeader>
        <CardContent>
          <ul>
            {timeSavedData.map((item) => (
              <li key={item.activity} className="flex justify-between mb-2 border-b py-2"><span className="font-medium">{item.activity}</span><span className="text-green-400">{item.timeSaved} hours saved</span></li>
            ))}
          </ul>
          <p className="mt-4 text-gray-400">Turn saved time into more revenue or well-deserved rest</p>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader><CardTitle>Subscriber Growth</CardTitle></CardHeader>
        <CardContent>
          <LineChart width={600} height={300} data={subData}>
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="subs" stroke="#a78bfa" />
          </LineChart>
        </CardContent>
      </Card>
      <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-2xl">Your AI Generated Content Gallery</CardTitle></CardHeader>
        <CardContent>
          {isLoadingImages ? (
            <div className="text-gray-400">Loading images...</div>
          ) : (
            <ImageCarousel images={remyImages} />
          )}
        </CardContent>
      </Card>
        </div>
      </div>
  );
} 