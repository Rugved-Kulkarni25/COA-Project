# I/O Transfer Lab — COA Micro Project

**Project title:** Interactive Input/Output Data Transfer and DMA Simulator  
**Subject:** Computer Organization and Architecture (COA), CO5 Micro Project  
**Institute:** Sanjivani University, Kopargaon, Maharashtra  
**Student:** Rugved Kulkarni  
**PRN:** Not provided

## Overview
I/O Transfer Lab is a browser-based educational simulator that demonstrates three ways a computer can transfer data between an I/O device and main memory:

1. Programmed I/O
2. Interrupt-Driven I/O
3. Direct Memory Access (DMA)

It is built with HTML, CSS, and vanilla JavaScript. No framework, database, or API is required.

## Features
- Select one of the three transfer methods.
- Change data units, device-ready delay, polling cost, and interrupt service cost.
- Generate an execution trace and reveal it one step at a time.
- Use auto-play and pause controls.
- Visualize the I/O device, CPU, DMA controller, and memory.
- Track progress, CPU busy ticks, elapsed ticks, and CPU involvement.
- Compare the three methods using the same input settings.
- Responsive layout for desktop and mobile screens.
- Input validation and reset controls.

## Run locally
1. Download or extract the project folder.
2. Keep `index.html`, `style.css`, and `script.js` in the same folder.
3. Open `index.html` in a modern browser such as Chrome, Edge, or Firefox.
4. Choose a method and adjust the inputs.
5. Click **Run simulation**, then **Next step** or **Auto-play**.
6. Click **Compare methods** to show the comparison table.

An internet connection is only needed for the optional Google Fonts import; the simulator itself does not depend on a network service.


## UI/UX design
The interface uses a consistent navy-and-blue academic palette, clear section hierarchy, readable cards, high-contrast actions, visible validation messages, keyboard focus states, and responsive layouts for desktop, tablet, and mobile. The website remains a static client-side app: HTML, CSS, and JavaScript run directly in the browser without a backend. Google Fonts are optional; the app logic does not require an internet connection.

## Files
- `index.html` — interface and page structure
- `style.css` — responsive visual design
- `script.js` — event generation, simulation state, metrics, validation, and controls
- `PROJECT_REPORT.md` — academic project report, algorithm, tests, viva, and demo script

## Simulation model and assumptions
This project is a teaching model, not a hardware benchmark. Time is measured in abstract ticks. The simulator models sequential data-unit transfers and simplified CPU costs:
- Programmed I/O: CPU polls for readiness and transfers each unit.
- Interrupt-driven I/O: the CPU does not repeatedly poll during the modeled ready delay, but services an interrupt for each unit.
- DMA: the CPU configures the controller, the DMA controller transfers units, and the CPU handles completion notification.

Actual hardware behavior depends on device speed, bus arbitration, operating-system scheduling, buffering, controller design, and many other factors. The metrics are calculated from this model's generated events.

## Suggested GitHub Pages deployment
1. Create a GitHub repository, for example `io-transfer-lab`.
2. Upload the four project files to the repository root.
3. Open **Settings → Pages**.
4. Select deployment from the `main` branch and `/ (root)`.
5. Save and wait for GitHub Pages to publish the site.
6. Open the published address and test the controls.

## Screenshot instructions
For your submission, open the website in a browser and capture:
1. The main dashboard before running.
2. A step-by-step trace after running Programmed I/O.
3. A DMA simulation with memory slots filled.
4. The comparison table for all three methods.

Only include screenshots from the actual running project.

## Academic integrity
This project is intended as a learning implementation. Review the JavaScript, test the behavior, and be prepared to explain the assumptions and formulas during your demonstration. Update the student details if required by your department.
