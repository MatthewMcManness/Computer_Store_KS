---
allowed-tools: Bash, Read, Write, LS, Task
---

# Issue Start

Begin work on a GitHub issue with parallel agents based on work stream analysis.

## Usage
```
/pm:issue-start <issue_number>
```

## Quick Check

1. **Get issue details:**
   ```bash
   gh issue view $ARGUMENTS --json state,title,labels,body
   ```
   If it fails: "❌ Cannot access issue #$ARGUMENTS. Check number or run: gh auth login"

2. **Find local task file:**
   - First check if `.claude/epics/*/$ARGUMENTS.md` exists (new naming)
   - If not found, search for file containing `github:.*issues/$ARGUMENTS` in frontmatter (old naming)
   - If not found: "❌ No local task for issue #$ARGUMENTS. This issue may have been created outside the PM system."

3. **Check for analysis:**
   ```bash
   test -f .claude/epics/*/$ARGUMENTS-analysis.md || echo "❌ No analysis found for issue #$ARGUMENTS
   
   Run: /pm:issue-analyze $ARGUMENTS first
   Or: /pm:issue-start $ARGUMENTS --analyze to do both"
   ```
   If no analysis exists and no --analyze flag, stop execution.

## Instructions

### 1. Ensure Worktree Exists

Check if epic worktree exists:
```bash
# Find epic name from task file
epic_name={extracted_from_path}

# Check worktree
if ! git worktree list | grep -q "epic-$epic_name"; then
  echo "❌ No worktree for epic. Run: /pm:epic-start $epic_name"
  exit 1
fi
```

### 2. Read Analysis

Read `.claude/epics/{epic_name}/$ARGUMENTS-analysis.md`:
- Parse parallel streams
- Identify which can start immediately
- Note dependencies between streams

### 3. Setup Progress Tracking

Get current datetime: `date -u +"%Y-%m-%dT%H:%M:%SZ"`

Create workspace structure:
```bash
mkdir -p .claude/epics/{epic_name}/updates/$ARGUMENTS
```

Update task file frontmatter `updated` field with current datetime.

### 4. Launch Bast Parallel Coordinator

Instead of launching individual agents, use Bast's parallel coordinator:

```yaml
Task:
  description: "Issue #$ARGUMENTS - Parallel Execution"
  subagent_type: "bast-parallel-coordinator"
  prompt: |
    Coordinate parallel execution for Issue #$ARGUMENTS

    Epic: {epic_name}
    Worktree: ../epic-{epic_name}/

    Task file: .claude/epics/{epic_name}/$ARGUMENTS.md
    Analysis: .claude/epics/{epic_name}/$ARGUMENTS-analysis.md
    Updates dir: .claude/epics/{epic_name}/updates/$ARGUMENTS/

    IMPORTANT - Tool Preferences:
    - Python projects: Use 'uv' (not pip)
    - Node projects: Use 'bun' (not npm)
    - Docker: Use 'docker compose' (not docker-compose)

    Your responsibilities:
    1. Read analysis to identify work streams
    2. Match each stream to BEST Bast specialized agent:
       - Frontend → react-specialist, frontend-developer, vue-expert
       - Backend → backend-developer, api-designer, python-pro, etc.
       - Database → database-administrator, postgres-pro
       - Infrastructure → devops-engineer, kubernetes-specialist
       - Tests → test-automator, qa-expert
    3. Spawn selected specialists in parallel
    4. Coordinate their execution
    5. Return consolidated summary

    Create progress files in updates/$ARGUMENTS/ for tracking.
    All commits must use format: "Issue #$ARGUMENTS: {change}"
```

### 5. GitHub Assignment

```bash
# Assign to self and mark in-progress
gh issue edit $ARGUMENTS --add-assignee @me --add-label "in-progress"
```

### 6. Output

```
✅ Started parallel work on issue #$ARGUMENTS

Epic: {epic_name}
Worktree: ../epic-{epic_name}/

Launching {count} parallel agents:
  Stream A: {name} (Agent-1) ✓ Started
  Stream B: {name} (Agent-2) ✓ Started
  Stream C: {name} - Waiting (depends on A)

Progress tracking:
  .claude/epics/{epic_name}/updates/$ARGUMENTS/

Monitor with: /pm:epic-status {epic_name}
Sync updates: /pm:issue-sync $ARGUMENTS
```

## Error Handling

If any step fails, report clearly:
- "❌ {What failed}: {How to fix}"
- Continue with what's possible
- Never leave partial state

## Important Notes

Follow `/rules/datetime.md` for timestamps.
Keep it simple - trust that GitHub and file system work.