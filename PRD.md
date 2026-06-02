Project name**:** Terminal Tutor  
**Owner:** Carlos Franzetti  
**Date:** April 16, 2026

## **Problem statement**

Developers and tech-curious learners know that CLIs are powerful but getting started is intimidating. Tools like the GitHub CLI, GitHub Copilot CLI, Claude Code, Codex CLI, and database CLIs each have their own install flows, auth steps, and commands, buried in docs that read like reference manuals rather than guided tutorials. Beginners bounce between YouTube videos, blog posts, and outdated README snippets, copy-paste commands they don’t understand, and give up before they feel fluent. The result: powerful CLI tools sit unused on people’s machines, and the productivity gap between “I know the terminal” and “I don’t” keeps widening.

## **Users and needs:** 

**Primary user(s):** Beginner and intermediate developers, bootcamp students, and tech-curious learners who want to level up their terminal skills but feel lost staring at a blank prompt or a 40-page CLI docs page.

**Key user needs:**

* As a beginner developer, I need a low-pressure way to learn unfamiliar CLIs so I don’t get overwhelmed or give up before I feel competent.  
* As a bootcamp student, I need to install and authenticate tools like GitHub CLI and Copilot CLI correctly the first time so I can actually use them in my projects.  
* As a tech-curious learner, I need hands-on practice (not just reading docs) so the commands stick in my muscle memory.  
* As a self-directed learner, I need the experience to be fun not another dry tutorial so I stay motivated to finish.  
* As an advanced learner, I need each “quest” to go deep enough that I can pick up real skills (flags, configs, workflows), not just basics.

**Proposed solution** 

Terminal Tutor is a gamified, story-driven CLI trainer that runs directly in your terminal and teaches you real CLI tools starting with GitHub CLI and GitHub Copilot CLI through short, narrative-driven quests. Instead of a dry tutorial, users play through themed missions (“Escape the Merge Conflict Dungeon,” “Summon the Copilot”) where each objective maps to a real command they run in their own shell. The app verifies commands as they go, provides in-context hints, and unlocks the next beat of the story when the user succeeds. It is built around a modular quest engine, so new topics Claude Code, Codex CLI, terminal basics, Postgres/MongoDB CLIs, Docker, and more can be added as self-contained quest packs without changing the core app. The result: a platform where learning a new CLI feels less like reading a manual and more like playing a text adventure that teaches you a real skill.

## **Value proposition**

For beginner and intermediate developers who struggle to pick up new CLI tools because docs are dense and tutorials are boring, Terminal Tutor is a gamified, story-driven CLI trainer that runs in their actual terminal and turns learning GitHub CLI, Copilot CLI, Claude Code, Codex CLI, database CLIs, and more into short, entertaining quests. Unlike static docs, YouTube tutorials, or generic interactive courses, Terminal Tutor teaches by doing verifying real commands in the user’s real shell and its modular quest-pack architecture means new CLIs can be plugged in as new “worlds” without rebuilding anything, helping users go from “I’ve heard of this tool” to “I actually use this daily” in a single sitting.

## **Requirements**

*Requirements are organized/prioritized by critical user journeys, and help the team understand the scope of work and what functionality we need to offer. List the must-have vs future requirements to support the user journey, solve the problems, and align with the goals above.* 

*Tips:*

* ***Focus on functionality, NOT the specificity of design/tech implementation***   
  * *DO: “User can do X”, “User can identify who has access to their document”*  
  * *DON’T: “Add button to title bar” or “Add a homepage”*  
* *Labels: **\[MVP\]** for must-have features and **\[+\]** for nice-to-have / future requirement*

| Requirement (e.g. User can \[verb\]) | Priority (MVP or \+) |
| :---- | :---- |
| User can launch Terminal Tutor from their own terminal with a single command and see a welcome screen that explains the quest concept | MVP |
| User can browse a list of available quest packs (GitHub CLI, Copilot CLI, etc.) and choose which one to start | MVP |
| User can play through a GitHub CLI story-driven quest that teaches install, auth, creating a repo, opening a PR, and reviewing issues | MVP |
| User can play through a GitHub Copilot CLI quest that teaches install, auth, and at least three core prompts (explain, suggest, run) | MVP |
| User can run real commands in their actual shell and have Terminal Tutor verify the command (and its output, where relevant) before advancing the story | MVP |
| User can request a hint at any step and get an in-character, progressive nudge (not the full answer) that references the actual command or flag they need | MVP |
| User can see their progress within a quest (current step, total steps, XP earned) and resume where they left off in a future session | MVP |
| User can add new CLIs to Terminal Tutor via modular quest packs, where each pack is a self-contained file that the core engine loads no changes to the core app required | MVP |
| User can play a “Claude Code” quest pack that teaches install, auth, and core prompts/commands through a narrative mission | \+ |
| User can play a “Codex CLI” quest pack that teaches install, auth, and core workflows through a narrative mission | \+ |
| User can play a “Terminal Basics” quest pack (navigation, files, permissions, pipes) for learners who are new to the shell entirely | \+ |
| User can play database CLI quest packs (e.g. psql, mongosh) that teach connecting, querying, and admin basics in a story context | \+ |
| User can earn achievements/XP and see a simple leveling system to reinforce progress across multiple quest packs | \+ |

