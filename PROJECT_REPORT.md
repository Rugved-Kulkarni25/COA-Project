# PROJECT REPORT
## Interactive Input/Output Data Transfer and DMA Simulator

**Subject:** Computer Organization and Architecture (COA)  
**Assessment:** CO5 Micro Project  
**Institute:** Sanjivani University, Kopargaon, Maharashtra  
**Department:** Computer Science Engineering  
**Student:** Rugved Kulkarni  
**PRN:** Not provided  
**Technology:** HTML, CSS, JavaScript  
**Project type:** Individual academic micro project

---

## 1. Project Overview
I/O Transfer Lab is an interactive educational website that demonstrates how data can be transferred between an input/output device and main memory using Programmed I/O, Interrupt-Driven I/O, and Direct Memory Access (DMA). Users can change the workload and timing parameters, execute the model step by step, inspect a trace of the events, and compare the calculated metrics.

## 2. Problem Statement
Computer systems use different techniques to transfer data between I/O devices and memory. The techniques differ in how much CPU attention they require and how data transfer is coordinated. Static diagrams alone can make these differences difficult to understand. The project addresses this by providing an interactive simulation that makes the control flow, data movement, and CPU involvement visible.

## 3. Objectives
- Explain three common I/O transfer techniques through a working simulation.
- Show the roles of the CPU, I/O device, main memory, and DMA controller.
- Support adjustable inputs and step-by-step execution.
- Calculate elapsed ticks, CPU busy ticks, CPU involvement, and completed data units from generated events.
- Compare the methods under the same simplified workload.
- Provide a responsive interface that runs locally in a web browser.

## 4. Scope
The simulator models a small sequential workload of 1–20 data units. It uses abstract time ticks and configurable device-ready delay, polling cost, and interrupt service cost. It focuses on the conceptual difference between CPU-controlled transfers, interrupt-based service, and DMA-controlled block transfer. It does not emulate a specific CPU, operating system, bus protocol, or physical device.

## 5. Conceptual Explanation

### 5.1 Programmed I/O
In Programmed I/O, the CPU checks the device's status register until the device is ready. The CPU then transfers the data. Repeated polling can waste CPU time when the device is slow.

**Simplified flow:** Initialize → poll device status → wait if not ready → read data → write to memory → repeat → finish.

### 5.2 Interrupt-Driven I/O
In Interrupt-Driven I/O, the CPU starts the I/O operation and can perform other work while the device prepares data. When the device is ready, it raises an interrupt. The CPU temporarily handles the request through an interrupt service routine.

**Simplified flow:** Initialize and enable interrupts → device prepares data while CPU can do other work → interrupt request → service routine → transfer data → repeat → finish.

### 5.3 Direct Memory Access (DMA)
DMA uses a controller to move a block of data between an I/O device and memory. The CPU configures the transfer, and the DMA controller handles the individual transfers. The controller typically notifies the CPU when the block is complete.

**Simplified flow:** CPU configures DMA → DMA takes control of the bus → transfer data units → complete block → notify CPU.

## 6. Proposed Solution and Architecture
The project has three layers:
1. **Presentation layer:** HTML cards, input fields, diagrams, progress bar, metrics, and tables.
2. **Simulation layer:** JavaScript event generation for the selected method.
3. **Analysis layer:** JavaScript calculates the trace position, completed units, elapsed ticks, CPU busy ticks, CPU involvement, and method comparison.

The application works entirely in the browser. No server, database, or external API is needed.

## 7. Algorithm
1. Start.
2. Read the selected method and input parameters.
3. Validate that units are an integer from 1 to 20, delay is 0–10, and cost values are 1–5.
4. Initialize the event list and counters.
5. Generate method-specific events:
   - Programmed I/O: initialization, polling events, ready events, per-unit CPU transfer, and completion.
   - Interrupt-Driven I/O: initialization, device preparation interval, interrupt event, service routine, per-unit transfer, and completion.
   - DMA: configuration, bus acquisition, DMA unit transfers, completion notification, and CPU completion handling.
6. Show the event list and reset the visual state.
7. On each Next Step action, reveal the next event and update the diagram, progress, trace, and metrics.
8. When all events have been shown, display the completed status.
9. For comparison, generate each method's events from the same parameters and display the calculated metrics.
10. Stop.

