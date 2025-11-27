# Bast + CCPM Project Management Guide

Welcome to Bast's integrated project management system! This combines CCPM's spec-driven workflow with Bast's 137 specialized agents for maximum productivity.

## 🎯 Philosophy

**Spec-Driven Development:**
Every line of code traces back to a specification.
PRD → Epic → Task → Code → Commit

**Parallel Execution:**
Multiple specialized agents work simultaneously using git worktrees.

**Context Preservation:**
Agent hierarchy keeps the main conversation clean and focused.

## 🚀 Quick Start

### 1. Initialize (First Time Only)
```bash
/pm:init
```

This will:
- Install GitHub CLI if needed
- Authenticate with GitHub
- Install gh-sub-issue extension
- Create directory structure
- Set up GitHub labels

### 2. Create Your First Feature

```bash
# Step 1: Create PRD (Product Requirements Document)
/pm:prd-new user-authentication

# Step 2: Convert PRD to technical epic
/pm:prd-parse user-authentication

# Step 3: Break into tasks
/pm:epic-decompose user-authentication

# Step 4: Sync to GitHub Issues
/pm:epic-sync user-authentication

# Step 5: Start parallel execution
/pm:issue-start 1234
```

## 📋 Complete Workflow

### Phase 1: Product Planning

**Command:** `/pm:prd-new <feature-name>`

Creates a structured PRD in `.claude/prds/feature-name.md` with:
- Vision and problem statement
- User stories with acceptance criteria
- Success metrics
- Technical constraints
- Security/compliance requirements

**Example:**
```bash
/pm:prd-new dashboard-redesign
```

### Phase 2: Technical Planning

**Command:** `/pm:prd-parse <feature-name>`

Converts PRD into technical implementation epic:
- Architectural decisions
- Technology stack choices
- Database schema design
- API design
- Component architecture
- Dependency mapping

**Output:** `.claude/epics/feature-name/epic.md`

### Phase 3: Task Decomposition

**Command:** `/pm:epic-decompose <feature-name>`

Breaks epic into concrete tasks:
- Numbered task files (001.md, 002.md, etc.)
- Each task has scope, acceptance criteria, and effort estimate
- Identifies parallelizable tasks
- Notes dependencies between tasks

**Output:** `.claude/epics/feature-name/*.md`

### Phase 4: GitHub Synchronization

**Command:** `/pm:epic-sync <feature-name>`

Pushes to GitHub:
- Creates parent epic issue
- Creates sub-issues for each task
- Applies labels (epic, task, epic:name)
- Creates git worktree for development
- Renames task files to use issue IDs

**Output:** GitHub issues + worktree

### Phase 5: Parallel Execution

**Command:** `/pm:issue-start <issue-number>`

Launches Bast's parallel coordinator:
- Analyzes work streams
- Selects BEST specialized agent for each stream:
  - `react-specialist` for React UI
  - `backend-developer` for APIs
  - `database-administrator` for schema
  - `test-automator` for tests
- Spawns agents in parallel
- Coordinates execution
- Returns consolidated summary

**Example:**
```bash
/pm:issue-start 1234

# Bast will launch:
# - react-specialist (UI components)
# - backend-developer (API endpoints)
# - postgres-pro (database migrations)
# - test-automator (test suite)
# All working simultaneously!
```

## 🔧 Management Commands

### Status & Monitoring

```bash
/pm:status              # Project dashboard
/pm:standup             # Daily standup report
/pm:next                # Get next priority task
/pm:in-progress         # Show active work
/pm:blocked             # Show blocked tasks
```

### Issue Management

```bash
/pm:issue-show <num>    # View issue details
/pm:issue-status <num>  # Check status
/pm:issue-sync <num>    # Push updates to GitHub
/pm:issue-close <num>   # Mark complete
/pm:issue-edit <num>    # Edit details
```

### Epic Management

```bash
/pm:epic-list           # List all epics
/pm:epic-show <name>    # Display epic and tasks
/pm:epic-status <name>  # Show progress
/pm:epic-close <name>   # Mark complete
/pm:epic-edit <name>    # Edit details
```

### PRD Management

```bash
/pm:prd-list            # List all PRDs
/pm:prd-status <name>   # Implementation status
/pm:prd-edit <name>     # Edit PRD
```

### Maintenance

```bash
/pm:sync                # Bidirectional GitHub sync
/pm:validate            # Check system integrity
/pm:clean               # Archive completed work
/pm:search <query>      # Search across content
/pm:help                # Show help
```

## 🎨 Bast-Specific Features

### Tool Preferences (Automatic)

**Python Projects:**
- Always uses `uv` (not pip)
- Agents automatically informed

**Node Projects:**
- Always uses `bun` (not npm)
- Agents automatically informed

**Docker:**
- Uses `docker compose` (not docker-compose)

### Audio Feedback (Linux)

