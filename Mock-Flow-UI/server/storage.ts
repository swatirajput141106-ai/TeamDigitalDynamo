import { Center, QueueEntry, InsertQueueEntry, PredictionResponse } from "@shared/schema";

export interface IStorage {
  getCenters(): Promise<Center[]>;
  getCenter(id: number): Promise<Center | undefined>;
  getQueue(centerId: number): Promise<QueueEntry[]>;
  createQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry>;
  callNext(centerId: number): Promise<QueueEntry | null>;
  completeEntry(entryId: number): Promise<QueueEntry | undefined>;
  getEntry(entryId: number): Promise<QueueEntry | undefined>;
}

export class MemStorage implements IStorage {
  private centers: Map<number, Center>;
  private queue: Map<number, QueueEntry>;
  private currentId: number;

  constructor() {
    this.centers = new Map();
    this.queue = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Seed Centers
    const mockCenters: Center[] = [
      {
        id: 1,
        name: "City Civic Center",
        address: "12 MG Road, Indiranagar, Bangalore",
        lat: "12.9716",
        lng: "77.5946",
        activeCounters: 4,
        totalCounters: 6
      },
      {
        id: 2,
        name: "Regional Passport Office",
        address: "80 Feet Rd, Koramangala, Bangalore",
        lat: "12.9352",
        lng: "77.6245",
        activeCounters: 8,
        totalCounters: 10
      },
      {
        id: 3,
        name: "Municipal Corporation",
        address: "Jayanagar 4th Block, Bangalore",
        lat: "12.9250",
        lng: "77.5938",
        activeCounters: 3,
        totalCounters: 5
      }
    ];

    mockCenters.forEach(c => this.centers.set(c.id, c));

    // Seed Queue Entries
    const mockQueue: any[] = [
      { centerId: 1, citizenName: "Rahul Sharma", phoneNumber: "9876543210", serviceType: "Document Verification", status: "waiting", tokenNumber: "A001" },
      { centerId: 1, citizenName: "Priya Patel", phoneNumber: "9876543211", serviceType: "New Application", status: "serving", tokenNumber: "A002" },
      { centerId: 1, citizenName: "Amit Kumar", phoneNumber: "9876543212", serviceType: "Payment", status: "waiting", tokenNumber: "A003" },
      { centerId: 2, citizenName: "Sneha Gupta", phoneNumber: "9876543213", serviceType: "Passport Renewal", status: "waiting", tokenNumber: "B001" },
    ];

    mockQueue.forEach((q, idx) => {
      const id = this.currentId++;
      this.queue.set(id, { 
        ...q, 
        id, 
        joinTime: new Date(Date.now() - idx * 1000 * 60 * 10), // staggered join times
        predictedWaitTime: 15
      });
    });
  }

  async getCenters(): Promise<Center[]> {
    return Array.from(this.centers.values());
  }

  async getCenter(id: number): Promise<Center | undefined> {
    return this.centers.get(id);
  }

  async getQueue(centerId: number): Promise<QueueEntry[]> {
    return Array.from(this.queue.values()).filter(q => q.centerId === centerId);
  }

  async createQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry> {
    const id = this.currentId++;
    const center = this.centers.get(entry.centerId);
    const prefix = center ? center.name.charAt(0).toUpperCase() : 'T';
    const tokenNumber = `${prefix}${String(id).padStart(3, '0')}`;
    
    const newEntry: QueueEntry = {
      ...entry,
      id,
      tokenNumber,
      status: "waiting",
      joinTime: new Date(),
      predictedWaitTime: 20, // Default mock prediction
    };
    
    this.queue.set(id, newEntry);
    return newEntry;
  }

  async callNext(centerId: number): Promise<QueueEntry | null> {
    // Find next waiting person
    const nextPerson = Array.from(this.queue.values())
      .filter(q => q.centerId === centerId && q.status === "waiting")
      .sort((a, b) => (a.joinTime?.getTime() || 0) - (b.joinTime?.getTime() || 0))[0];

    if (nextPerson) {
      const updated = { ...nextPerson, status: "serving" };
      this.queue.set(nextPerson.id, updated);
      return updated;
    }
    return null;
  }

  async completeEntry(entryId: number): Promise<QueueEntry | undefined> {
    const entry = this.queue.get(entryId);
    if (entry) {
      const updated = { ...entry, status: "completed" };
      this.queue.set(entryId, updated);
      return updated;
    }
    return undefined;
  }

  async getEntry(entryId: number): Promise<QueueEntry | undefined> {
    return this.queue.get(entryId);
  }
}

export const storage = new MemStorage();
