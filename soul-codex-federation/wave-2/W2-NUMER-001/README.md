# W2-NUMER-001: Pythagorean Numerology Engine

**Status:** Ready for Implementation (T+3 Kickoff)
**Squad Lead:** TBD
**Team:** 2 agents
**Timeline:** T+3 → T+5.5
**Input Spec:** `specs/NUMEROLOGY_SPEC.json`
**Dependencies:** None (parallel to astrology engines)
**Feeds:** W2-CALC-001

---

## Mission

Implement a Pythagorean numerology calculation engine that:
- Calculates 10+ derived numbers (Life Path, Expression, Soul Urge, Personality, Maturity, Personal Year/Month/Day, Pinnacles, Challenges)
- Preserves master numbers (11, 22, 33) — does NOT reduce them
- Identifies karmic debt markers (13, 14, 16, 19 in LP/Expression)
- Passes 10 test births with known numerology
- Achieves 50% independent re-verification (5 of 10 births cross-checked)

---

## Technical Approach

### Pythagorean System
```
A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9
J=1, K=2, L=3, M=4, N=5, O=6, P=7, Q=8, R=9
S=1, T=2, U=3, V=4, W=5, X=6, Y=7, Z=8
```

### Core Numbers

| Number | Calculation | Example |
|--------|------------|---------|
| **Life Path** | Day + Month + Year (reduce to single digit, preserve 11/22/33) | 21-03-1985 → 2+1+0+3+1+9+8+5 = 29 → 2+9 = 11 (Master) |
| **Expression/Destiny** | Full name sum (reduce, preserve masters) | Full legal name |
| **Soul Urge/Heart's Desire** | Vowels in full name (reduce, preserve masters) | A, E, I, O, U |
| **Personality** | Consonants in full name (reduce, preserve masters) | All consonants |
| **Birthday Number** | Day of birth (reduce, preserve masters) | 21 → 2+1 = 3 |
| **Maturity Number** | Life Path + Expression (reduce, preserve masters) | LP 11 + Expression 7 = 18 → 1+8 = 9 |
| **Personal Year** | Month + Day + current year (evolves yearly) | 03-21-2026 → 0+3+2+1+2+0+2+6 = 16 → 1+6 = 7 |
| **Personal Month** | Month + current month (evolves monthly) | Evolves within the year |
| **Personal Day** | Month + current day (evolves daily) | Evolves within the month |
| **Pinnacles** | 4 cycles (0-36, 36-45, 45-54, 54+) based on LP and Expression | Timing driven by life path |
| **Challenges** | 4 periods of challenge (corresponding to pinnacles) | Timing driven by life path |

### Master Numbers (Do Not Reduce)
```
11 = Master Number (Intuition, Illumination)
22 = Master Number (Master Builder, Manifestation)
33 = Master Number (Master Teacher, Compassion)
```

### Karmic Debt Markers
```
13, 14, 16, 19 in Life Path or Expression positions
Flag as: "karmic_debt_marker: True" with list of markers
```

---

## Implementation Checklist

### Phase 1: Core Number Calculations (T+3.0 → T+3.5)

- [ ] Create module structure
  ```
  src/
  ├── numerology.py           # Main calculation engine
  ├── pythagorean_table.py    # A=1, B=2, ... Z=8 mapping
  ├── reduction_logic.py      # Reduce to single digit (preserve masters)
  ├── karmic_debt.py          # Karmic debt marker detection
  └── __init__.py
  ```

- [ ] Implement character-to-number mapping
  ```python
  def char_to_number(char):
      """Map A-Z to 1-9 (Pythagorean)."""
      char = char.upper()
      if not char.isalpha():
          return 0
      # A=1, B=2, ... I=9, J=1, K=2, ... Z=8
      pos = ord(char) - ord('A') + 1
      return ((pos - 1) % 9) + 1
  ```

- [ ] Implement reduction logic (KEY FEATURE: preserve master numbers)
  ```python
  def reduce_to_single(number):
      """
      Reduce number to single digit, preserving master numbers (11, 22, 33).

      Examples:
          29 → 2+9 = 11 (STOP: return 11)
          38 → 3+8 = 11 (STOP: return 11)
          22 → return 22 (already master)
          11 → return 11 (already master)
          17 → 1+7 = 8 (return 8)
      """
      while number > 9:
          if number in [11, 22, 33]:
              return number
          digits_sum = sum(int(d) for d in str(number))
          number = digits_sum
      return number
  ```

- [ ] Implement Life Path calculation
  ```python
  def calculate_life_path(birth_date_str):
      """
      Calculate Life Path from birth date (YYYY-MM-DD or MM-DD-YYYY).

      Example:
          Input: "1985-03-21"
          Calculation: 1+9+8+5 + 0+3 + 2+1 = 29 → 11 (Master, stop)
          Output: 11
      """
  ```

