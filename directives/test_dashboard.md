# Directive: Create Dashboard MVP & Automation Tool

## Goal
Build a responsive visual dashboard mockup for a data-monitoring app, and create a deterministic Python script to simulate incoming mock data.

---

## 🛠️ Step 1: Frontend Mockup Phase
*   **Target Agent:** `UI_Designer` (Claude Sonnet 3.7)
*   **Task:** Sketch out the dashboard interface.
*   **Requirements:** 
    *   Sidebar navigation with "Overview", "Analytics", and "Settings".
    *   A central data table area.
    *   Use Tailwind CSS for styling.
    *   *Instruction:* Render this as a functional Artifact/Live Preview so it can be visually approved.

---

## ⚙️ Step 2: Automation Phase
*   **Target Agent:** `Code_Monkey` (Gemini 3.5 Flash)
*   **Task:** Build the deterministic data generator.
*   **Requirements:**
    *   Create a script at `execution/generate_mock_data.py`.
    *   The script should generate a random JSON array of system metrics (CPU, Memory, Timestamp) and save it to `.tmp/current_metrics.json`.
    *   Ensure proper error handling and logging.

---

## 🔄 Step 3: Self-Annealing Validation
*   **Task:** Run the script from Step 2.
*   If the script fails (e.g., directory `.tmp/` missing), the agent must create the directory, fix the script, run it again, and update this directive with the fix under an "Edge Cases" section.

---

## ⚠️ Edge Cases

### Missing Directory for JSON Output
*   **Symptom:** Running `execution/generate_mock_data.py` failed with `FileNotFoundError: [Errno 2] No such file or directory: '.tmp/current_metrics.json'` when the `.tmp/` directory did not exist.
*   **Resolution:** 
    1. Created the directory manually using `mkdir -p .tmp`.
    2. Modified the script to automatically check for and create the output path's directory before writing:
       ```python
       os.makedirs(os.path.dirname(output_file), exist_ok=True)
       ```
    3. Confirmed successful execution after applying the change.

