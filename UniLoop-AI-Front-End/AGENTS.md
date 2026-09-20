<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Local macOS completion notification

For every material implementation, debugging, review, or verification task completed locally on macOS:

1. Finish all required work first.
2. Run all requested validation commands.
3. Provide the normal final report.
4. Then, as the final terminal action, run:

```bash
if [ "$(uname)" = "Darwin" ] && command -v osascript >/dev/null 2>&1; then
  osascript -e 'display notification "Codex task finished. Review the final report in VS Code." with title "UniLoop AI" sound name "Glass"'
fi
```

Do not run the notification for partial progress updates, failed tasks, or before validation completes. If the command fails, do not block the task; mention the failure in the final report.
