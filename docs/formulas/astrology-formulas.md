# Astrology Calculation Formulas & Core Mechanics

This document outlines the mathematical models and geometric algorithms utilized to calculate birth charts and planetary positions in **Ultimate Soul Codex**.

---

## 1. Coordinate Systems & Ecliptic Projection

All planetary positions are computed using the **Ecliptic Coordinate System**, where the reference plane is the Earth's orbit around the Sun (the ecliptic), and the origin is the Vernal Equinox.

### Longitude Normalization
Planetary longitudes ($\lambda$) are normalized to a $360^\circ$ circle:
$$\lambda_{normalized} = (\lambda \pmod{360} + 360) \pmod{360}$$

### Zodiac Sign Mapping
The ecliptic circle is divided into 12 equal signs of $30^\circ$ each. The sign index is determined by:
$$\text{Index} = \lfloor \frac{\lambda}{30} \rfloor$$

```
0: Aries       1: Taurus      2: Gemini     3: Cancer
4: Leo         5: Virgo       6: Libra      7: Scorpio
8: Sagittarius 9: Capricorn   10: Aquarius  11: Pisces
```

---

## 2. Sidereal Time Calculation

Local Sidereal Time (LST) is crucial for determining the local houses and Ascendant. It represents the angle of the Vernal Equinox relative to the observer's meridian.

1. **Greenwich Mean Sidereal Time (GMST)** is computed via the astronomical algorithms (based on IAU 1982/2000 models).
2. **Local Sidereal Time (LST)** is calculated in hours:
$$LST = (GMST + \frac{\text{Longitude}}{15}) \pmod{24}$$

---

## 3. House Systems (Equal House System)

The current implementation utilizes the **Equal House System**, which is robust, geometrically stable at all latitudes, and prevents house collapse in polar regions.

### Equal House Cusps Formulation
Given the Ascendant longitude ($\lambda_{Asc}$):
$$\text{Cusp}_{i} = (\lambda_{Asc} + (i - 1) \times 30^\circ) \pmod{360}$$
where $i$ ranges from $1$ to $12$.

### Planet House Position Placement
A planet with longitude $\lambda_p$ resides in House $i$ if:
$$\text{Cusp}_i \le \lambda_p < \text{Cusp}_{i+1}$$
*(With appropriate wrapping applied at the $0^\circ$ Aries boundary).*

---

## 4. Ascendant & Midheaven Calculations

The Ascendant (Rising Sign) is the point of the ecliptic that rises on the eastern horizon at a specific time and location.

### Mathematical Formulation
$$\theta_{LST} = LST \times 15^\circ$$
$$\phi = \text{Latitude}$$
$$\epsilon = 23.4397^\circ \quad \text{(Obliquity of the Ecliptic)}$$

$$\lambda_{Asc} = \operatorname{atan2}\left(\cos(\theta_{LST}), -(\sin(\theta_{LST}) \cos(\epsilon) + \tan(\phi) \sin(\epsilon))\right)$$

---

## 5. Aspect Geometry & Orbs

Aspects represent significant angular distances between planets.

$$\text{Difference} = |\lambda_{p1} - \lambda_{p2}|$$
$$\text{Shortest Distance} = \min(\text{Difference}, 360^\circ - \text{Difference})$$

### Supported Aspect Angles and Allowed Orbs
| Aspect | Nominal Angle | Allowed Orb |
| :--- | :--- | :--- |
| **Conjunction** | $0^\circ$ | $10^\circ$ |
| **Sextile** | $60^\circ$ | $6^\circ$ |
| **Square** | $90^\circ$ | $8^\circ$ |
| **Trine** | $120^\circ$ | $8^\circ$ |
| **Opposition** | $180^\circ$ | $10^\circ$ |
