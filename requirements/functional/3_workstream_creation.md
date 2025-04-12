# 3. Work Stream Creation Functional Requirement

## User Story

As a user, after a project charter has been generated and displayed, I want the ability to edit the charter text if needed.
Then, I want to click a dedicated button (e.g., 'Generate Workstreams') associated with the charter.
Upon clicking this button, I expect the application to use the AI, considering the current charter content, to generate a list of relevant workstreams, each with a name and description.
This list of workstreams should then be displayed within the designated 'Workstreams' section of the Charter shape, with each workstream name acting as a clickable link.

## Acceptance Criteria

- The displayed project charter text within its shape is editable.
- A button (e.g., 'Generate Workstreams') is visible and associated with the Charter shape.
- When the user clicks the 'Generate Workstreams' button:
    - The application sends the current (potentially edited) project charter text to the AI service.
    - The AI service returns a list of workstreams, each containing at least a name and a description.
- The generated workstreams are displayed as a list within the 'Workstreams' section of the Charter shape.
- Each workstream name in the list is presented as a hyperlink or clickable element.
- The initial state of the workstream list (before generation) is empty. 