## 8. Pseudocode
```text
READ method and parameters
IF parameters are invalid
    SHOW error
    STOP current run
END IF

FOR each selected method
    INITIALIZE event list, time, busy ticks, completed units

    IF method is Programmed I/O
        RECORD initialization
        FOR each data unit
            RECORD each polling check during ready delay
            RECORD device-ready event
            RECORD CPU data transfer
            UPDATE completed units
        END FOR
        RECORD completion
    ELSE IF method is Interrupt-Driven I/O
        RECORD initialization
        FOR each data unit
            ADVANCE time for device preparation without polling
            RECORD interrupt request
            RECORD CPU interrupt service
            RECORD transfer to memory
            UPDATE completed units
        END FOR
        RECORD completion
    ELSE
        RECORD DMA configuration
        FOR each data unit
            ADVANCE time for device delay
            RECORD DMA transfer to memory
            UPDATE completed units
        END FOR
        RECORD DMA completion and CPU notification
    END IF
END FOR

DISPLAY events step by step
CALCULATE elapsed ticks, CPU busy ticks, and CPU involvement
```

## 9. Metrics and Formulas
- **Elapsed ticks:** The final simulated time reached by the event model.
- **CPU busy ticks:** The sum of the CPU work costs recorded by the event model.
- **CPU involvement (%):** `CPU busy ticks / elapsed ticks × 100`, capped at 100% for display.
- **Completed units:** Number of data units the current event trace has transferred to memory.
- **Progress (%):** `Completed units / requested units × 100`.

These values describe this simplified model. They should not be interpreted as real-world hardware performance measurements.

## 10. Sample Input and Expected Behavior
Example input:
- Data units: 5
- Device-ready delay: 2 ticks
- CPU cost per polling check: 1
- Interrupt service cost: 2

Expected qualitative behavior:
- **Programmed I/O:** The trace includes repeated CPU polling events, device-ready events, and CPU transfers for each unit.
- **Interrupt-Driven I/O:** The trace includes device preparation intervals, interrupt events, CPU service, and transfers.
- **DMA:** The trace includes CPU setup, DMA-controlled transfers, and a completion notification. The CPU does not perform a separate copy operation for every unit in this model.

Exact metrics are generated by the application and can be inspected in the live comparison table.

## 11. Test Cases
| Test | Input / Action | Expected Result |
|---|---|---|
| TC01 | Run Programmed I/O with default values | Event trace is generated and can be stepped through |
| TC02 | Select Interrupt-Driven I/O | Method badge and execution events change |
| TC03 | Select DMA | DMA controller appears and DMA events are generated |
| TC04 | Set units to 1 | One data unit is represented and progress reaches 1/1 |
| TC05 | Set units to 20 | Twenty memory slots are supported |
| TC06 | Set delay to 0 | No device-delay/poll-delay events are generated |
| TC07 | Set units to 0 | Validation error is displayed |
| TC08 | Set units to 21 | Validation error is displayed |
| TC09 | Enter a fractional unit count | Validation error is displayed |
| TC10 | Click Next Step repeatedly | Exactly one event is revealed per click |
| TC11 | Click Auto-play and then pause | Automatic progression stops |
| TC12 | Click Compare methods | A row for each method appears using the same inputs |
| TC13 | Click Reset | Trace, progress, metrics, and memory slots return to initial state |
| TC14 | Change input after generating a run | Previous trace resets to prevent stale results |

## 12. Results and Discussion
The application is designed to show that the methods differ in how control and CPU work are organized:
- Programmed I/O explicitly models CPU polling and CPU-driven data transfer.
- Interrupt-Driven I/O models device notification and CPU interrupt service rather than repeated polling during the device delay.
- DMA models controller-managed per-unit transfers, with CPU work concentrated around setup and completion.

The numerical comparison is useful for learning only when the assumptions are kept in mind. Different cost settings can change the comparison, and real hardware may behave differently.

## 13. Advantages
- Interactive and easy to demonstrate.
- Runs in a browser without installation.
- Supports custom parameters and a visible event trace.
- Uses no paid APIs or external services.
- Includes an all-method comparison.
- Responsive layout for different screen sizes.