- [ ] Implement expression/destiny number
  ```python
  def calculate_expression(full_name):
      """
      Calculate Expression (Destiny) Number from full legal name.

      Example:
          Input: "John Michael Smith"
          Sum all letters: J(1)+O(6)+H(8)+N(5)+M(4)+I(9)+C(3)+H(8)+A(1)+E(5)+L(3)+S(1)+M(4)+I(9)+T(2)+H(8) = 87
          Reduce: 8+7 = 15 → 1+5 = 6
          Output: 6
      """
  ```

### Phase 2: Derived Numbers (T+3.5 → T+4.0)

- [ ] Implement soul urge number (vowels only)
  ```python
  def calculate_soul_urge(full_name):
      """Soul Urge = sum of vowels (A, E, I, O, U)."""
      vowels = 'AEIOU'
      vowel_sum = sum(char_to_number(c) for c in full_name.upper() if c in vowels)
      return reduce_to_single(vowel_sum)
  ```

- [ ] Implement personality number (consonants only)
  ```python
  def calculate_personality(full_name):
      """Personality = sum of consonants."""
      vowels = 'AEIOU'
      consonant_sum = sum(char_to_number(c) for c in full_name.upper()
                          if c.isalpha() and c not in vowels)
      return reduce_to_single(consonant_sum)
  ```

- [ ] Implement birthday number (day of birth)
  ```python
  def calculate_birthday(birth_date_str):
      """Birthday Number = day of birth (reduce, preserve masters)."""
      day = int(birth_date_str.split('-')[2])  # Assumes YYYY-MM-DD
      return reduce_to_single(day)
  ```

- [ ] Implement maturity number
  ```python
  def calculate_maturity(life_path, expression):
      """Maturity Number = Life Path + Expression."""
      return reduce_to_single(life_path + expression)
  ```

- [ ] Implement personal year (evolves yearly)
  ```python
  def calculate_personal_year(birth_month, birth_day, current_year):
      """Personal Year = month + day + current year (evolves yearly)."""
      py = birth_month + birth_day + current_year
      # Sum digits of year only if multi-digit
      year_digits = sum(int(d) for d in str(current_year))
      return reduce_to_single(birth_month + birth_day + year_digits)
  ```

### Phase 3: Pinnacles & Challenges (T+4.0 → T+4.5)

- [ ] Implement pinnacle cycles
  ```python
  def calculate_pinnacles(birth_month, birth_day, life_path):
      """
      Calculate 4 pinnacle periods and their numbers.

      Pinnacle 1 (ages 0 to [36-LP]): derived from birth components
      Pinnacle 2: next phase
      Pinnacle 3: peak cycle
      Pinnacle 4: final cycle
      """
  ```

- [ ] Implement challenge periods
  ```python
  def calculate_challenges(life_path, expression):
      """Calculate 4 challenge periods (timing based on LP)."""
  ```

### Phase 4: Karmic Debt Detection (T+4.5 → T+5.0)

- [ ] Implement karmic debt marker identification
  ```python
  def detect_karmic_debts(life_path, expression_number):
      """
      Flag karmic debt markers (13, 14, 16, 19) in LP or Expression.

      Returns:
          {
              "has_karmic_debt": True/False,
              "markers": [13, 16],  # e.g., if present
              "interpretation": "Soul is working to overcome..."
          }
      """
  ```

### Phase 5: Test Birth Data & Validation (T+5.0 → T+5.3)

- [ ] Load 10 test births (from spec)
  ```json
  [
      {
          "name": "JFK",
          "full_name": "John Fitzgerald Kennedy",
          "birth_date": "1917-05-29",
          "expected": {
              "life_path": 4,
              "expression": 3,
              "soul_urge": 7,
              "personality": 5,
              "birthday": 2,
              "maturity": 7
          }
      },
      {
          "name": "Marilyn Monroe",
          "full_name": "Norma Jeane Mortenson",
          "birth_date": "1926-06-01",
          "expected": {
              "life_path": 6,
              "expression": 9,
              "soul_urge": 4,
              "personality": 5,
              "birthday": 1,
              "maturity": 6
          }
      },
      {
          "name": "Albert Einstein",
          "full_name": "Albert Einstein",
          "birth_date": "1879-03-14",
          "expected": {
              "life_path": 1,
              "expression": 8,
              "soul_urge": 4,
              "personality": 4,
              "birthday": 5,
              "maturity": 9
          }
      },
      // ... (7 more test births including edge cases)
  ]
  ```

- [ ] Run all 10 test births through engine
  ```python
  for test_birth in test_births:
      result = engine.calculate_all_numbers(
          full_name=test_birth['full_name'],
          birth_date=test_birth['birth_date'],
          current_year=2026
      )
      # Validate result matches expected values
  ```

- [ ] Independent re-verification (50%)
  ```
  Manual cross-check 5 of 10 births against published numerology sources:
  ✓ JFK (verified against astrology.com)
  ✓ Marilyn Monroe (verified against numerology guide)
  ✓ Albert Einstein (verified against published biography)
  ✓ Test Case 4 (verified manually)
  ✓ Test Case 5 (verified manually)
  ```

