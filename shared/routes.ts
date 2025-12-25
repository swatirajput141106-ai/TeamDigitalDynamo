import { z } from 'zod';
import { insertQueueEntrySchema, centers, queueEntries, predictWaitTimeSchema, predictionResponseSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  centers: {
    list: {
      method: 'GET' as const,
      path: '/api/centers',
      responses: {
        200: z.array(z.custom<typeof centers.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/centers/:id',
      responses: {
        200: z.custom<typeof centers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  queue: {
    list: {
      method: 'GET' as const,
      path: '/api/queue/:centerId',
      responses: {
        200: z.array(z.custom<typeof queueEntries.$inferSelect>()),
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/join',
      input: insertQueueEntrySchema,
      responses: {
        201: z.custom<typeof queueEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    predict: {
      method: 'POST' as const,
      path: '/api/predict',
      input: predictWaitTimeSchema,
      responses: {
        200: predictionResponseSchema,
        500: errorSchemas.internal,
      },
    },
    callNext: {
      method: 'POST' as const,
      path: '/api/queue/:centerId/call-next',
      responses: {
        200: z.custom<typeof queueEntries.$inferSelect>().nullable(), // Returns the served entry or null if empty
        404: errorSchemas.notFound,
      },
    },
    complete: {
      method: 'POST' as const,
      path: '/api/queue/:entryId/complete',
      responses: {
        200: z.custom<typeof queueEntries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
