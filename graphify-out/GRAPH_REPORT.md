# Graph Report - .  (2026-05-24)

## Corpus Check
- Corpus is ~25,977 words - fits in a single context window. You may not need a graph.

## Summary
- 32 nodes · 20 edges · 16 communities detected
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth & Session|Auth & Session]]
- [[_COMMUNITY_Default Avatar Image|Default Avatar Image]]
- [[_COMMUNITY_Anchors Composable|Anchors Composable]]
- [[_COMMUNITY_Entries Composable|Entries Composable]]
- [[_COMMUNITY_Vue 3 Template Docs|Vue 3 Template Docs]]
- [[_COMMUNITY_Entries Page Initiative|Entries Page Initiative]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Vitest Config|Vitest Config]]
- [[_COMMUNITY_Type Declarations|Type Declarations]]
- [[_COMMUNITY_App Bootstrap|App Bootstrap]]
- [[_COMMUNITY_EntryCard Tests|EntryCard Tests]]
- [[_COMMUNITY_Anchors Tests|Anchors Tests]]
- [[_COMMUNITY_Auth Tests|Auth Tests]]
- [[_COMMUNITY_Entries Tests|Entries Tests]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_Router|Router]]

## God Nodes (most connected - your core abstractions)
1. `ensureProfile()` - 3 edges
2. `generateUsername()` - 2 edges
3. `applySession()` - 2 edges
4. `Vue 3 + TypeScript + Vite Template` - 2 edges
5. `Entries Page + Supabase Backend Implementation Plan` - 2 edges
6. `Entries Page + Supabase Backend Design Spec` - 2 edges
7. `Supabase Setup Guide` - 2 edges
8. `Default profile picture (pfp.png) — close-up meme-style photo of a white cat with tongue slightly out` - 2 edges
9. `White cat with dark eyes and protruding tongue (blep), grainy meme aesthetic` - 2 edges
10. `Default user avatar role in MidnightVue journaling app — playful, lighthearted placeholder identity` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Entries Page + Supabase Backend Implementation Plan` --references--> `Supabase Setup Guide`  [INFERRED]
  docs/superpowers/plans/2026-05-23-entries-page.md → supabase/README.md
- `Entries Page + Supabase Backend Design Spec` --shares_data_with--> `Supabase Setup Guide`  [INFERRED]
  docs/superpowers/specs/2026-05-23-entries-page-design.md → supabase/README.md
- `Entries Page + Supabase Backend Design Spec` --rationale_for--> `Entries Page + Supabase Backend Implementation Plan`  [INFERRED]
  docs/superpowers/specs/2026-05-23-entries-page-design.md → docs/superpowers/plans/2026-05-23-entries-page.md

## Hyperedges (group relationships)
- **Entries Page + Supabase Backend Initiative** — plan_entries_page_supabase, spec_entries_page_design, supabase_readme_setup [INFERRED 0.85]

## Communities

### Community 0 - "Auth & Session"
Cohesion: 0.47
Nodes (3): applySession(), ensureProfile(), generateUsername()

### Community 1 - "Default Avatar Image"
Cohesion: 0.67
Nodes (4): Default profile picture (pfp.png) — close-up meme-style photo of a white cat with tongue slightly out, Mood: humorous, casual, internet-meme tone — softens the intimate journaling context, Default user avatar role in MidnightVue journaling app — playful, lighthearted placeholder identity, White cat with dark eyes and protruding tongue (blep), grainy meme aesthetic

### Community 2 - "Anchors Composable"
Cohesion: 0.67
Nodes (0): 

### Community 3 - "Entries Composable"
Cohesion: 0.67
Nodes (0): 

### Community 4 - "Vue 3 Template Docs"
Cohesion: 0.67
Nodes (3): Vue 3 <script setup> SFCs, Vue 3 + TypeScript + Vite Template, Vue Docs TypeScript Guide

### Community 5 - "Entries Page Initiative"
Cohesion: 1.0
Nodes (3): Entries Page + Supabase Backend Implementation Plan, Entries Page + Supabase Backend Design Spec, Supabase Setup Guide

### Community 6 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Vitest Config"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "App Bootstrap"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "EntryCard Tests"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Anchors Tests"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Auth Tests"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Entries Tests"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Supabase Client"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Router"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **2 isolated node(s):** `Vue 3 <script setup> SFCs`, `Vue Docs TypeScript Guide`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Vite Config`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vitest Config`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Type Declarations`** (1 nodes): `env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Bootstrap`** (1 nodes): `main.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `EntryCard Tests`** (1 nodes): `EntryCard.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Anchors Tests`** (1 nodes): `useAnchors.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Tests`** (1 nodes): `useAuth.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Entries Tests`** (1 nodes): `useEntries.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Client`** (1 nodes): `supabase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Router`** (1 nodes): `main.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `Entries Page + Supabase Backend Implementation Plan` (e.g. with `Entries Page + Supabase Backend Design Spec` and `Supabase Setup Guide`) actually correct?**
  _`Entries Page + Supabase Backend Implementation Plan` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Vue 3 <script setup> SFCs`, `Vue Docs TypeScript Guide` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._