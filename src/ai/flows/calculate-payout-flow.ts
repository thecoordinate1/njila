'use server';
/**
 * @fileOverview An AI flow to calculate delivery job payouts.
 *
 * - calculatePayout - A function that estimates delivery metrics and calculates payout.
 * - CalculatePayoutInput - The input type for the calculatePayout function.
 * - CalculatePayoutOutput - The return type for the calculatePayout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const CalculatePayoutInputSchema = z.object({
  pickupAddress: z.string().describe('The starting address for the delivery.'),
  destinationAddress: z
    .string()
    .describe('The final destination address for the delivery.'),
});
export type CalculatePayoutInput = z.infer<typeof CalculatePayoutInputSchema>;

export const CalculatePayoutOutputSchema = z.object({
  payout: z.number().describe('The calculated payout amount for the job.'),
  currency: z.string().describe("The currency code for the payout (e.g., 'ZMW')."),
  distance: z.string().describe('The estimated travel distance for the job (e.g., "10.5 km").'),
  time: z.string().describe('The estimated travel time for the job (e.g., "25 mins").'),
});
export type CalculatePayoutOutput = z.infer<typeof CalculatePayoutOutputSchema>;

export async function calculatePayout(input: CalculatePayoutInput): Promise<CalculatePayoutOutput> {
  return calculatePayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculatePayoutPrompt',
  input: { schema: CalculatePayoutInputSchema },
  output: { schema: CalculatePayoutOutputSchema },
  prompt: `You are a logistics and payout calculation expert for a delivery service operating in Lusaka, Zambia. Your task is to calculate the estimated payout for a delivery job based on the provided pickup and destination addresses.

First, you must estimate the driving distance in kilometers and the driving time in minutes between the two locations.

Then, calculate the final payout using the following formula:
- Base Fare: 25 ZMW
- Per Kilometer Rate: 5 ZMW/km
- Per Minute Rate: 0.5 ZMW/min
- Payout = Base Fare + (Distance in km * Per Kilometer Rate) + (Time in minutes * Per Minute Rate)

Return the results in the specified JSON format. The currency must always be 'ZMW'.

Pickup Address: {{{pickupAddress}}}
Destination Address: {{{destinationAddress}}}`,
});

const calculatePayoutFlow = ai.defineFlow(
  {
    name: 'calculatePayoutFlow',
    inputSchema: CalculatePayoutInputSchema,
    outputSchema: CalculatePayoutOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to calculate payout. The AI model did not return a valid output.');
    }
    return output;
  }
);
