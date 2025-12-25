import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQueueEntrySchema } from "@shared/schema";
import { useJoinQueue, usePredictWaitTime } from "@/hooks/use-queue";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

// Schema for the form specifically
const formSchema = insertQueueEntrySchema.pick({
  citizenName: true,
  phoneNumber: true,
  serviceType: true,
  centerId: true,
});

type FormData = z.infer<typeof formSchema>;

interface JoinQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  centerId: number;
  centerName: string;
  onSuccess: (data: any) => void;
}

export function JoinQueueDialog({ open, onOpenChange, centerId, centerName, onSuccess }: JoinQueueDialogProps) {
  const { toast } = useToast();
  const joinMutation = useJoinQueue();
  const predictMutation = usePredictWaitTime();
  
  const [prediction, setPrediction] = useState<{ waitMinutes: number; rushLevel: string; tip: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      centerId: centerId,
      citizenName: "",
      phoneNumber: "",
      serviceType: "Document Verification",
    },
  });

  // Watch service type to trigger AI prediction
  const serviceType = form.watch("serviceType");

  const handlePredict = async () => {
    try {
      const result = await predictMutation.mutateAsync({
        centerId,
        serviceType: serviceType || "Document Verification",
      });
      setPrediction(result);
    } catch (error) {
      console.error("Prediction failed", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Ensure centerId is set correctly from props
      const finalData = { ...data, centerId };
      const result = await joinMutation.mutateAsync(finalData);
      
      toast({
        title: "Joined Queue Successfully!",
        description: `Your token number is ${result.tokenNumber}`,
      });
      
      onOpenChange(false);
      onSuccess(result);
    } catch (error: any) {
      toast({
        title: "Error joining queue",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden border-none shadow-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-xl font-display text-primary">Join Queue at {centerName}</DialogTitle>
          <DialogDescription>
            Enter your details to get a token. We'll notify you when it's your turn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <FormField
              control={form.control}
              name="citizenName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rahul Kumar" className="rounded-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" className="rounded-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Required</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={(val) => { field.onChange(val); setPrediction(null); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Document Verification">Document Verification</SelectItem>
                        <SelectItem value="New Application">New Application</SelectItem>
                        <SelectItem value="Certificate Collection">Certificate Collection</SelectItem>
                        <SelectItem value="Payment">Payment Services</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="shrink-0 text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                      onClick={handlePredict}
                      title="Get AI Wait Prediction"
                    >
                      {predictMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AnimatePresence>
              {prediction && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-indigo-900">
                        Estimated Wait: {prediction.waitMinutes} mins
                      </p>
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        {prediction.tip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Get Token"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
