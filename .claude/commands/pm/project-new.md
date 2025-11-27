---
allowed-tools: Bash, Read, Write, Task
---

# Project New

Create a new project with full Bast + CCPM setup in the correct directory structure.

## Usage
```
/pm:project-new
```

This will launch an interactive wizard to:
1. Determine project type (Internal, Client, Potential Client, Misc)
2. Get project/client name
3. Create directory structure
4. Initialize git repository
5. Set up CCPM structure
6. Create initial CLAUDE.md
7. Set up GitHub repository (optional)

## Instructions

### 1. Launch Project Creation Wizard

Use the Task tool to spawn an interactive agent:

```yaml
Task:
  description: "Project Creation Wizard"
  subagent_type: "general-purpose"
  prompt: |
    You are Bast's project creation wizard. Guide the user through creating a new project.

    PROJECT STRUCTURE:
    /home/matthew/Bast/Projects/
    ├── Internal/              # Internal Bast projects
    ├── Clients/              # Active client projects
    │   └── [ClientName]/
    │       └── [ProjectName]/
    ├── Potential Clients/    # Prospect projects
    │   └── [ClientName]/
    │       └── [ProjectName]/
    ├── Misc/                 # Miscellaneous projects
    └── Archived/            # Completed/archived projects

    STEP 1: ASK PROJECT TYPE
    Ask: "What type of project is this?"
    Options:
    1. Internal (Bast internal project)
    2. Client (Active paying client)
    3. Potential Client (Prospect/proposal)
    4. Misc (Experiments, learning, etc.)

    STEP 2: GET PROJECT DETAILS
    Based on type:

    If Internal:
      Ask: "Project name?" (e.g., "Dashboard-v2", "API-Rewrite")
      Path will be: /home/matthew/Bast/Projects/Internal/[ProjectName]

    If Client or Potential Client:
      Ask: "Client name?" (e.g., "Acme-Corp", "TechStartup")
      Ask: "Project name?" (e.g., "Website-Redesign", "Mobile-App")
      Path will be: /home/matthew/Bast/Projects/[Type]/[ClientName]/[ProjectName]

    If Misc:
      Ask: "Project name?" (e.g., "Rust-Learning", "React-Experiment")
      Path will be: /home/matthew/Bast/Projects/Misc/[ProjectName]

    STEP 3: ASK PROJECT STACK
    Ask: "What's the tech stack?"
    Options:
    1. Full-stack Web (React/Next.js + Python/Node backend)
    2. Frontend Only (React/Vue/Angular)
    3. Backend Only (Python/Node/Go/Rust)
    4. Mobile App (React Native/Flutter)
    5. Infrastructure/DevOps
    6. Data/ML Project
    7. Other/Custom

    STEP 4: GITHUB SETUP
    Ask: "Create GitHub repository?"
    Options:
    1. Yes - Public
    2. Yes - Private
    3. No - Local only (can add later)

    STEP 5: CONFIRM AND CREATE
    Show summary:
    ```
    Project Summary:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Type:     [Type]
    Client:   [ClientName] (if applicable)
    Name:     [ProjectName]
    Path:     [Full path]
    Stack:    [Stack description]
    GitHub:   [Yes/No - Public/Private]
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ```

    Ask: "Create this project? (yes/no)"

    STEP 6: CREATE PROJECT
    If confirmed, run these commands:

    ```bash
    # Create directory structure
    PROJECT_PATH="[calculated path]"
    mkdir -p "$PROJECT_PATH"
    cd "$PROJECT_PATH"

    # Initialize git
    git init
    git branch -M main

    # Create .gitignore based on stack
    cat > .gitignore << 'EOF'
    # Dependencies
    node_modules/
    .pnp/
    __pycache__/
    *.py[cod]
    .venv/
    venv/

    # Environment
    .env
    .env.local
    .env.*.local
    *.env

    # IDE
    .vscode/
    .idea/
    *.swp
    *.swo
    *~

    # OS
    .DS_Store
    Thumbs.db

    # Build outputs
    dist/
    build/
    *.egg-info/
    .next/
    out/

    # Logs
    *.log
    npm-debug.log*

    # CCPM local workspace
    .claude/epics/
    .claude/settings.local.json

    # Testing
    .coverage
    htmlcov/
    .pytest_cache/
    coverage/
    EOF

    # Create CCPM structure
    mkdir -p .claude/{commands/pm,scripts/pm,prds,epics,context,rules,agents}

    # Copy CCPM commands and scripts from Bast
    cp -r /home/matthew/Bast/.claude/commands/pm/* .claude/commands/pm/
    cp -r /home/matthew/Bast/.claude/scripts/pm/* .claude/scripts/pm/
    chmod +x .claude/scripts/pm/*.sh

    # Copy essential agents
    cp /home/matthew/Bast/.claude/agents/bast-parallel-coordinator.md .claude/agents/
    cp /home/matthew/Bast/.claude/agents/parallel-worker.md .claude/agents/
    cp /home/matthew/Bast/.claude/agents/code-analyzer.md .claude/agents/
    cp /home/matthew/Bast/.claude/agents/file-analyzer.md .claude/agents/
    cp /home/matthew/Bast/.claude/agents/test-runner.md .claude/agents/

    # Copy PRD template
    cp /home/matthew/Bast/.claude/prds/_template-web-app.md .claude/prds/

    # Create CLAUDE.md
    cat > CLAUDE.md << 'EOF'
    # CLAUDE.md

    > Think carefully and implement the most concise solution that changes as little code as possible.

    ## Project-Specific Instructions

    Add your project-specific instructions here.

    ## Project Management

    This project uses Bast + CCPM for spec-driven development:
    - `/pm:prd-new <name>` - Create feature PRD
    - `/pm:prd-parse <name>` - Convert to technical epic
    - `/pm:epic-decompose <name>` - Break into tasks
    - `/pm:epic-sync <name>` - Sync to GitHub Issues
    - `/pm:issue-start <number>` - Start parallel execution

    See `.claude/PM_GUIDE.md` for full workflow.

    ## Tool Preferences

    - **Python:** Always use `uv` (not pip)
    - **Node:** Always use `bun` (not npm)
    - **Docker:** Always use `docker compose` (not docker-compose)

    ## Testing

    Always run tests before committing:
    - Python: `uv run pytest`
    - Node: `bun test`

    ## Code Style

    Follow existing patterns in the codebase.
    EOF

    # Create settings.json with Bast configuration
    cat > .claude/settings.json << 'EOF'
    {
      "outputStyle": "bast-web-dev.md",
      "hooks": {
        "Stop": [{
          "hooks": [{
            "type": "command",
            "command": "paplay /usr/share/sounds/freedesktop/stereo/complete.oga"
          }]
        }],
        "Notification": [{
          "hooks": [{
            "type": "command",
            "command": "paplay /usr/share/sounds/freedesktop/stereo/bell.oga"
          }]
        }]
      },
      "companyAnnouncements": [
        "🎯 Bast + CCPM Project Management Active",
        "📋 Spec-driven development: PRD → Epic → Task → Code",
        "⚡ Parallel execution enabled with 137 specialized agents"
      ]
    }
    EOF

    # Copy output style
    mkdir -p .claude/output-styles
    cp /home/matthew/Bast/.claude/output-styles/bast-web-dev.md .claude/output-styles/

    # Create README.md based on stack
    cat > README.md << 'EOF'
    # [ProjectName]

    [Brief project description]

    ## Tech Stack

    [List technologies]

    ## Getting Started

    [Setup instructions]

    ## Development

    [Development workflow]

    ## Project Management

    This project uses Bast + CCPM for spec-driven development.
    See `CLAUDE.md` for workflow commands.

    ## Testing

    [Test commands]

    ## Deployment

    [Deployment instructions]
    EOF

    # Create stack-specific files based on project type
    # (Add package.json, pyproject.toml, etc. based on stack)

    # Initial commit
    git add .
    git commit -m "Initial commit: Bast + CCPM project setup

    🤖 Generated with [Claude Code](https://claude.com/claude-code)

    Co-Authored-By: Claude <noreply@anthropic.com>"
    ```

    STEP 7: GITHUB SETUP (if requested)

    If user wants GitHub:
    ```bash
    # Create GitHub repository
    if [[ "$GITHUB_VISIBILITY" == "public" ]]; then
      gh repo create "$PROJECT_NAME" --public --source=. --remote=origin
    else
      gh repo create "$PROJECT_NAME" --private --source=. --remote=origin
    fi

    # Create GitHub labels
    gh label create "epic" --color "0E8A16" --description "Epic issue"
    gh label create "task" --color "1D76DB" --description "Task within epic"

    # Push initial commit
    git push -u origin main
    ```

    STEP 8: SUCCESS OUTPUT

    ```
    ✅ Project Created Successfully!
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📁 Location: [full path]
    🔗 GitHub:   [URL or "Local only"]

    ✨ What's ready:
    ✓ Git repository initialized
    ✓ CCPM structure created
    ✓ Bast configuration copied
    ✓ 137 specialized agents available
    ✓ Audio notifications configured
    ✓ Tool preferences set (uv/bun)
    ✓ GitHub labels created (if applicable)

    🚀 Next steps:
    1. cd [path]
    2. Start with: /pm:prd-new first-feature
    3. Or explore: cat CLAUDE.md

    Ready to build! 🎊
    ```

    Return the project path so user can cd into it.
```

## Output

The agent should return the created project path and confirmation message.

## Error Handling

- If directory already exists, ask to overwrite or choose new name
- If GitHub auth fails, offer to skip and set up later
- If any step fails, report clearly and offer to retry

## Important Notes

- Always use absolute paths
- Preserve Bast personality and agents
- Set up tool preferences automatically
- Make it easy to start with CCPM workflow
