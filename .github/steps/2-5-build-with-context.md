# Step 2-5: Build with Context

## Goal
Leverage all the context and documentation you have created to guide Copilot in expanding the TODO app.

## Instructions

#### :keyboard: Activity: Ask Copilot to build the app using the generated context

1. Open the **Copilot** chat panel and switch to **Agent** mode using the dropdown menu.
2. In the Copilot chat input field, ask Copilot to use the information and guidelines in `.github/copilot-instructions.md` to come up with an implementation plan to expand the TODO app.
3. Review the plan Copilot proposes and ensure it aligns with the context and standards you have established.
4. When you are happy with the plan, ask Copilot to proceed with the implementation and follow along.
5. Once the plan is implemented, start the app and observe its behavior. You can run the tests right now, but we will focus on those in more depth in the next step.
6. When you are satisfied, commit and push your changes.


#### Success Criteria
- Copilot references and follows the context in `.github/copilot-instructions.md` when expanding the app.
- The new or updated code aligns with the documented standards and practices.
- Test files are present for the codebase for each layer of the application (unit, integration, end-to-end UI)

If you encounter any issues, you can:
- Ask Copilot to clarify or adjust its approach
- Review that the implementation matches the documented context

## Why?
- Using a single, well-maintained context file helps ensure that all contributors and Copilot itself build features that are consistent, maintainable, and aligned with the project's goals and standards.