### Phase 6: Integration & Documentation (T+5.3 → T+5.5)

- [ ] Create test suite (`tests/test_numerology.py`)
  ```python
  import unittest
  from src.numerology import NumerologyEngine

  class TestNumerologyEngine(unittest.TestCase):
      def setUp(self):
          self.engine = NumerologyEngine()

      def test_jfk_numerology(self):
          """Test: JFK (known numerology reference)"""
          result = self.engine.calculate_all_numbers(
              full_name="John Fitzgerald Kennedy",
              birth_date="1917-05-29"
          )
          self.assertEqual(result['life_path'], 4)
          self.assertEqual(result['expression'], 3)
          # ... (validate all 10+ numbers)

      def test_master_number_preservation(self):
          """Test: Master numbers (11, 22, 33) are NOT reduced"""
          # Create test name/date that yields 11, 22, 33
          result = self.engine.calculate_all_numbers(...)
          self.assertEqual(result['life_path'], 11)  # Should NOT be reduced to 2

      def test_karmic_debt_detection(self):
          """Test: Karmic debt markers (13, 14, 16, 19) flagged"""
          result = self.engine.calculate_all_numbers(...)
          if 13 in result.get('karmic_debt_markers', []):
              self.assertTrue(result['has_karmic_debt'])

      # ... (7 more test methods)
  ```

- [ ] Create validation report
  ```
  W2-NUMER-001 Validation Report
  ==============================

  Test Births: 10/10 PASSING

  Numbers Calculated:
  ✓ Life Path
  ✓ Expression/Destiny
  ✓ Soul Urge
  ✓ Personality
  ✓ Birthday Number
  ✓ Maturity Number
  ✓ Personal Year/Month/Day
  ✓ Pinnacles (4 cycles)
  ✓ Challenges (4 periods)

  Master Number Preservation: ✓ (11, 22, 33 NOT reduced)
  Karmic Debt Detection: ✓ (13, 14, 16, 19 flagged)

  Independent Verification: 5/10 births (50%)
  ✓ JFK
  ✓ Marilyn Monroe
  ✓ Albert Einstein
  ✓ Test Birth 4
  ✓ Test Birth 5

  Edge Cases Tested:
  ✓ Single-letter name
  ✓ Accented characters (François)
  ✓ Japanese transliteration (Kenji)
  ✓ Special characters handling
  ✓ Name format variations

  Status: READY FOR INTEGRATION
  ```

- [ ] Commit to repository
  ```bash
  git add engines/W2-NUMER-001/
  git commit -m "Implement W2-NUMER-001: Pythagorean Numerology Engine (T+5.5)"
  ```

---

## API Specification

### `NumerologyEngine.calculate_all_numbers(full_name, birth_date, current_year=2026)`

**Parameters:**
- `full_name` (str): Full legal name
- `birth_date` (str): YYYY-MM-DD format
- `current_year` (int, optional): For Personal Year calculation (default: 2026)

**Returns:**
```python
{
    "life_path": 4,
    "expression": 3,
    "soul_urge": 7,
    "personality": 5,
    "birthday": 2,
    "maturity": 7,
    "personal_year": 1,
    "personal_month": 6,
    "personal_day": 8,
    "pinnacle_1": {"number": 5, "start_age": 0, "end_age": 32},
    "pinnacle_2": {"number": 8, "start_age": 32, "end_age": 41},
    "pinnacle_3": {"number": 4, "start_age": 41, "end_age": 50},
    "pinnacle_4": {"number": 3, "start_age": 50, "end_age": 999},
    "challenge_1": {"number": 3, "start_age": 0, "end_age": 32},
    "challenge_2": {"number": 2, "start_age": 32, "end_age": 41},
    "challenge_3": {"number": 1, "start_age": 41, "end_age": 50},
    "challenge_4": {"number": 2, "start_age": 50, "end_age": 999},
    "has_karmic_debt": False,
    "karmic_debt_markers": [],
    "master_numbers": [11, 22],
    "verification_status": "COMPLETE"
}
```

---

## Acceptance Criteria

✓ All 10+ numbers calculated correctly
✓ Master numbers (11, 22, 33) preserved (not reduced)
✓ Karmic debt markers (13, 14, 16, 19) detected and flagged
✓ 10 test births passing
✓ 50% independent verification (5/10 births)
✓ Edge cases handled (accented characters, special names, transliteration)
✓ API documentation complete
✓ Code committed to `engines/W2-NUMER-001/`

---

## Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `pandas` | 2.0.0 | Data handling & test case management |
| `pytest` | 7.4.0 | Test suite execution |

---

## Integration with Wave 2

**Consumes:** Birth name and date (no dependencies on astrology engines)
**Feeds:** W2-CALC-001 (evidence validation)
**Output Format:** JSON with all 10+ numbers + karmic debt flags

---

**Status:** Ready for T+3 Implementation Kickoff


