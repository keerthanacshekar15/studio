'use server';

/**
 * @fileOverview This file contains the Genkit flow for admin-assisted ID verification.
 *
 * The flow takes an ID card image and user details as input, and uses an LLM to assist
 * the admin in verifying the user's identity.
 *
 * - verifyId - A function that handles the ID verification process.
 * - VerifyIdInput - The input type for the verifyId function.
 * - VerifyIdOutput - The return type for the verifyId function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyIdInputSchema = z.object({
  idCardImage: z
    .string()
    .describe(
      "The ID card image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fullName: z.string().describe('The full name of the user.'),
  usn: z.string().describe('The USN/Roll Number of the user.'),
});
export type VerifyIdInput = z.infer<typeof VerifyIdInputSchema>;

const VerifyIdOutputSchema = z.object({
  verificationResult: z
    .string()
    .describe(
      'The LLM verification result if the ID card is valid, includes name and USN extracted from id card image.'
    ),
});
export type VerifyIdOutput = z.infer<typeof VerifyIdOutputSchema>;

export async function verifyId(input: VerifyIdInput): Promise<VerifyIdOutput> {
  return verifyIdFlow(input);
}

const verifyIdPrompt = ai.definePrompt({
  name: 'verifyIdPrompt',
  input: {schema: VerifyIdInputSchema},
  output: {schema: VerifyIdOutputSchema},
  prompt: `You are an experienced administrator. Check if the provided ID card image is valid and the provided information are correct. 

  If the ID card is valid, extract the name and USN from the ID card image and respond whether they match the provided full name and USN.
  If not valid, respond why the ID card is not valid.

  Full Name: {{{fullName}}}
  USN: {{{usn}}}
  ID Card Image: {{media url=idCardImage}}`,
});

const verifyIdFlow = ai.defineFlow(
  {
    name: 'verifyIdFlow',
    inputSchema: VerifyIdInputSchema,
    outputSchema: VerifyIdOutputSchema,
  },
  async input => {
    const {output} = await verifyIdPrompt(input);
    return output!;
  }
);
