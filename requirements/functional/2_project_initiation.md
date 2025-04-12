# 2. Project Initiation to Project Charter Functional Requirement

## User Story

As a user, after launching the app with a valid API key, I want to enter my project idea into the designated input box and click a 'Go' (or similar) button.
I then want the application to interact with the AI to generate a project charter based on my idea.
Finally, I want this generated project charter to be displayed clearly within a distinct visual element (a 'Charter' shape), which should also include a placeholder for future workstreams, and allow me to edit the charter text directly.

## Acceptance Criteria

- The starting screen contains an input field for the project idea and a button to initiate charter generation.
- When the user enters text into the idea box and clicks the button:
    - The application sends the project idea to the configured AI service (OpenRouter).
    - The AI service returns a generated project charter text.
- A new visual element (Shape: Charter) appears on the screen.
- This shape prominently displays the generated project charter text.
- The charter text within the shape is editable by the user.
- The shape also contains a clearly marked, initially empty section or list designated for 'Workstreams'. 