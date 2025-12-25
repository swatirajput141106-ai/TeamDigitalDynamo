import { useState } from "react";
import { useCenters } from "@/hooks/use-centers";
import { Header } from "@/components/Header";
import { JoinQueueDialog } from "@/components/JoinQueueDialog";
import { QueueSuccess } from "@/pages/QueueSuccess";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: centers, isLoading, error } = useCenters();
  
  const [selectedCenter, setSelectedCenter] = useState<{id: number, name: string} | null>(null);
  const [joinedToken, setJoinedToken] = useState<any>(null);

  // If user has successfully joined, show the success screen
  if (joinedToken) {
    return <QueueSuccess tokenData={joinedToken} onReset={() => setJoinedToken(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <section className="mb-12 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Smart Queue System
            </h1>
            <p className="text-lg text-muted-foreground">
              Skip the long lines. Find nearby service centers, join the queue virtually, and arrive just in time.
            </p>
          </motion.div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 rounded-2xl">
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-red-50 rounded-2xl text-red-600 border border-red-100">
            Failed to load service centers. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers?.map((center, index) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group h-full flex flex-col border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden bg-card">
                  <div className="relative h-40 bg-muted overflow-hidden">
                     {/* Static Map Image using unsplash for demo visuals as maps API requires key */}
                     {/* city map overhead view */}
                     <img 
                       src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&h=300&q=80`} 
                       alt="Map Location"
                       className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                     <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-semibold flex items-center gap-1.5 text-sm">
                          <MapPin className="w-3.5 h-3.5" /> {center.activeCounters} Counters Active
                        </p>
                     </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="font-display text-xl">{center.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {center.address}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-grow grid grid-cols-2 gap-4">
                     <div className="bg-secondary/5 rounded-xl p-3 border border-secondary/10">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Queue
                        </p>
                        <p className="text-2xl font-bold text-secondary-foreground/80">
                          {/* We would typically fetch queue size here, mocking for card view */}
                          {Math.floor(Math.random() * 20) + 5}
                        </p>
                     </div>
                     <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Avg Wait
                        </p>
                        <p className="text-2xl font-bold text-orange-700">
                          ~{Math.floor(Math.random() * 15) + 10}m
                        </p>
                     </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full h-11 rounded-xl text-base shadow-lg shadow-primary/20 group-hover:translate-y-[-2px] transition-all"
                      onClick={() => setSelectedCenter({ id: center.id, name: center.name })}
                    >
                      Join Queue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {selectedCenter && (
        <JoinQueueDialog
          open={!!selectedCenter}
          onOpenChange={(open) => !open && setSelectedCenter(null)}
          centerId={selectedCenter.id}
          centerName={selectedCenter.name}
          onSuccess={(data) => setJoinedToken(data)}
        />
      )}
    </div>
  );
}
