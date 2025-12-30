# GitHub Issue Mapping

Epic: #14 - https://github.com/MatthewMcManness/Computer_Store_KS/issues/14

## Tasks

| Issue | Title | Local File |
|-------|-------|------------|
| #15 | Create RepairShopr API Client | 15.md |
| #16 | Create Server-Side Session Store | 16.md |
| #17 | Update Auth Library for RepairShopr Integration | 17.md |
| #18 | Update Login API Route | 18.md |
| #19 | Update Auth Check API Route | 19.md |
| #20 | Update Login UI with Email Field | 20.md |
| #21 | Add Role-Based Middleware | 21.md |
| #22 | Add Environment Configuration and Documentation | 22.md |
| #23 | Integration Testing with RepairShopr Accounts | 23.md |

## Dependency Graph

```
#15 (RepairShopr Client) ─┬─► #17 (Auth Library) ─┬─► #18 (Login API) ─► #20 (Login UI)
                         │                       │
#16 (Session Store) ─────┤                       ├─► #19 (Auth Check API)
                         │                       │
                         │                       └─► #21 (Role Middleware)
                         │
                         └─► #22 (Config & Docs)
                                                          ↓
                                                    #23 (Integration Testing)
```

Synced: 2025-11-28T18:42:00Z
