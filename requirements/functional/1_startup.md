# 1. Startup Functional Requirement

## User Story

As a user, when I start the application, I want it to check for a pre-configured API key.
- If the API key is not set, I want to be prompted to set it in the settings panel so that I can connect to the AI service.
- If the API key is set and the connection to OpenRouter is successful, I want the application to present the starting screen with an empty component prompting me to enter a project idea, so I can begin the project planning process.

## Acceptance Criteria

- On application launch, the system checks for the presence and validity of an API key.
- If no valid API key is found, a notification or prompt directs the user to the settings panel to enter the key.
- If a valid API key exists and connectivity to OpenRouter is confirmed:
    - The main application window displays.
    - A designated area (e.g., a text box or input field) is visible, prompting the user for a project idea.
    - No project charter or workstreams are displayed initially. 