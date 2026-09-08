from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from types import ModuleType


WAVE2_ROOT = Path(__file__).resolve().parents[1]

ENGINE_MAP = {
    "W2_ASTRO_001": ("W2-ASTRO-001", "src/ephemeris.py"),
    "W2_ASTRO_002": ("W2-ASTRO-002", "src/validator.py"),
    "W2_ASTRO_003": ("W2-ASTRO-003", "src/placidus.py"),
    "W2_ASTRO_004": ("W2-ASTRO-004", "src/whole_sign.py"),
    "W2_ASTRO_005": ("W2-ASTRO-005", "src/aspects.py"),
    "W2_ASTRO_006": ("W2-ASTRO-006", "src/extended.py"),
    "W2_NUMER_001": ("W2-NUMER-001", "src/numerology.py"),
    "W2_HD_001": ("W2-HD-001", "src/hd_gate.py"),
    "W2_CALC_001": ("W2-CALC-001", "src/validator.py"),
    "W2_CALC_002": ("W2-CALC-002", "src/degradation.py"),
    "W2_CORPUS_001": ("W2-CORPUS-001", "src/corpus.py"),
    "W2_CORPUS_002": ("W2-CORPUS-002", "src/synthetic.py"),
}


def load_engine(name: str) -> ModuleType:
    if name not in ENGINE_MAP:
        raise ImportError(f"Unknown Wave 2 engine: {name}")

    track_dir, relative_file = ENGINE_MAP[name]
    module_path = WAVE2_ROOT / track_dir / relative_file

    if not module_path.is_file():
        raise ImportError(
            f"{name} implementation file does not exist: {module_path}"
        )

    module_name = f"soul_codex_federation.wave2.{name.lower()}"

    spec = importlib.util.spec_from_file_location(module_name, module_path)

    if spec is None or spec.loader is None:
        raise ImportError(f"Could not create import spec for {name}")

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)

    return module


def load_all_engines() -> dict[str, ModuleType]:
    return {
        engine_name: load_engine(engine_name)
        for engine_name in ENGINE_MAP
    }
