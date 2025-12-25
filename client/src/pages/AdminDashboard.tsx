import { useState } from "react";
import { useCenters } from "@/hooks/use-centers";
import { useQueue, useCallNext, useCompleteService } from "@/hooks/use-queue";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, UserCheck, Clock, Megaphone, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { data: centers } = useCenters();
  const [selectedCenterId, setSelectedCenterId] = useState<string>("");
  const { toast } = useToast();

  const centerId = selectedCenterId ? parseInt(selectedCenterId) : (centers?.[0]?.id || 0);
  const { data: queue, isLoading } = useQueue(centerId);

  const callNextMutation = useCallNext();
  const completeMutation = useCompleteService();

  const waitingQueue = queue?.filter(q => q.status === 'waiting') || [];
  const servingQueue = queue?.filter(q => q.status === 'serving') || [];
  const completedQueue = queue?.filter(q => q.status === 'completed') || [];

  const handleCallNext = async () => {
    try {
      const result = await callNextMutation.mutateAsync(centerId);
      if (result) {
        toast({ title: "Called Next Token", description: `Now serving Token ${result.tokenNumber}` });
      } else {
        toast({ title: "Queue is empty", description: "No one waiting in queue." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to call next person." });
    }
  };

  const handleComplete = async (entryId: number) => {
    try {
      await completeMutation.mutateAsync({ entryId, centerId });
      toast({ title: "Service Completed", description: "Marked as done." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to complete service." });
    }
  };

  // Mock data for chart
  const analyticsData = [
    { name: '9AM', served: 4 },
    { name: '10AM', served: 12 },
    { name: '11AM', served: 18 },
    { name: '12PM', served: 14 },
    { name: '1PM', served: 8 },
    { name: '2PM', served: 16 },
    { name: '3PM', served: 20 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Counter Dashboard</h1>
            <p className="text-muted-foreground">Manage queue flow and service requests.</p>
          </div>
          
          <div className="w-full md:w-64">
             <Select value={selectedCenterId} onValueChange={setSelectedCenterId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Center" />
              </SelectTrigger>
              <SelectContent>
                {centers?.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Waiting</p>
                  <p className="text-2xl font-bold">{waitingQueue.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Serving Now</p>
                  <p className="text-2xl font-bold">{servingQueue.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Completed</p>
                  <p className="text-2xl font-bold">{completedQueue.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Avg Wait</p>
                  <p className="text-2xl font-bold">12m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Queue List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Queue Management</h2>
              <Button 
                size="lg" 
                onClick={handleCallNext} 
                disabled={callNextMutation.isPending || waitingQueue.length === 0}
                className="shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {callNextMutation.isPending ? "Calling..." : "Call Next Person"}
                <Megaphone className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="serving" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="serving">Currently Serving ({servingQueue.length})</TabsTrigger>
                <TabsTrigger value="waiting">Waiting List ({waitingQueue.length})</TabsTrigger>
                <TabsTrigger value="completed">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="serving" className="space-y-4">
                <AnimatePresence>
                  {servingQueue.length === 0 ? (
                    <div className="text-center p-8 bg-muted/30 rounded-2xl border border-dashed border-border">
                      <p className="text-muted-foreground">No active counters. Call next to start.</p>
                    </div>
                  ) : (
                    servingQueue.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="border-l-4 border-l-green-500 shadow-md">
                          <CardContent className="p-6 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-3xl font-display font-black text-green-600">{item.tokenNumber}</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                              </div>
                              <p className="font-medium text-lg">{item.citizenName}</p>
                              <p className="text-sm text-muted-foreground">{item.serviceType}</p>
                            </div>
                            <Button 
                              size="lg" 
                              variant="outline"
                              className="border-green-200 hover:bg-green-50 text-green-700"
                              onClick={() => handleComplete(item.id)}
                              disabled={completeMutation.isPending}
                            >
                              <CheckCircle className="mr-2 w-4 h-4" />
                              Mark Complete
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="waiting" className="space-y-3">
                {waitingQueue.length === 0 ? (
                  <div className="text-center p-8">No one waiting.</div>
                ) : (
                  waitingQueue.map(item => (
                    <Card key={item.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {item.tokenNumber}
                          </div>
                          <div>
                            <p className="font-medium">{item.citizenName}</p>
                            <p className="text-xs text-muted-foreground">Joined {item.joinTime ? format(new Date(item.joinTime), 'h:mm a') : '-'}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{item.serviceType}</Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed">
                <div className="space-y-3">
                  {completedQueue.slice(0, 10).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-muted-foreground line-through">{item.tokenNumber}</span>
                         <span className="text-sm">{item.citizenName}</span>
                      </div>
                      <Badge variant="outline" className="text-muted-foreground">Completed</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Bar dataKey="served" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Busiest Hour</span>
                    <span className="font-medium">3:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Service Time</span>
                    <span className="font-medium">4m 30s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-sm leading-relaxed">
                  Traffic is expected to spike in the next hour. Consider opening Counter #4 to manage the flow efficiently.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/20 w-fit px-3 py-1.5 rounded-full">
                   <Clock className="w-3 h-3" /> Updated 2m ago
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
