# Astrology Source Validation & Audit Record

This document records the audit trails, data source ratings, and astronomical calculation validation results for **Ultimate Soul Codex**.

---

## 1. Golden Reference Source Ratings

To maintain "Truth-First" engineering, all validation data is explicitly rated using standardized database registries:

*   **Astro-Databank Rodden Rating AA**: Birth data from official birth certificates or registries (e.g., Albert Einstein).
*   **Astro-Databank Rodden Rating A**: Birth data from a direct family member or reliable biography (e.g., Carl Jung).
*   **Provisional / Calculated**: Synthesized test cases used for verifying edge behaviors (e.g., approximate birth times).

---

## 2. Parity & Longitudinal Tolerances

*   **Verified Longitude Tolerance**: Set to **$\pm 0.5^\circ$**. This accounts for slight variations between mathematical models (such as direct ecliptic projections vs. precise nutation-adjusted ephemerides).
*   **Provisional Tolerance**: Set to **$\pm 5.0^\circ$** or bypassed. Used for low-confidence birth data where the primary goal is ensuring sign correctness rather than exact minute precision.

---

## 3. Birth-Time Confidence Downgrade Matrix

Incomplete or low-accuracy inputs trigger automatic precision safeguards:

| Input Precision | Confidence State | Impact on Calculation |
| :--- | :--- | :--- |
| **Exact Hour & Minute** | `high` | Standard precise Sun, Moon, and Ascendant calculation. |
| **Approximate Hour (e.g., "around noon")** | `medium` | Calculate Sun and Moon signs; Ascendant calculation flagged as provisional. |
| **Unknown Birth Time** | `low` | Bypasses Ascendant and Moon sign strict assertions; defaults to noon offset calculations. |

---

## 4. Known Calculation Limitations & Boundaries

1.  **No Swiss Ephemeris Integration**: The core engine uses local, modular astronomical models (`astronomy-engine` for orbital paths and local geometric formulas for house cusps). Exact minute-level matches may vary slightly from standard ephemeris tools due to difference in gravitational perturbation coefficients.
2.  **No Custom House Systems**: The current validation rules are built around the **Equal House** formulation. Placidus or Koch house validation remains out of scope for this initial verification phase.
