# Technical Requirements: OpenRouter AI Provider Integration

## 1. Introduction
This document outlines the technical requirements for integrating OpenRouter (openrouter.ai) as the unified AI model provider for the TaskForge application. This change aims to simplify model management, provide access to a wider variety of models through a single API, and potentially optimize costs and performance **within the context of this Proof of Concept (POC) application.**

## 2. Goal
Replace the existing multi-provider AI integration (currently supporting Anthropic, Groq, OpenAI, Mistral) with a single integration point using the OpenRouter API, **managed directly from the client-side application.**

## 3. Rationale
- **Model Diversity:** Gain access to a vast range of models hosted by OpenRouter without needing separate integrations for each.
- **Simplified Configuration:** Manage a single API endpoint and key instead of multiple ones.
- **Potential Cost/Performance Optimization:** Ability to easily switch between models on OpenRouter to find the best fit for specific tasks based on cost, speed, and capability.
- **Unified API:** Utilize OpenRouter's OpenAI-compatible API structure for consistency.
- **POC Simplicity:** For this prototype phase, direct client-side integration simplifies the architecture by avoiding the need for a dedicated backend proxy.

## 4. Functional Requirements
- The application must allow the user to configure their OpenRouter API key directly within the application settings UI.
- The user must be able to specify which specific model available on OpenRouter should be used by TaskForge (e.g., `anthropic/claude-3-haiku-20240307`, `google/gemini-pro-1.5`, `mistralai/mistral-7b-instruct`) via the settings UI.
- All AI-driven features within TaskForge (e.g., WBS generation, task analysis) must function correctly using the user-configured OpenRouter API key and model.
- Error handling must be adapted to correctly interpret and report errors originating from the OpenRouter API to the user.
- **A clear warning must be displayed in the settings UI regarding the security implications of storing the API key in the browser.**

## 5. Technical Specifications
- **Configuration & Storage:**
    - User settings, including the OpenRouter API key and selected model name, will be stored client-side, likely using a state management library (e.g., Jotai) with persistence (e.g., browser `localStorage`).
    - Configuration Fields (managed client-side):
        - `apiKey`: The user's OpenRouter API key (input via UI).
        - `model`: The identifier of the desired model on OpenRouter (selected via UI).
        - `prompt` (Optional): User-defined prompt modifications (input via UI).
- **API Interaction:**
    - Refactor existing AI client code (likely in `ai/` directory) to make **direct calls** from the client browser to the OpenRouter API endpoint (`https://openrouter.ai/api/v1/chat/completions`).
    - Ensure the client correctly passes the user-provided `apiKey` as a Bearer token in the `Authorization` header.
    - Pass the configured `model` name in the `model` field of the API request payload.
    - Implement appropriate headers as per OpenRouter best practices (see below), configured client-side if possible or omitted if impractical for POC.
        - `HTTP-Referer`: Set to a relevant project URL (e.g., the app's domain or a placeholder like `http://localhost/taskforge`).
        - `X-Title`: Set to an application name (e.g., "TaskForge POC").
- **Model Provider Logic:**
    - Remove or refactor the existing multi-provider logic (`Provider` type, `modelToProvider`, `selectKeyForModel` in `ai/models.ts`) to exclusively use the single OpenRouter API key and model name stored in the client-side settings.
    - Retain or adapt the `modelToOpenRouter` mapping if the UI uses simplified names.
- **Error Handling:**
    - Implement client-side logic to parse and manage potential errors specific to OpenRouter (e.g., rate limits, model not found, invalid key). Display informative error messages to the user.
- **Documentation:**
    - Update project README and any relevant documentation to reflect the use of OpenRouter, emphasizing the client-side API key handling and associated security warnings for this POC.

## 6. Security Warning (POC Context)

**CRITICAL:** Storing API keys directly on the client-side (in the browser's memory or local storage) is **inherently insecure**. The key can be easily extracted by anyone using browser developer tools.

- **For this POC:** This approach is accepted to simplify development.
- **User Advisory:** Users must be clearly warned within the application UI (e.g., in the settings) that their API key is stored locally and is potentially exposed. They should use keys with appropriate limits or understand the risks involved, especially if sharing the application or using it in untrusted environments.
- **Future Development:** If this project moves beyond a POC, implementing a secure backend proxy to handle the API key is **strongly recommended** as a high-priority task.

## 7. OpenRouter Best Practices to Implement (Client-Side Context)
- **API Key Handling:** Acknowledge the deviation from best practice (see Security Warning). The key will be stored client-side.
- **Model Identifiers:** Always use the full model identifier provided by OpenRouter (e.g., `vendor/model-name`) when making API calls, even if the UI displays a simpler name.
- **Custom Headers:** (Best effort for client-side)
    - Attempt to set the `HTTP-Referer` header in client-side requests.
    - Attempt to set the `X-Title` header in client-side requests.
- **Rate Limiting:** Be aware of potential rate limits. Implement client-side retry logic with exponential backoff for rate limit errors (e.g., HTTP 429) if feasible, or at least inform the user clearly.
- **Streaming:** If TaskForge utilizes streaming responses, ensure the client-side implementation is compatible with OpenRouter's streaming format.

## 8. Out of Scope (Initial Implementation)
- Secure server-side handling of the API key.
- Dynamic model selection UI beyond the pre-defined list (unless already implemented).
- Support for provider-specific features not exposed through the standard OpenAI-compatible API structure.
- Automatic cost tracking or budgeting based on OpenRouter usage (users should monitor this via their OpenRouter dashboard).

## 9. Acceptance Criteria
- TaskForge successfully makes AI calls directly from the client using a model and API key configured in the settings UI.
- The application stores the API key and selected model client-side.
- API requests to OpenRouter include the `Authorization` header with the user's key, and attempt to include `HTTP-Referer` and `X-Title`.
- Errors from the OpenRouter API are handled gracefully on the client-side and shown to the user.
- A security warning regarding client-side key storage is visible in the settings UI.
- References to previous specific providers (Anthropic, Groq, etc.) and multi-key logic are removed from the core AI client logic.
- Documentation is updated with OpenRouter setup instructions and security caveats. 