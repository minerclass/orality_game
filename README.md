# Keeper of the Word: The Shifting Sensorium

An interactive, visually rich, arcade-style media ecology simulation game. It explores the restructuring of the human sensorium across five distinct historical and proposed technological phases of the word.

Developed for **Micah J. Miner's Media Ecology Project**.

## Conceptual Spine

The simulation leads players through a narrative journey carrying a single spoken message (*"The river always returns to collect what it has lent. Carry the children high, and speak no word you will not stand behind."*) through five technological transformations:

1. **Phase I: Primary Orality (The Council Fire)**:
   * *Concept*: Based on Walter J. Ong's work. The age of the voice, formulaic composition, and situational, communal memory.
   * *Gameplay*: Catch rising oral rhythmic embers in a memory pouch while avoiding abstract blocks.
2. **Phase II: Literacy & Print (The Scriptorium)**:
   * *Concept*: Walter J. Ong. The age of the page, where sound is frozen into rigid spatialized print. Saima's spoken breath (*"speak no word"*) mutates into printed type (*"write nothing"*).
   * *Gameplay*: Drag and typeset lead blocks into a composing stick frame.
3. **Phase III: Secondary Orality (The Broadcast Console)**:
   * *Concept*: Walter J. Ong. The electronic broadcast age (radio/television). A centralized, scripted voice reaching millions simultaneously.
   * *Gameplay*: Tune rotary frequency and amplitude dials on an oscilloscope console to sync receiver waves.
4. **Phase IV: Algorithmic Secondary Orality (The Attention Feed)**:
   * *Concept*: Proposed by Micah J. Miner. The age of recommendation feeds where curation is delegated to machines.
   * *Gameplay*: A Plinko pegboard physics simulation showing how formatting choices (Nuance vs. Outrage) determine virality and polarization (echo bubbles).
5. **Phase V: Tertiary Algorithmicity (The Turing Defusal Grid)**:
   * *Concept*: Proposed by Micah J. Miner. The age of generative AI, where symbol origination is offloaded to the machine (The Great Bypass).
   * *Gameplay*: A 10-second defusal grid to find and preserve the embodied human author node amid a flood of synthetic clones.

## Deep-Dive Academic Sandbox Quiz

After completing the game, players can review a comparative table outlining the five phases and play an interactive match-the-scenario quiz. The sandbox tests understanding of 10 real-world scenarios, complete with theoretical explanations of the media ecology dynamics at play.

## Technical Details

* **Single Page Application**: Fully contained in standard `index.html`, `style.css`, and `game.js`.
* **Programmatic Soundscapes**: Built with HTML5 Web Audio API. Synthesizes background textures (fire, scribe ambience, TV hiss, drone hums, warning signals) dynamically in real-time. No external audio files are required.
* **Responsive Visuals**: Particle engine canvases rendering custom environment modes.
* **Offline Compatible**: Designed for conference booths and presentations; runs entirely local via the `file://` protocol.

## Running the Simulation

1. Clone this repository.
2. Open `index.html` in any modern web browser.
3. Toggle the **SOUND ON** button in the top right to enable real-time synthesized soundscapes.
4. Press `F11` to enter fullscreen mode for the best presentation experience.

## References

* Ong, Walter J. (1982). *Orality and Literacy: The Technologizing of the Word*.
* Miner, Micah J. *Beyond Secondary Orality: Tertiary Algorithmicity & Pedagogical Friction*.