**Configured sounds:**
- **Stop:** Complete sound (task finished)
- **Notification:** Bell sound (attention needed)
- **SubagentStart:** Login sound (agent starting)
- **SubagentStop:** Logout sound (agent finished)

### Specialized Agent Selection

Bast automatically chooses the BEST agent for each stream:

**Frontend Work:**
- `frontend-developer` - General UI
- `react-specialist` - React optimization
- `vue-expert` - Vue 3 apps
- `nextjs-developer` - Next.js features
- `ui-designer` - Visual design

**Backend Work:**
- `backend-developer` - General APIs
- `api-designer` - REST/GraphQL design
- `python-pro` - Python services
- `golang-pro` - Go microservices
- `rust-engineer` - High-performance systems

**Database Work:**
- `database-administrator` - General DB
- `postgres-pro` - PostgreSQL
- `database-optimizer` - Performance tuning

**Infrastructure:**
- `devops-engineer` - CI/CD
- `kubernetes-specialist` - K8s
- `terraform-engineer` - IaC
- `cloud-architect` - Cloud design

## 📁 Directory Structure

```
.claude/
├── prds/                          # Product requirements
│   ├── _template-web-app.md      # PRD template
│   └── feature-name.md            # Your PRDs
├── epics/                         # Implementation plans
│   └── feature-name/
│       ├── epic.md                # Technical epic
│       ├── 1234.md                # Task (GitHub issue ID)
│       ├── 1235.md                # Another task
│       └── updates/               # Progress tracking
│           └── 1234/              # Per-issue updates
│               ├── stream-1.md
│               └── stream-2.md
├── commands/
│   └── pm/                        # PM commands
│       ├── prd-new.md
│       ├── epic-sync.md
│       ├── issue-start.md
│       └── ...
├── agents/
│   ├── bast-parallel-coordinator.md  # Bast's coordinator
│   ├── parallel-worker.md         # CCPM worker
│   └── [137 specialized agents]   # Your agent army
└── scripts/
    └── pm/                        # Bash utilities
        ├── init.sh
        ├── status.sh
        └── ...
```

## 🔄 Git Worktree Workflow

**What are worktrees?**
Separate working directories for the same git repo. Enables parallel development without branch switching.

**How Bast uses them:**
```
your-project/              # Main worktree (main branch)
├── .git/
├── src/
└── .claude/

../epic-feature-name/      # Epic worktree (epic/feature-name branch)
├── src/                   # Same code, different branch
└── .claude/               # Shared config

# Multiple agents work in epic-feature-name worktree simultaneously
# No conflicts with main branch
# Easy to review/merge when done
```

**Commands:**
```bash
git worktree list          # See all worktrees
git worktree remove <path> # Clean up finished epic
```

## 💡 Best Practices

### Writing Good PRDs

1. **Be specific about user value** - Why does this matter?
2. **Include acceptance criteria** - How do we know it's done?
3. **Define constraints early** - Performance, security, accessibility
4. **Identify dependencies** - What else needs to happen first?
5. **Consider edge cases** - Empty states, errors, loading

### Task Decomposition

1. **Make tasks atomic** - Each should be completable independently
2. **Identify parallelizable work** - Mark parallel: true when possible
3. **Note dependencies clearly** - Use depends_on field
4. **Size appropriately** - 2-4 hours per task is ideal
5. **Include test requirements** - Every task needs tests

### Parallel Execution

1. **Trust the coordinator** - Let Bast select the best agents
2. **Review consolidated summaries** - Don't micromanage individual agents
3. **Check progress regularly** - Use /pm:status and /pm:standup
4. **Sync updates to GitHub** - Keep issues current with /pm:issue-sync
5. **Clean up worktrees** - Remove when epic is merged

## 🐛 Troubleshooting

### GitHub Authentication Issues
```bash
gh auth login
gh auth status
```

### Worktree Conflicts
```bash
git worktree list
git worktree remove <path>  # If stale
```

### Permission Errors
Check `.claude/settings.local.json` permissions allow:
- `Bash(gh:*)`
- `Bash(git:*)`
- `Bash(.claude/scripts/pm/*)`

### Audio Not Working
Ensure PulseAudio is running:
```bash
pactl info
```

## 📚 Resources

- **CCPM Original:** https://github.com/automazeio/ccpm
- **Your Agents:** See `.claude/agents/` for all 137 specialists
- **Commands:** See `.claude/commands/pm/` for all PM commands
- **PRD Template:** `.claude/prds/_template-web-app.md`

## 🎉 Success!

You now have:
- ✅ CCPM's spec-driven workflow
- ✅ GitHub Issues as your PM database
- ✅ Git worktrees for parallel development
- ✅ 137 specialized Bast agents
- ✅ Smart agent selection and coordination
- ✅ Context preservation
- ✅ Linux audio feedback
- ✅ Your tool preferences (uv, bun, docker compose)

**Ready to build? Create your first PRD:**
```bash
/pm:prd-new my-awesome-feature
```

Welcome to spec-driven parallel development with Bast! 🚀
