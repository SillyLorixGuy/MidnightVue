# Graph Report - .  (2026-05-27)

## Corpus Check
- Corpus is ~43,533 words - fits in a single context window. You may not need a graph.

## Summary
- 97 nodes · 87 edges · 30 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.82)
- Token cost: 3,400 input · 1,180 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Offline Queue and Validation|Offline Queue and Validation]]
- [[_COMMUNITY_Profile Feature Planning|Profile Feature Planning]]
- [[_COMMUNITY_Test Infrastructure|Test Infrastructure]]
- [[_COMMUNITY_IntersectionObserver Composable|IntersectionObserver Composable]]
- [[_COMMUNITY_Auth and User Setup|Auth and User Setup]]
- [[_COMMUNITY_Pending Entries Store|Pending Entries Store]]
- [[_COMMUNITY_Timer Fix and Code Review|Timer Fix and Code Review]]
- [[_COMMUNITY_App Identity and Mascot|App Identity and Mascot]]
- [[_COMMUNITY_Anchors Composable|Anchors Composable]]
- [[_COMMUNITY_Entries Composable|Entries Composable]]
- [[_COMMUNITY_Profile Composable|Profile Composable]]
- [[_COMMUNITY_Vue TypeScript Setup|Vue TypeScript Setup]]
- [[_COMMUNITY_Entries Page Implementation|Entries Page Implementation]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Vitest Config|Vitest Config]]
- [[_COMMUNITY_Environment Types|Environment Types]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_EntryCard Tests|EntryCard Tests]]
- [[_COMMUNITY_ProfileHeader Tests|ProfileHeader Tests]]
- [[_COMMUNITY_Anchors Tests|Anchors Tests]]
- [[_COMMUNITY_Auth Tests|Auth Tests]]
- [[_COMMUNITY_Entries Tests|Entries Tests]]
- [[_COMMUNITY_Profile Tests|Profile Tests]]
- [[_COMMUNITY_Pending Entries Tests|Pending Entries Tests]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_Router|Router]]
- [[_COMMUNITY_ProfileEdit Tests|ProfileEdit Tests]]
- [[_COMMUNITY_Supabase Insert Commit|Supabase Insert Commit]]
- [[_COMMUNITY_Submit Status Refactor|Submit Status Refactor]]
- [[_COMMUNITY_Favicon Asset|Favicon Asset]]

