import React, { useState, useEffect } from "react";
import "./App.css";

const moves = [
  { M: 2, C: 0 },
  { M: 0, C: 2 },
  { M: 1, C: 1 },
  { M: 1, C: 0 },
  { M: 0, C: 1 },
];

const isValid = (M, C, totalM, totalC) => {
  if (M < 0 || M > totalM || C < 0 || C > totalC) return false;
  if (M > 0 && M < C) return false;
  const MR = totalM - M;
  const CR = totalC - C;
  if (MR > 0 && MR < CR) return false;
  return true;
};

const bfs = (totalM, totalC) => {
  const start = { left: { M: totalM, C: totalC }, right: { M: 0, C: 0 }, boat: "left", traveling: { M: 0, C: 0 } };
  const queue = [[start, []]];
  const visited = new Set();
  visited.add(JSON.stringify(start));

  while (queue.length > 0) {
    const [state, path] = queue.shift();
    if (state.right.M === totalM && state.right.C === totalC)
      return [...path, { ...state, traveling: { M: 0, C: 0 } }];

    for (let move of moves) {
      const next = JSON.parse(JSON.stringify(state));
      next.traveling = { ...move };

      if (state.boat === "left") {
        next.left.M -= move.M;
        next.left.C -= move.C;
        next.right.M += move.M;
        next.right.C += move.C;
        next.boat = "right";
      } else {
        next.left.M += move.M;
        next.left.C += move.C;
        next.right.M -= move.M;
        next.right.C -= move.C;
        next.boat = "left";
      }

      if (isValid(next.left.M, next.left.C, totalM, totalC) && !visited.has(JSON.stringify(next))) {
        visited.add(JSON.stringify(next));
        queue.push([next, [...path, state]]);
      }
    }
  }
  return [];
};

export default function App() {
  const [totalM, setTotalM] = useState("");
  const [totalC, setTotalC] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [passengersInBoat, setPassengersInBoat] = useState({ M: 0, C: 0 });
  const [phase, setPhase] = useState("idle"); // idle, boarding, moving, leaving
  const [message, setMessage] = useState("");

  const handleStart = () => {
    setMessage("");
    if (totalM <= 0 || totalC <= 0) return setMessage("❌ Enter positive numbers!");
    if (totalM < totalC) return setMessage("❌ Missionaries cannot be less than cannibals.");
    const path = bfs(totalM, totalC);
    if (path.length === 0) return setMessage("❌ No solution exists!");
    setSteps(path);
    setCurrentStep(0);
    setPhase("boarding");
    setPassengersInBoat({ M: 0, C: 0 });
  };

  useEffect(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const target = step.traveling;

    if (phase === "boarding") {
      const timer = setTimeout(() => {
        const nextM = Math.min(passengersInBoat.M + 1, target.M);
        const nextC =
          passengersInBoat.M === target.M ? Math.min(passengersInBoat.C + 1, target.C) : passengersInBoat.C;
        setPassengersInBoat({ M: nextM, C: nextC });
        if (nextM === target.M && nextC === target.C) setPhase("moving");
      }, 300);
      return () => clearTimeout(timer);
    }

    if (phase === "moving") {
      const timer = setTimeout(() => setPhase("leaving"), 1000);
      return () => clearTimeout(timer);
    }

    if (phase === "leaving") {
      const timer = setTimeout(() => {
        setPassengersInBoat({ M: 0, C: 0 });
        setCurrentStep(currentStep + 1);
        if (currentStep + 1 < steps.length) setPhase("boarding");
        else setPhase("idle");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, passengersInBoat, currentStep, steps]);

  const replay = () => {
    setCurrentStep(0);
    setPhase("boarding");
    setPassengersInBoat({ M: 0, C: 0 });
  };

  const safeStep = steps.length > 0 ? Math.min(currentStep, steps.length - 1) : null;
  const current =
    safeStep !== null
      ? steps[safeStep]
      : { left: { M: totalM || 0, C: totalC || 0 }, right: { M: 0, C: 0 }, boat: "left", traveling: { M: 0, C: 0 } };

  const travelingPassengers = passengersInBoat; // Always show passengers in boat

  return (
    <div className="App">
      <h1>🚣 Missionaries & Cannibals Problem</h1>

      <div className="input-area">
        <label>Missionaries: </label>
        <input type="number" min="1" value={totalM} onChange={(e) => setTotalM(Number(e.target.value))} />
        <label>Cannibals: </label>
        <input type="number" min="1" value={totalC} onChange={(e) => setTotalC(Number(e.target.value))} />
        <button onClick={handleStart}>Start Simulation</button>
        {message && <div className="message">{message}</div>}
      </div>

      {steps.length > 0 && (
        <div className="main">
          <div className="left">
            <div className="river-container">
              <div className="river">
                {/* Left Bank */}
                <div className="bank left-bank">
                  <div className="bank-label">Left Bank</div>
                  <div>
                    {Array.from({ length: current.left.M }).map((_, idx) => (
                      <span key={`LM${idx}`} className="person">👨‍🦰</span>
                    ))}
                  </div>
                  <div>
                    {Array.from({ length: current.left.C }).map((_, idx) => (
                      <span key={`LC${idx}`} className="person">👹</span>
                    ))}
                  </div>
                </div>

                {/* Boat */}
                <div className={`boat ${current.boat}`}>
                  {Array.from({ length: travelingPassengers.M }).map((_, idx) => (
                    <span key={`BM${idx}`} className="person">👨‍🦰</span>
                  ))}
                  {Array.from({ length: travelingPassengers.C }).map((_, idx) => (
                    <span key={`BC${idx}`} className="person">👹</span>
                  ))}
                </div>

                {/* Right Bank */}
                <div className="bank right-bank">
                  <div className="bank-label">Right Bank</div>
                  <div>
                    {Array.from({ length: current.right.M }).map((_, idx) => (
                      <span key={`RM${idx}`} className="person">👨‍🦰</span>
                    ))}
                  </div>
                  <div>
                    {Array.from({ length: current.right.C }).map((_, idx) => (
                      <span key={`RC${idx}`} className="person">👹</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h2>{currentStep < steps.length ? `Step ${currentStep + 1}` : "✅ Goal Reached!"}</h2>
            <button onClick={replay}>🔄 Replay</button>
          </div>

          {/* State-space tree */}
          <div className="right">
            <h2>🌳 State Space Tree</h2>
            <div className="tree">
              {steps.slice(0, currentStep + 1).map((s, idx) => (
                <div
                  key={idx}
                  className={`tree-node ${idx === currentStep ? "current-node" : ""} ${idx === steps.length - 1 ? "goal-node" : ""}`}
                >
                  Step {idx + 1}: L({s.left.M},{s.left.C}) | R({s.right.M},{s.right.C})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
