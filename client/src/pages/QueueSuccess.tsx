import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, MapPin, Ticket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueue } from "@/hooks/use-queue";
import { useCenter } from "@/hooks/use-centers";

interface QueueSuccessProps {
  tokenData: any;
  onReset: () => void;
}

export function QueueSuccess({ tokenData, onReset }: QueueSuccessProps) {
  const { data: queue } = useQueue(tokenData.centerId);
  const { data: center } = useCenter(tokenData.centerId);

  // Calculate position in queue
  const myPosition = queue 
    ? queue.filter(q => q.status === 'waiting' && q.id < tokenData.id).length + 1
    : 1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">You're in the Queue!</h1>
          <p className="text-muted-foreground mt-2">Please reach the center on time.</p>
        </div>

        <Card className="overflow-hidden border-t-4 border-t-primary shadow-2xl">
          <div className="bg-primary/5 p-6 text-center border-b border-dashed border-border">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Your Token</p>
            <p className="text-5xl font-display font-black text-primary tracking-tighter">{tokenData.tokenNumber}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Position in Queue</p>
                  <p className="text-xl font-bold">{myPosition}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Wait</p>
                  <p className="text-xl font-bold text-amber-600">~{tokenData.predictedWaitTime || 15} mins</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{center?.name || "Service Center"}</p>
                <p className="text-xs text-muted-foreground mt-1">{center?.address}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{tokenData.citizenName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{tokenData.serviceType}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
