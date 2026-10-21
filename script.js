/* I/O Transfer Lab — educational simulation model */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const state = {
    method: "programmed",
    events: [],
    cursor: 0,
    timer: null,
    completed: 0,
    params: null,
    busyTicks: 0,
    elapsedTicks: 0
  };

  const methodNames = {
    programmed: "Programmed I/O",
    interrupt: "Interrupt-Driven I/O",
    dma: "Direct Memory Access (DMA)"
  };

  function readParams() {
    const units = Number($("dataUnits").value);
    const delay = Number($("readyDelay").value);
    const poll = Number($("pollCost").value);
    const irq = Number($("interruptCost").value);
    if (!Number.isInteger(units) || units < 1 || units > 20) throw new Error("Data units must be a whole number from 1 to 20.");
    if (!Number.isInteger(delay) || delay < 0 || delay > 10) throw new Error("Ready delay must be a whole number from 0 to 10.");
    if (!Number.isInteger(poll) || poll < 1 || poll > 5) throw new Error("Polling cost must be a whole number from 1 to 5.");
    if (!Number.isInteger(irq) || irq < 1 || irq > 5) throw new Error("Interrupt service cost must be a whole number from 1 to 5.");
    return { units, delay, poll, irq };
  }

  function event(events, time, actor, operation, result, type = "wait", completed = null, busy = 0) {
    events.push({ time, actor, operation, result, type, completed, busy });
  }

  // The model uses abstract ticks, not wall-clock or hardware benchmark time.
  function buildSimulation(method, p) {
    const e = [];
    let time = 0, completed = 0, busy = 0;
    if (method === "programmed") {
      event(e, time, "CPU", "Initialize transfer", `Prepare to read ${p.units} data unit(s).`, "busy", 0, 1);
      time++; busy++;
      for (let i = 1; i <= p.units; i++) {
        for (let d = 1; d <= p.delay; d++) {
          event(e, time, "CPU", `Poll device status (${d}/${p.delay})`, `Device is not ready; CPU checks again for unit ${i}.`, "busy", completed, p.poll);
          time++; busy += p.poll;
        }
        event(e, time, "I/O Device", `Unit ${i} becomes ready`, "The device status indicates that data can be read.", "transfer", completed, 0);
        event(e, time, "CPU", `Read unit ${i}`, `CPU reads unit ${i} from the device and writes it to memory.`, "transfer", i, 1);
        time++; busy++; completed++;
      }
      event(e, time, "CPU", "Finish transfer", "CPU confirms that all requested units were transferred.", "busy", completed, 1);
      time++; busy++;
    } else if (method === "interrupt") {
      event(e, time, "CPU", "Initialize transfer", `Enable device interrupts for ${p.units} data unit(s).`, "busy", 0, 1);
      time++; busy++;
      for (let i = 1; i <= p.units; i++) {
        if (p.delay > 0) {
          event(e, time, "CPU", "Run other work / wait", `CPU does not poll continuously while the device prepares unit ${i}.`, "wait", completed, 0);
          time += p.delay;
        }
        event(e, time, "I/O Device", "Raise interrupt", `Device requests CPU service for unit ${i}.`, "transfer", completed, 0);
        event(e, time, "CPU", "Run interrupt service routine", `CPU acknowledges the interrupt and services unit ${i}.`, "busy", completed, p.irq);
        time += p.irq; busy += p.irq;
        event(e, time, "CPU + I/O", `Transfer unit ${i}`, `The service routine transfers unit ${i} to memory.`, "transfer", i, 0);
        completed++;
      }
      event(e, time, "CPU", "Finish transfer", "All device interrupts have been serviced.", "busy", completed, 1);
      time++; busy++;
    } else {
      event(e, time, "CPU", "Configure DMA", `Set source, destination, and transfer count (${p.units} units).`, "busy", 2, 2);
      time += 2; busy += 2;
      event(e, time, "DMA Controller", "Take control of bus", "DMA begins the block transfer; CPU is free from per-unit copying.", "transfer", 0, 0);
      for (let i = 1; i <= p.units; i++) {
        if (p.delay > 0) {
          event(e, time, "DMA Controller", `Wait for device (${i}/${p.units})`, `DMA waits ${p.delay} abstract tick(s) for unit ${i}; CPU is not polling.`, "wait", completed, 0);
          time += p.delay;
        }
        event(e, time, "DMA Controller", `Transfer unit ${i}`, `DMA moves unit ${i} directly from the device to main memory.`, "transfer", i, 0);
        time++; completed++;
      }
      event(e, time, "DMA Controller", "Complete block transfer", "DMA marks the transfer complete and raises a completion interrupt.", "transfer", completed, 0);
      event(e, time, "CPU", "Handle completion interrupt", "CPU handles the completion notification.", "busy", completed, 1);
      time++; busy++;
    }
    return { events: e, elapsed: time, busy, completed };
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    $("autoBtn").textContent = "Auto-play";
  }

  function setMethod(method) {
    stopTimer();
    state.method = method;
    document.querySelectorAll(".method-card").forEach(btn => {
      const selected = btn.dataset.method === method;
      btn.classList.toggle("selected", selected);
      btn.setAttribute("aria-pressed", String(selected));
    });
    $("methodPill").textContent = methodNames[method];
    $("systemMap").classList.toggle("dma-mode", method === "dma");
    $("dmaNode").style.display = method === "dma" ? "flex" : "";
    resetView();
  }

  function clearVisuals() {
    ["deviceNode", "cpuNode", "memoryNode", "dmaNode"].forEach(id => $(id).classList.remove("active", "transferring"));
    ["deviceLink", "memoryLink"].forEach(id => $(id).classList.remove("active"));
    $("deviceState").textContent = "Waiting";
    $("cpuState").textContent = "Ready";
    $("memoryState").textContent = `${state.completed} units stored`;
    $("dmaState").textContent = "Inactive";
  }

  function resetView() {
    stopTimer();
    state.events = [];
    state.cursor = 0;
    state.completed = 0;
    state.busyTicks = 0;
    state.elapsedTicks = 0;
    state.params = null;
    clearVisuals();
    $("progressBar").style.width = "0%";
    $("progressText").textContent = `0 / ${$("dataUnits").value || 0} units`;
    $("memorySlots").innerHTML = "";
    const n = Math.max(1, Math.min(20, Number($("dataUnits").value) || 1));
    for (let i = 1; i <= n; i++) {
      const slot = document.createElement("div");
      slot.className = "memory-slot";
      slot.id = `slot-${i}`;
      slot.textContent = `M${i}`;
      slot.title = `Memory slot ${i}`;
      $("memorySlots").appendChild(slot);
    }
    $("elapsedMetric").textContent = "—";
    $("busyMetric").textContent = "—";
    $("involvementMetric").textContent = "—";
    $("unitsMetric").textContent = `0 / ${n}`;
    $("stepCounter").textContent = "Step 0 of 0";
    $("traceBody").innerHTML = '<tr><td colspan="5" class="empty-cell">No simulation steps yet.</td></tr>';
    $("currentStep").innerHTML = '<span class="current-step-tag">CURRENT STEP</span><p>Click <strong>Run simulation</strong> to generate the execution trace.</p>';
    $("statusMessage").textContent = "Ready to simulate.";
    $("errorMessage").textContent = "";
    $("insightText").textContent = "Run the simulation to see how the selected method uses the CPU.";
    $("compareBody").innerHTML = '<tr><td colspan="5" class="empty-cell">Select “Compare methods” to calculate the comparison.</td></tr>';
  }

  function actorNode(actor) {
    if (actor.includes("DMA")) return "dmaNode";
    if (actor.includes("Device")) return "deviceNode";
    if (actor.includes("CPU")) return "cpuNode";
    return "memoryNode";
  }

  function renderCurrent() {
    if (!state.events.length) return;
    const ev = state.events[state.cursor - 1];
    state.completed = ev.completed === null ? state.completed : ev.completed;
    state.elapsedTicks = ev.time + (ev.type === "wait" ? 0 : 1);
    state.busyTicks = state.events.slice(0, state.cursor).reduce((sum, x) => sum + x.busy, 0);

    clearVisuals();
    const node = actorNode(ev.actor);
    $(node).classList.add(ev.type === "transfer" ? "transferring" : "active");
    if (ev.actor.includes("Device")) $("deviceState").textContent = ev.operation;
    if (ev.actor.includes("CPU")) $("cpuState").textContent = ev.operation;
    if (ev.actor.includes("DMA")) $("dmaState").textContent = ev.operation;
    $("memoryState").textContent = `${state.completed} unit(s) stored`;
    if (ev.type === "transfer") {
      $("deviceLink").classList.add("active");
      $("memoryLink").classList.add("active");
    }
    for (let i = 1; i <= state.completed; i++) {
      const slot = $(`slot-${i}`);
      if (slot) { slot.classList.add("filled"); slot.textContent = `✓${i}`; }
    }

    const p = state.params;
    $("progressBar").style.width = `${(state.completed / p.units) * 100}%`;
    $("progressText").textContent = `${state.completed} / ${p.units} units`;
    $("elapsedMetric").textContent = state.elapsedTicks;
    $("busyMetric").textContent = state.busyTicks;
    $("involvementMetric").textContent = `${state.elapsedTicks ? Math.min(100, Math.round(state.busyTicks / state.elapsedTicks * 100)) : 0}%`;
    $("unitsMetric").textContent = `${state.completed} / ${p.units}`;
    $("stepCounter").textContent = `Step ${state.cursor} of ${state.events.length}`;
    $("currentStep").innerHTML = `<span class="current-step-tag">STEP ${state.cursor} · TIME ${ev.time}</span><p><strong>${escapeHTML(ev.actor)}:</strong> ${escapeHTML(ev.operation)} — ${escapeHTML(ev.result)}</p>`;

    const rows = state.events.slice(0, state.cursor).map((x, i) =>
      `<tr class="${i === state.cursor - 1 ? "current-row" : ""}"><td>${i + 1}</td><td>${x.time}</td><td>${escapeHTML(x.actor)}</td><td>${escapeHTML(x.operation)}</td><td>${escapeHTML(x.result)}</td></tr>`
    ).join("");
    $("traceBody").innerHTML = rows || '<tr><td colspan="5" class="empty-cell">No steps yet.</td></tr>';
    const finished = state.cursor >= state.events.length;
    $("statusMessage").textContent = finished ? "Simulation complete." : `Running: ${Math.round(state.cursor / state.events.length * 100)}% of steps shown.`;
    $("insightText").textContent = getInsight(state.method, state.completed, p.units, finished, state.busyTicks, state.elapsedTicks);
    if (finished) stopTimer();
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function getInsight(method, done, total, finished, busy, elapsed) {
    const name = methodNames[method];
    if (!finished) return `${name} is in progress. The display updates from the current execution event.`;
    const ratio = elapsed ? Math.round(busy / elapsed * 100) : 0;
    if (method === "programmed") return `Programmed I/O completed ${done} unit(s). CPU involvement is ${ratio}% in this simplified model because the CPU polls the device and performs each transfer.`;
    if (method === "interrupt") return `Interrupt-driven I/O completed ${done} unit(s). The CPU does not repeatedly poll during the modeled device delay, but it spends time servicing interrupts.`;
    return `DMA completed ${done} unit(s). The CPU configures the controller and handles completion, while the controller performs the per-unit transfers. CPU involvement is ${ratio}% in this model.`;
  }

  function runSimulation() {
    stopTimer();
    try {
      const p = readParams();
      state.params = p;
      state.events = buildSimulation(state.method, p).events;
      state.cursor = 0;
      resetVisualsForRun(p.units);
      $("statusMessage").textContent = "Simulation prepared. Press Next step or Auto-play.";
      $("errorMessage").textContent = "";
      $("stepCounter").textContent = `Step 0 of ${state.events.length}`;
      $("currentStep").innerHTML = '<span class="current-step-tag">READY</span><p>Simulation generated. Press <strong>Next step</strong> or <strong>Auto-play</strong> to inspect the events.</p>';
      $("traceBody").innerHTML = '<tr><td colspan="5" class="empty-cell">Press Next step to reveal the trace.</td></tr>';
    } catch (err) {
      $("errorMessage").textContent = err.message;
      $("statusMessage").textContent = "Please correct the input.";
    }
  }

  function resetVisualsForRun(units) {
    clearVisuals();
    state.completed = 0; state.busyTicks = 0; state.elapsedTicks = 0;
    $("progressBar").style.width = "0%";
    $("progressText").textContent = `0 / ${units} units`;
    $("elapsedMetric").textContent = "0";
    $("busyMetric").textContent = "0";
    $("involvementMetric").textContent = "0%";
    $("unitsMetric").textContent = `0 / ${units}`;
    $("memorySlots").innerHTML = "";
    for (let i = 1; i <= units; i++) {
      const slot = document.createElement("div");
      slot.className = "memory-slot"; slot.id = `slot-${i}`; slot.textContent = `M${i}`;
      slot.title = `Memory slot ${i}`; $("memorySlots").appendChild(slot);
    }
  }

  function nextStep() {
    if (!state.events.length) runSimulation();
    if (!state.events.length) return;
    if (state.cursor < state.events.length) {
      state.cursor++;
      renderCurrent();
    } else {
      $("statusMessage").textContent = "Simulation is already complete. Reset or change inputs to run again.";
    }
  }

  function autoPlay() {
    if (!state.events.length) runSimulation();
    if (!state.events.length) return;
    if (state.cursor >= state.events.length) {
      $("statusMessage").textContent = "Simulation is complete. Click Reset to start again.";
      return;
    }
    if (state.timer) {
      stopTimer();
      $("statusMessage").textContent = "Auto-play paused.";
      return;
    }
    $("autoBtn").textContent = "Pause auto-play";
    state.timer = setInterval(() => {
      if (state.cursor < state.events.length) {
        state.cursor++;
        renderCurrent();
      } else stopTimer();
    }, 650);
  }

  function compareMethods() {
    try {
      const p = readParams();
      const methods = ["programmed", "interrupt", "dma"];
      const rows = methods.map(m => {
        const result = buildSimulation(m, p);
        const involvement = result.elapsed ? Math.min(100, Math.round(result.busy / result.elapsed * 100)) : 0;
        return `<tr><td><strong>${methodNames[m]}</strong></td><td>${result.elapsed}</td><td>${result.busy}</td><td>${involvement}%</td><td>${result.completed} / ${p.units}</td></tr>`;
      });
      $("compareBody").innerHTML = rows.join("");
      $("errorMessage").textContent = "";
    } catch (err) {
      $("errorMessage").textContent = err.message;
    }
  }

  document.querySelectorAll(".method-card").forEach(btn => btn.addEventListener("click", () => setMethod(btn.dataset.method)));
  $("runBtn").addEventListener("click", runSimulation);
  $("stepBtn").addEventListener("click", nextStep);
  $("autoBtn").addEventListener("click", autoPlay);
  $("resetBtn").addEventListener("click", resetView);
  $("compareBtn").addEventListener("click", compareMethods);
  ["dataUnits", "readyDelay", "pollCost", "interruptCost"].forEach(id => {
    $(id).addEventListener("change", () => {
      if (state.events.length) resetView();
      else {
        $("errorMessage").textContent = "";
        const n = Math.max(1, Math.min(20, Number($("dataUnits").value) || 1));
        $("progressText").textContent = `0 / ${n} units`;
        $("unitsMetric").textContent = `0 / ${n}`;
        $("memorySlots").innerHTML = "";
        for (let i = 1; i <= n; i++) {
          const slot = document.createElement("div"); slot.className = "memory-slot"; slot.id = `slot-${i}`; slot.textContent = `M${i}`;
          $("memorySlots").appendChild(slot);
        }
      }
    });
  });

  resetView();
})();