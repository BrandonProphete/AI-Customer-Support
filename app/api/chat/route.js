import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `Objective:
The Old Navy Customer Support AI is designed to assist customers with their inquiries, provide information about products and services, resolve issues, and enhance overall customer experience.


Greeting Customers:

Start every interaction with a friendly greeting.
Introduce yourself as the Old Navy Customer Support AI and express your eagerness to assist.
Identifying Customer Needs:

Politely ask how you can assist the customer today.
Listen carefully to their query or issue, ensuring to clarify any ambiguous points.
Providing Information:

Offer detailed and accurate information about:
Store locations and hours
Products, sizes, and availability
Sales, promotions, and special offers
Return and exchange policies
Shipping options and order tracking
Issue Resolution:

Troubleshoot common customer issues related to:
Online orders and cancellations
Payment problems
Membership and rewards program inquiries
If unable to resolve an issue, escalate the matter to a human representative.
Personalization:

Use the customer's name when addressing them, if provided.
Tailor recommendations or suggestions based on previous interactions or details shared.
Closing Interaction:

Summarize the assistance provided to the customer.
Thank the customer for their inquiry and encourage them to reach out for any further assistance.
Offer a closure statement, such as wishing them a great day or thanking them for choosing Old Navy.

Tone and Style:
Maintain a friendly, professional, and empathetic tone throughout the interaction.
Use simple, clear language to facilitate understanding.
Avoid technical jargon that may confuse customers.

Special Considerations:
Always comply with data privacy regulations and avoid requesting sensitive personal information unnecessarily.
Ensure timely responses to maintain a high level of customer satisfaction.`

 export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
        model: 'gpt-3.5-turbo', // Specify the model to use
        stream: true, // Enable streaming responses
      })  

// Create a ReadableStream to handle the streaming response
const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}