## 14. Limitations
- Uses abstract time ticks, not measured hardware cycles.
- Does not model bus arbitration, cache effects, interrupts being masked, operating-system scheduling, device buffers, or overlapping transfers in full detail.
- The device-ready delay is a simplified parameter.
- CPU involvement is an educational metric based on the costs encoded in the model.

## 15. Future Scope
- Add a more detailed bus-level animation.
- Model multiple I/O devices and priorities.
- Add asynchronous overlap between CPU work and device operations.
- Export trace and comparison results as CSV.
- Add configurable DMA modes such as burst and cycle stealing.
- Add quizzes and a guided tutorial mode.

## 16. Conclusion
I/O Transfer Lab provides an interactive way to understand Programmed I/O, Interrupt-Driven I/O, and DMA. Its event trace and visual feedback make the roles of the CPU, device, memory, and DMA controller easier to compare. It fulfills the intended educational scope of a browser-based COA micro project, subject to review and demonstration by the student.

## 17. Viva Questions and Simple Answers

**Q1. What is I/O transfer?**  
It is the movement of data between a computer and an external device, often through an I/O controller.

**Q2. What is Programmed I/O?**  
The CPU repeatedly checks device status and performs the data transfer itself.

**Q3. What is polling?**  
Polling means repeatedly checking a device to see whether it is ready.

**Q4. What is an interrupt?**  
An interrupt is a signal that asks the CPU to respond to an event that needs attention.

**Q5. What is Interrupt-Driven I/O?**  
The device notifies the CPU when it needs service, instead of requiring continuous polling.

**Q6. What is DMA?**  
Direct Memory Access allows a DMA controller to transfer data between a device and memory with less CPU involvement.

**Q7. Why is DMA useful for block transfers?**  
It reduces the need for the CPU to handle each data unit individually.

**Q8. Does DMA mean the CPU is never involved?**  
No. The CPU usually configures the DMA operation and handles completion or errors.

**Q9. What is an ISR?**  
An Interrupt Service Routine is code executed by the CPU to handle an interrupt.

**Q10. What is CPU involvement in this project?**  
It is the modeled CPU busy ticks divided by elapsed ticks, expressed as a percentage.

**Q11. Are the displayed ticks real hardware timings?**  
No. They are abstract teaching units defined by the simulator's simplified model.

**Q12. What technologies are used?**  
HTML for structure, CSS for presentation, and vanilla JavaScript for simulation logic.

**Q13. Why is input validation important?**  
It prevents invalid values from creating confusing or inconsistent simulation results.

**Q14. What is the main difference between Interrupt-Driven I/O and DMA?**  
In interrupt-driven I/O, the CPU services data-transfer requests; with DMA, a controller performs the block transfer and notifies the CPU.

**Q15. What could be added in future?**  
Multiple devices, bus arbitration, CSV export, richer DMA modes, and a more detailed timing model.

## 18. Demonstration Script (about 2–3 minutes)
1. “Good morning. My project is I/O Transfer Lab, developed for the Computer Organization and Architecture CO5 micro project.”
2. “The purpose is to compare Programmed I/O, Interrupt-Driven I/O, and Direct Memory Access through an interactive browser simulation.”
3. “I can change the number of data units and the device delay. First, I select Programmed I/O and run it. The trace shows the CPU polling the device and transferring the data.”
4. “Next, I select Interrupt-Driven I/O. During the modeled device delay, the CPU is not repeatedly polling. The device raises an interrupt, and the CPU services it.”
5. “Now I select DMA. The CPU configures the controller, the DMA controller transfers each unit to memory, and the CPU handles the completion notification.”
6. “The progress bar, memory slots, event trace, and metrics update as I step through the simulation.”
7. “Finally, I click Compare methods to see the elapsed ticks and CPU busy ticks produced by the same input settings.”
8. “These are simplified educational metrics rather than hardware benchmarks. The project demonstrates the conceptual differences between the methods. Thank you.”

## 19. Submission Checklist
- [ ] Replace or confirm the student name and enter the PRN if required.
- [ ] Run `index.html` in a browser.
- [ ] Test all three methods and the comparison table.
- [ ] Capture screenshots from the running website.
- [ ] Review the model assumptions and be ready to explain them.
- [ ] Upload the project files to the submission form specified by the department.
