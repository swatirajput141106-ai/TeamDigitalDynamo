import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- API Routes ---

  // Get all centers
  app.get(api.centers.list.path, async (req, res) => {
    const centers = await storage.getCenters();
    res.json(centers);
  });

  // Get specific center
  app.get(api.centers.get.path, async (req, res) => {
    const center = await storage.getCenter(Number(req.params.id));
    if (!center) return res.status(404).json({ message: "Center not found" });
    res.json(center);
  });

  // Get queue for a center
  app.get(api.queue.list.path, async (req, res) => {
    const queue = await storage.getQueue(Number(req.params.centerId));
    res.json(queue);
  });

  // Join Queue
  app.post(api.queue.join.path, async (req, res) => {
    try {
      const input = api.queue.join.input.parse(req.body);
      const entry = await storage.createQueueEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // AI Predict
  app.post(api.queue.predict.path, async (req, res) => {
    try {
      const { centerId, serviceType } = api.queue.predict.input.parse(req.body);
      
      // Get current stats for context
      const queue = await storage.getQueue(centerId);
      const waitingCount = queue.filter(q => q.status === "waiting").length;
      const center = await storage.getCenter(centerId);
      const activeCounters = center?.activeCounters || 1;

      // Gemini Prediction
      let response;
      // Use Replit AI Integration variables
      const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
      
      if (apiKey) {
        try {
          // Configure for Replit AI if baseUrl is present
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // If using Replit AI, we might need to pass httpOptions.
            // Note: @google/generative-ai version differences might apply.
            // If using the blueprint approach:
          }, {
            baseUrl: baseUrl,
            apiVersion: ''
          });

          const prompt = `
            Context: A government service center queue.
            Stats: ${waitingCount} people waiting. ${activeCounters} active counters. Service type: ${serviceType}.
            Task: Predict wait time in minutes and rush level.
            Output: JSON only: {"waitMinutes": number, "rushLevel": "low"|"medium"|"high", "tip": "short helpful tip"}
          `;

          const result = await model.generateContent(prompt);
          const text = result.response.text();
          // Extract JSON from text (sometimes it has markdown code blocks)
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            response = JSON.parse(jsonMatch[0]);
          }
        } catch (aiError) {
          console.error("AI Error:", aiError);
          // Fallback if AI fails
        }
      }

      if (!response) {
        // Fallback Logic
        const avgTimePerPerson = 5; // minutes
        const waitMinutes = Math.ceil((waitingCount * avgTimePerPerson) / activeCounters);
        response = {
          waitMinutes: waitMinutes,
          rushLevel: waitingCount > 10 ? "high" : waitingCount > 5 ? "medium" : "low",
          tip: "AI unavailable. Estimated based on average service time.",
        };
      }

      res.json(response);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Prediction failed" });
    }
  });

  // Admin: Call Next
  app.post(api.queue.callNext.path, async (req, res) => {
    const entry = await storage.callNext(Number(req.params.centerId));
    if (!entry) return res.status(404).json({ message: "No one waiting" });
    res.json(entry);
  });

  // Admin: Complete
  app.post(api.queue.complete.path, async (req, res) => {
    const entry = await storage.completeEntry(Number(req.params.entryId));
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  });

  return httpServer;
}
