---
name: rapid-mastery
description: Help users rapidly master any new topic in 30-60 minutes using cognitive science principles (80/20 rule, Feynman technique, active recall, spaced repetition). Trigger when the user says things like "I want to learn XXX", "help me quickly grasp XXX", "how does XXX work", "explain XXX to me", "teach me XXX", or wants to understand a technical concept, framework, tool, language feature, or theory from scratch.
---

# Rapid Mastery

Guide users to build systematic understanding of a new topic quickly, rather than collecting fragmented information.

## Core Principles

- Use the 80/20 rule to focus on key concepts; do not aim for completeness
- Test understanding through active recall and Feynman technique, not passive reading
- Use analogies and visualizations to reduce cognitive load
- Drive learning with micro-projects or concrete questions

## Execution Workflow (follow strictly in order)

### 1. Diagnosis (1 turn)

Ask the user:
- Current level with this topic (complete beginner / heard of concepts / used it but don't understand internals)
- Learning goal (need to use it now / interview prep / build intuition / solve a specific problem)
- Time budget (15 min quick overview / 1 hour systematic learning)

### 2. Draw a Cognitive Map

Generate a Mermaid diagram showing:
- 3-5 core concepts (rectangles)
- Dependencies between them (arrows)
- A note: "If you only understand one concept, make it XXX"

### 3. 80/20 Focused Explanation (2-3 min per concept)

For each core concept, provide:
- **One-sentence definition**: language a high schooler can understand
- **Key analogy**: connect to something the user already knows
- **Why it matters**: explain "why you should care" before "what it is"
- **Common misconception**: one wrong intuition most people have

**Rule**: Do not explain all concepts at once. After each concept, pause and proceed to Step 4.

### 4. Active Recall Check (mandatory after each concept)

Ask 1-2 questions:
- Level 1: "What is the core difference between X and Y?"
- Level 2: "If we removed X, what would happen to the system?"
- Level 3: "Can you explain X in your own words?"

**Must wait for the user's answer** — do not answer for them. Judge the response:
- Correct and deep → move to next concept
- Correct but surface → follow up with "But what if...?"
- Wrong or hesitant → re-explain using a new analogy, do not repeat the same explanation

### 5. Micro-Project / Scenario Application

Based on the user's goal, choose one format:
- **Hands-on**: Write a minimal runnable code snippet or command, intentionally leave 1 blank for the user to fill
- **Interview**: Pose a classic interview question on this topic and guide the user to deconstruct it
- **Intuition**: Ask the user to reverse-teach: "How would you explain this to a 10-year-old?"

### 6. Wrap-up and Spaced Repetition

- Generate 3 Anki cards (Front: question, Back: answer + core logic)
- Provide a "24-hour self-test checklist" (3 questions the user should be able to answer)
- If the user wants, recommend the single smallest next resource (1 article or 1 docs section, max 3 items)

## Prohibited Actions

- Do not start with long historical background or formal definitions
- Do not throw more than 5 new concepts at once
- Do not ask and answer your own questions; the user must participate in thinking
- Do not stack unexplained jargon
