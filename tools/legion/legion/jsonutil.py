"""Robust extraction of JSON objects from model replies."""
from __future__ import annotations

import json
import re

_FENCE = re.compile(r"```(?:json)?\s*\n?(.*?)\n?```", re.S)
_DECODER = json.JSONDecoder()


def extract_json(text: str):
    """Return the first JSON object/array found in ``text``.

    Tries, in order: the whole reply, fenced ```json blocks, then a raw_decode
    from every '{' / '[' position. Raises ValueError if nothing parses.
    """
    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass
    for block in _FENCE.findall(text):
        try:
            return json.loads(block.strip())
        except json.JSONDecodeError:
            continue
    tried = 0
    for i, ch in enumerate(text):
        if ch in "{[":
            tried += 1
            try:
                value, _ = _DECODER.raw_decode(text, i)
                if isinstance(value, (dict, list)):
                    return value
            except json.JSONDecodeError:
                pass
            if tried >= 400:
                break
    raise ValueError("no parseable JSON object found in reply")
