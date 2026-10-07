# Step 2-1: Add Functional Requirements Context

## Goal
Create a clear set of functional requirements to expand the TODO app, so that all core features are documented for future development.

## Instructions

### :keyboard: Activity: Launch a Codespace for this repository and create a new branch

Click the below button to open the **Create Codespace** page in a new tab. Use the default configuration.

   [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/{{full_repo_name}}?quickstart=1)

:pencil2: Create a new branch called `feature/context`. :pencil2:

#### :keyboard: Activity: Ask Copilot to create functional requirements

1. Open the **Copilot** chat panel and switch to **Agent** mode using the dropdown menu.
2. In the Copilot chat input field, ask Copilot to create a new file at `docs/functional-requirements.md` that lists the core functional requirements you want for your TODO app, for example: the user can add a due date to a task, the task can be edited, the tasks are sorted in a specific order, etc. Remember to make sure that your intent is clear!
3. Ask Copilot to update `copilot-instructions.md` to reference the new `functional-requirements.md` file.
4. Commit and push your changes.


#### Success Criteria
To complete this exercise successfully, ensure that:
- A new `feature/context` branch is pushed
- `docs/functional-requirements.md` exists and contains the specified requirements.
- `copilot-instructions.md` is updated to reference `functional-requirements.md`.

If you encounter any issues, you can:
- Double check that the newly pushed branch is called `feature/context`
- Review that `docs/functional-requirements.md` was created and `copilot-instructions.md` was updated
- Ask Copilot to fix specific problems


## Why?
Defining functional requirements up front helps all contributors understand the expected features and behaviors of the app, and provides a reference for future enhancements and testing.
