'use server';

/**
 * @fileOverview A delivery route optimization AI agent.
 *
 * - optimizeDeliveryRoute - A function that handles the delivery route optimization process.
 * - OptimizeDeliveryRouteInput - The input type for the optimizeDeliveryRoute function.
 * - OptimizeDeliveryRouteOutput - The return type for the optimizeDeliveryRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDeliveryRouteInputSchema = z.object({
  orders: z
    .array(
      z.object({
        orderId: z.string().describe('The unique identifier for the order.'),
        pickupAddress: z.string().describe('The pickup address for the order.'),
        deliveryAddress: z.string().describe('The delivery address for the order.'),
      })
    )
    .describe('An array of delivery orders with pickup and delivery addresses.'),
  vehicleType: z.enum(['car', 'bike']).describe('The type of vehicle being used for deliveries.'),
});
export type OptimizeDeliveryRouteInput = z.infer<typeof OptimizeDeliveryRouteInputSchema>;

const OptimizeDeliveryRouteOutputSchema = z.object({
  optimizedRoute: z
    .array(z.string())
    .describe('An array of order IDs representing the optimized delivery route.'),
  totalDistance: z.number().describe('The total distance of the optimized route in kilometers.'),
  totalTime: z.number().describe('The total time of the optimized route in minutes.'),
});
export type OptimizeDeliveryRouteOutput = z.infer<typeof OptimizeDeliveryRouteOutputSchema>;

export async function optimizeDeliveryRoute(
  input: OptimizeDeliveryRouteInput
): Promise<OptimizeDeliveryRouteOutput> {
  return optimizeDeliveryRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeDeliveryRoutePrompt',
  input: {schema: OptimizeDeliveryRouteInputSchema},
  output: {schema: OptimizeDeliveryRouteOutputSchema},
  prompt: `You are an expert logistics coordinator specializing in optimizing delivery routes for couriers.

  Given a list of delivery orders with pickup and delivery addresses, and the type of vehicle being used, you will determine the most efficient route to minimize total travel distance and time.

  Orders:
  {{#each orders}}
  - Order ID: {{orderId}}
    Pickup Address: {{pickupAddress}}
    Delivery Address: {{deliveryAddress}}
  {{/each}}

  Vehicle Type: {{vehicleType}}

  Consider the vehicle type when optimizing the route. For example, bikes may be faster in urban environments with heavy traffic.

  Return the optimized route as an array of order IDs in the recommended delivery order, the total distance of the route in kilometers, and the total time of the route in minutes.
  Make sure the route includes all the orders in the input.

  {{output}}
  `,
});

const optimizeDeliveryRouteFlow = ai.defineFlow(
  {
    name: 'optimizeDeliveryRouteFlow',
    inputSchema: OptimizeDeliveryRouteInputSchema,
    outputSchema: OptimizeDeliveryRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
