# 🌌 TerraMorphs: The Exogenesis Chronicles – Game Rulebook & Player Guide

---

## 🎮 General Objective
You are a scientist on an uninhabited exoplanet tasked with engineering life forms using synthetic biology to survive extreme environments. You’ll pass through scientific modules to design genomes, test them, synthesize traits, simulate evolution, and terraform the world.

---

## ⚖ Game Procedure (Step-by-Step)

1. *Planet Naming*
   - Enter the name of your target planet.
   - This will be stored and reflected in all future modules.

2. *Genome Editor*
   - Select traits by interacting with genome tiles.
   - Traits influence body systems (skin, lungs, genome, etc.).
   - Save is automatic.

3. *BioForge*
   - Validate selected traits against environmental needs.
   - Interact with condition blocks.
   - Feedback sounds and status help you correct mistakes.

4. *Trait Drafting Console*
   - Refine and prioritize traits.
   - Select best traits from pool, categorize them by efficiency.

5. *DNA Synthesis Lab*
   - Combine selected traits into a DNA strand.
   - View animated base-pair visualizations.
   - Get final trait summary and prepare for trials.

6. *Evolution Trials*
   - Real-time stress simulation based on exoplanet hazards.
   - Use traits to reduce stress in critical zones.
   - Survive at least 70% zones to unlock terraforming.

7. *Terraforming Equipment*
   - Gradual planetary transformation based on success.
   - Greenery and environment improve over time.
   - Final success screen and report.

---

## 🔧 Game Controls

| Action                        | Control                     |
|------------------------------|-----------------------------|
| Move Scientist                | W, A, S, D or Arrow Keys |
| Interact with Equipment      | Walk close to equipment     |
| Return to Lab View           | Esc or Exit Button in module |
| Resume Progress              | Auto prompt if saved data exists |
| Clear All Saved Data         | Open browser console → localStorage.clear() |
| To show the progress         | Swift + S |
| To find the Hints and Objectives | Swift + H |
| Click Unmute the start the gameplay | Click Unmute |

---

## 🧪 Module Guide

### 1. 🌍 Planet Naming (Starting Screen)
- First screen on game load.
- Player names the target planet.
- Stored in localStorage for later reference.

---

### 2. 🧬 Genome Editor
- Design your organism’s DNA using trait tiles.
- Traits can be dragged or toggled.
- Traits are saved as "playerGenome" and "finalDNASequence".
- Sound + animated trait selection feedback included.
- Automatically saves progress; resumes if reloaded.

---

### 3. ⚙ BioForge
- Converts your selected traits into engineered prototypes.
- Displays synthesis conditions (energy, environment).
- Resume support + correct/incorrect condition feedback.
- Style includes animated icons and condition indicators.
- Sound effects for feedback.
- Tracks completion in "bioForgeComplete".

---

### 4. 🔧 Trait Drafting Console
- Pick and filter the best traits for synthesis.
- Traits are categorized and rated for compatibility.
- Save support with "traitDraftProgress"; prompt shown on return.
- Audio for selections and visual filters.

---

### 5. 🧬 DNA Synthesis Lab
- Combines traits into a DNA strand.
- Visualization of base pairs and trait chains.
- Animation for correct order feedback.
- Final layout includes a summary of all traits.
- Saved progress via "dnaSynthesisComplete".

---

### 6. 🧢 Evolution Trials
- Real-time stress simulation of the organism.
- Each round = new phase with unique environmental threats.
- You must use traits strategically to keep zones alive.
- Stats:
  - 7 body zones (Heart, Skin, Genome, etc.)
  - Energy System for trait usage.
  - Cooldowns, effectiveness tracking, and zone stress bars.
- 🎯 Win = >70% zones alive → unlock Terraforming.
- Tracks: "evolutionTrialsComplete", "terraformingUnlocked", and "evolutionTrialSummary".

---

### 7. 🌱 Terraforming Equipment
- Visual simulation of planetary transformation.
- Gradual greening of planet + terraforming progress.
- Uses data from Evolution Trials for success level.
- Final Result screen with celebration sounds, effects.
- Tracks overall progress → triggers game end if complete.

---

## 🗝 Lab Navigation

- The main lab consists of 6 rooms in a 3×2 layout.
- Each equipment is represented on a minimap with labels:
  - GE – Genome Editor
  - BF – BioForge
  - TD – Trait Drafting
  - DS – DNA Synthesis
  - ET – Evolution Trials
  - TF – Terraforming

- Walk into equipment to enter respective module.
- Rooms glow when interactable.

---

## 📁 Save & Resume System

- All progress is automatically stored in localStorage.
- On returning to the lab or modules, prompts will appear to continue where left off.
- Clear storage by opening the console and typing:
js
localStorage.clear();


---

## 📋 Game Completion

- Full game completion occurs when:
  1. All modules are successfully passed.
  2. Evolution success is ≥75%.
  3. Terraforming simulation finishes.

- The final screen displays survival stats, trait efficiency, and bonus trait rewards.

---