## God Nodes (most connected - your core abstractions)
1. `Journal Submit â€” Completion Implementation Plan` - 9 edges
2. `InMemoryStorage` - 7 edges
3. `TheJournal.vue Component` - 5 edges
4. `read()` - 4 edges
5. `Task 5: TheJournal Offline Queue and Validation` - 4 edges
6. `Journal Submit â€” Completion Pass` - 4 edges
7. `Offline Queue Feature` - 4 edges
8. `Profile Page Implementation Goal` - 4 edges
9. `Profile Page Architecture` - 4 edges
10. `useProfile Composable Plan` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Default Avatar Image` --conceptually_related_to--> `Steam-style Avatar History Feature`  [INFERRED]
  public/default-avatar.png → docs/superpowers/plans/2026-05-26-profile-page.md
- `Entries Page + Supabase Backend Implementation Plan` --references--> `Supabase Setup Guide`  [INFERRED]
  docs/superpowers/plans/2026-05-23-entries-page.md → supabase/README.md
- `Entries Page + Supabase Backend Design Spec` --shares_data_with--> `Supabase Setup Guide`  [INFERRED]
  docs/superpowers/specs/2026-05-23-entries-page-design.md → supabase/README.md
- `MidnightVue Graph Report` --references--> `Profile Page Implementation Goal`  [INFERRED]
  graphify-out/GRAPH_REPORT.md → docs/superpowers/plans/2026-05-26-profile-page.md
- `Entries Page + Supabase Backend Design Spec` --rationale_for--> `Entries Page + Supabase Backend Implementation Plan`  [INFERRED]
  docs/superpowers/specs/2026-05-23-entries-page-design.md → docs/superpowers/plans/2026-05-23-entries-page.md

## Hyperedges (group relationships)
- **Entries Page + Supabase Backend Initiative** — plan_entries_page_supabase, spec_entries_page_design, supabase_readme_setup [INFERRED 0.85]
- **Offline Queue Implementation Flow** — task_5_offline_queue_validation, offline_queue_feature, pendinentries_module, thejournal_vue [EXTRACTED 1.00]
- **Timer Leak Fix and Quality Review** — task_7_code_quality_review, timer_leak_issue, commit_1f56d24, commit_ac862e4 [EXTRACTED 1.00]
- **Graphify Change Detection Pipeline** — task_8_graphify_update, graphify_tool, graph_report [EXTRACTED 1.00]
- **Profile Feature Full Stack** — profile_page_plan_db_migration, profile_page_plan_useprofile, profile_page_plan_theprofileedit, profile_page_plan_profileheader, profile_page_plan_profileentrieslist [EXTRACTED 0.95]

## Communities

### Community 0 - "Offline Queue and Validation"
Cohesion: 0.19
Nodes (16): Commit 843cacc: offline queue + validation, Content Validation, Graphify Tool: AST Extraction and Change Detection, Offline Queue Feature, pendingEntries localStorage Module, Journal Submit â€” Completion Implementation Plan, Journal Submit â€” Completion Pass, Task 1: Vitest Infrastructure (+8 more)

### Community 1 - "Profile Feature Planning"
Cohesion: 0.14
Nodes (15): MidnightVue Graph Report, Profile Page Design Spec, Profile Page Architecture, Avatar 3-File Retention Policy, Steam-style Avatar History Feature, Bio Max 250 Chars Constraint, DB Migration 0002_profile_rpc.sql, Profile Page Implementation Goal (+7 more)

### Community 2 - "Test Infrastructure"
Cohesion: 0.25
Nodes (1): InMemoryStorage

### Community 3 - "IntersectionObserver Composable"
Cohesion: 0.33
Nodes (0): 

### Community 4 - "Auth and User Setup"
Cohesion: 0.47
Nodes (3): applySession(), ensureProfile(), generateUsername()

### Community 5 - "Pending Entries Store"
Cohesion: 0.67
Nodes (5): add(), count(), read(), remove(), write()

### Community 6 - "Timer Fix and Code Review"
Cohesion: 0.67
Nodes (4): Commit 1f56d24: timer fix, Commit ac862e4: timer fix (duplicate), Task 7: Code Quality Review, Timer Leak Issue

### Community 7 - "App Identity and Mascot"
Cohesion: 0.67
Nodes (4): Default profile picture (pfp.png) — close-up meme-style photo of a white cat with tongue slightly out, Mood: humorous, casual, internet-meme tone — softens the intimate journaling context, Default user avatar role in MidnightVue journaling app — playful, lighthearted placeholder identity, White cat with dark eyes and protruding tongue (blep), grainy meme aesthetic

### Community 8 - "Anchors Composable"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Entries Composable"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Profile Composable"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Vue TypeScript Setup"
Cohesion: 0.67
Nodes (3): Vue 3 <script setup> SFCs, Vue 3 + TypeScript + Vite Template, Vue Docs TypeScript Guide

### Community 12 - "Entries Page Implementation"
Cohesion: 1.0
Nodes (3): Entries Page + Supabase Backend Implementation Plan, Entries Page + Supabase Backend Design Spec, Supabase Setup Guide

### Community 13 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Vitest Config"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Environment Types"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "App Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "EntryCard Tests"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "ProfileHeader Tests"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Anchors Tests"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Auth Tests"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Entries Tests"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Profile Tests"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Pending Entries Tests"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Supabase Client"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Router"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "ProfileEdit Tests"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Supabase Insert Commit"
Cohesion: 1.0
Nodes (1): Commit e8e40d3: supabase insert

### Community 28 - "Submit Status Refactor"
Cohesion: 1.0
Nodes (1): Commit b51ca54: submitStatus refactor

### Community 29 - "Favicon Asset"
Cohesion: 1.0
Nodes (1): MidnightVue Favicon

## Knowledge Gaps
- **15 isolated node(s):** `Vue 3 <script setup> SFCs`, `Vue Docs TypeScript Guide`, `Commit e8e40d3: supabase insert`, `Commit b51ca54: submitStatus refactor`, `Commit 843cacc: offline queue + validation` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Vite Config`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vitest Config`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Environment Types`** (1 nodes): `env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Entry Point`** (1 nodes): `main.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `EntryCard Tests`** (1 nodes): `EntryCard.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ProfileHeader Tests`** (1 nodes): `ProfileHeader.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Anchors Tests`** (1 nodes): `useAnchors.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Tests`** (1 nodes): `useAuth.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Entries Tests`** (1 nodes): `useEntries.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Profile Tests`** (1 nodes): `useProfile.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pending Entries Tests`** (1 nodes): `pendingEntries.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Client`** (1 nodes): `supabase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Router`** (1 nodes): `main.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ProfileEdit Tests`** (1 nodes): `TheProfileEdit.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Insert Commit`** (1 nodes): `Commit e8e40d3: supabase insert`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Submit Status Refactor`** (1 nodes): `Commit b51ca54: submitStatus refactor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Favicon Asset`** (1 nodes): `MidnightVue Favicon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Journal Submit â€” Completion Implementation Plan` connect `Offline Queue and Validation` to `Timer Fix and Code Review`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Task 7: Code Quality Review` connect `Timer Fix and Code Review` to `Offline Queue and Validation`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TheJournal.vue Component` (e.g. with `useEntries Composable` and `pendingEntries localStorage Module`) actually correct?**
  _`TheJournal.vue Component` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Vue 3 <script setup> SFCs`, `Vue Docs TypeScript Guide`, `Commit e8e40d3: supabase insert` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Profile Feature Planning` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._