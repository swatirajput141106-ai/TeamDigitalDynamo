import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We're using in-memory storage, but defining schemas here helps with type safety and validation
// These are "virtual" tables for our types

export const centers = pgTable("centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  activeCounters: integer("active_counters").notNull(),
  totalCounters: integer("total_counters").notNull(),
});

export const queueEntries = pgTable("queue_entries", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull(),
  tokenNumber: text("token_number").notNull(),
  citizenName: text("citizen_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  serviceType: text("service_type").notNull(),
  status: text("status").notNull(), // 'waiting', 'serving', 'completed'
  joinTime: timestamp("join_time").defaultNow(),
  predictedWaitTime: integer("predicted_wait_time"),
});

export const insertCenterSchema = createInsertSchema(centers);
export const insertQueueEntrySchema = createInsertSchema(queueEntries).omit({ 
  id: true, 
  joinTime: true,
  tokenNumber: true, // Generated server-side
  status: true // Defaults to 'waiting'
});

export type Center = typeof centers.$inferSelect;
export type QueueEntry = typeof queueEntries.$inferSelect;
export type InsertQueueEntry = z.infer<typeof insertQueueEntrySchema>;

// API Schemas
export const predictWaitTimeSchema = z.object({
  centerId: z.number(),
  serviceType: z.string(),
});

export type PredictWaitTimeRequest = z.infer<typeof predictWaitTimeSchema>;

export const predictionResponseSchema = z.object({
  waitMinutes: z.number(),
  rushLevel: z.enum(["low", "medium", "high"]),
  tip: z.string(),
});

export type PredictionResponse = z.infer<typeof predictionResponseSchema>;
