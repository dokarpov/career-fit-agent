# Tool registry

| Tool | Job | Input | Output | Side effect | Approval |
|---|---|---|---|---|---|
| `extract_requirements` | Turn vacancy text into candidate requirements | vacancy text | `Requirement[]` | none | system |
| `retrieve_evidence` | Retrieve likely proof from evidence vault | requirement + vault | ranked evidence | none | system |
| `match_evidence` | Classify proof strength | requirement + evidence | match + confidence | none | system |
| `route_review` | Decide auto-use vs human review vs gap | match | route | none | system |
| `assemble_proof_pack` | Build role-specific proof cards | verified matches | proof cards | creates draft only | system |
| `evaluate_cases` | Compare expected and actual routes | eval cases | pass/fail report | none | system |
| `send_application` | **Not implemented** | package | external action | external send | **person required** |

## Design rule

Read-only / draft-producing tools may run automatically.

Any future external action — application submission, recruiter message, profile edit — must require explicit human approval.
