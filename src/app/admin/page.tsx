"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

const initialRequests = [
  { id: 1, user: "Subscriber1", request: "Custom photo in red dress", status: "pending" },
  { id: 2, user: "Subscriber2", request: "Short video greeting", status: "pending" },
];

export default function AdminDashboard() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleStatusChange = (id: number, newStatus: string) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  const handleSubmitResponse = () => {
    if (!selectedRequest) return;
    
    // Simulate sending response
    console.log("Submitting response for request", selectedRequest, responseText, imageFile);
    handleStatusChange(selectedRequest, "completed");
    setSelectedRequest(null);
    setResponseText("");
    setImageFile(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 gradient-text">Command Center: Fulfill Requests Efficiently</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card><CardHeader><CardTitle>Total Requests</CardTitle></CardHeader><CardContent><AlertCircle className="w-8 h-8 mb-2" /><p className="text-2xl">{requests.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Pending</CardTitle></CardHeader><CardContent><Clock className="w-8 h-8 mb-2" /><p className="text-2xl">{requests.filter(r => r.status === "pending").length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Processing</CardTitle></CardHeader><CardContent><Clock className="w-8 h-8 mb-2 text-yellow-500" /><p className="text-2xl">{requests.filter(r => r.status === "processing").length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Completed</CardTitle></CardHeader><CardContent><CheckCircle className="w-8 h-8 mb-2 text-green-500" /><p className="text-2xl">{requests.filter(r => r.status === "completed").length}</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Request Queue</CardTitle></CardHeader>
          <CardContent>
            <ul>
              {requests.map((req) => (
                <li key={req.id} className="mb-4 p-4 bg-gray-800 rounded-lg">
                  <p><strong>User:</strong> {req.user}</p>
                  <p><strong>Request:</strong> {req.request}</p>
                  <p><strong>Status:</strong> {req.status}</p>
                  <div className="mt-2 space-x-2">
                    <Button onClick={() => handleStatusChange(req.id, "processing")} disabled={req.status !== "pending"}>Process</Button>
                    <Button onClick={() => setSelectedRequest(req.id)} disabled={req.status === "completed"}>Respond</Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {selectedRequest && (
          <Card>
            <CardHeader><CardTitle>Response Panel</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="response-text">Response Text</Label>
                  <Textarea id="response-text" value={responseText} onChange={(e) => setResponseText(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="image-upload">Upload Image (optional)</Label>
                  <Input id="image-upload" type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <Button onClick={handleSubmitResponse}>Submit Response</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 