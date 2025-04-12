import { createClient } from "@/ai/client";
import { modelToOpenRouter } from "@/ai/models";
import { system } from "@/ai/prompt";
import PostHogClient from "@/lib/postHogServer";
import { shouldUseAuth } from "@/lib/shouldUseAuth";
import { Settings } from "@/state/settings";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { streamHtml } from "openai-html-stream";

import {
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";

// This API route handles POST requests to generate a project charter HTML based on user input.
export async function POST(req: NextRequest) {
  try {
    // Read data submitted via the form
    const formData = await req.formData();
    // Get the project idea text (submitted as 'projectIdea' field from the shape)
    const projectIdea = formData.get("projectidea")! as string;
    // Get stringified settings object from the hidden form field
    const settingsString = formData.get("settings")! as string;
    // Parse the settings string into an object
    const settings: Settings = JSON.parse(settingsString);

    // --- Authentication & Analytics (Optional: Based on shouldUseAuth flag) ---
    if (shouldUseAuth) {
      const user = await currentUser();
      const posthog = PostHogClient();

      // If authentication is required and user is not logged in, return Unauthorized
      if (!user) {
        return new Response(`<h1>Unauthorized</h1><p>Log in to continue</p>`, {
          status: 401,
          headers: { "Content-Type": "text/html" },
        });
      }

      // Log the generation event to PostHog analytics
      posthog.capture({
        distinctId: user.id,
        event: "gen project charter", // Changed event name
        properties: {
          projectIdea, // Log the idea
          model: settings?.model,
          // Removed deps/prompts properties as they are not used here
        },
      });
    }
    // --- End Authentication & Analytics ---

    // Validate that a project idea was provided
    if (!projectIdea?.trim()) {
       return new NextResponse(
        `<h1>Error</h1><p>Project idea cannot be empty.</p>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Prepare and initiate the AI stream for charter generation
    const programStream = await createProgramStream({
      projectIdea, // Pass the idea
      settings,
      // Removed deps/prompts as they are not used for initial charter generation
    });

    // Stream the AI's HTML response back to the client (which targets the iframe)
    return new Response(
      streamHtml(programStream, {
        // Optionally inject scripts or styles into the generated HTML head
        injectIntoHead: '<script src="/bootstrap.js"></script>', // Kept from original code, adjust if needed
      }),
      {
        headers: {
          "Content-Type": "text/html", // Set content type to HTML
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in POST /api/generate-project:", error);
    // Return an HTML error response if anything in the try block fails
    const errorHtml = `<html><body><h1>Error generating project charter</h1><pre>${error instanceof Error ? error.message : String(error)}</pre></body></html>`;
    return new NextResponse(errorHtml, {
        status: 500,
        headers: { "Content-Type": "text/html" }
    });
  }
}

// Creates the stream for the AI chat completion request
async function createProgramStream({ // Updated parameters
  projectIdea,
  settings,
}: {
  projectIdea: string;
  settings: Settings;
}) {

  // Define the structure of messages sent to the AI model
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      // Use a specific system prompt for charter generation
      // This might instruct the AI on the desired format (HTML), sections, tone etc.
      content: settings.prompt || system, // Assuming 'system' is tailored for charter generation
    },
    {
      role: "user",
      // Provide the user's project idea as the main input
      content: `<project_idea>${projectIdea}</project_idea>`,
    },
    // Removed dependency messages (deps.flatMap...)
  ];

  // Set up parameters for the OpenAI API call
  const params: ChatCompletionCreateParamsStreaming = {
    messages: messages, // Use the constructed messages
    model: !settings.apiKey
      ? "claude-3-haiku-20240307" // Default model if no API key
      : modelToOpenRouter(settings.model), // Use model from settings via OpenRouter mapping
    stream: true, // Enable streaming responses
    max_tokens: 4000, // Set max response length
    // Consider adding temperature, top_p etc. if needed
  };

  // Create an AI client instance based on the provided settings
  const client = createClientFromSettings(settings);

  // Remove the try...catch from here; let errors bubble up to POST handler
  return await client.chat.completions.create(params);
}

// Creates an AI client, handling API key source and endpoint configuration
function createClientFromSettings(settings: Settings) {
  // If no API key is provided in settings, fallback to ANTHROPIC_API_KEY environment variable
  // TODO: Decide if this fallback is desired for charter generation, or if it should error.
  if (!settings.apiKey) {
    console.warn("No API key in settings, falling back to ANTHROPIC_API_KEY env var");
    return createClient(process.env.ANTHROPIC_API_KEY!); // Uses default base URL (likely OpenAI or Anthropic)
  }

  // If an API key is provided, use it and configure the client for OpenRouter
  console.log("Using OpenRouter with provided API key");
  return createClient(settings.apiKey, "https://openrouter.ai/api/v1"); // Explicitly sets OpenRouter endpoint
}
