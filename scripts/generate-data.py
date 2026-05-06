"""Export ministries_pvp Excel workbook to public/data/ministries_pvp.csv for the static site."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
# Search order: many teams keep the workbook under public/data/ next to where CSV lands;
# CI may still place it beside package.json or in the repo parent folder.
_WORKBOOK_NAMES = (
    "ministries_pvp.xlsx",
    "Ministries_PVP_Clean.xlsx",
)
_SEARCH_DIRS = (
    ROOT / "public" / "data",
    ROOT,
    ROOT.parent,
)


def _find_workbook() -> Path | None:
    for name in _WORKBOOK_NAMES:
        for d in _SEARCH_DIRS:
            p = (d / name).resolve()
            if p.is_file() and not p.name.startswith("~$"):
                return p
    return None


OUT_DIR = ROOT / "public" / "data"
OUT_CSV = OUT_DIR / "ministries_pvp.csv"


def main() -> None:
    wb = _find_workbook()
    if wb is None:
        checked = [str(d / n) for d in _SEARCH_DIRS for n in _WORKBOOK_NAMES]
        raise SystemExit(
            "Missing workbook. Place ministries_pvp.xlsx (preferred) or Ministries_PVP_Clean.xlsx in:\n"
            f"  - {ROOT / 'public' / 'data'}\n"
            f"  - {ROOT}\n"
            f"  - {ROOT.parent}\n"
            f"Checked:\n  " + "\n  ".join(checked)
        )
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(wb, sheet_name="data")
    df.columns = df.columns.astype(str).str.strip()
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"Using workbook: {wb}")
    print(f"Wrote {len(df)} rows to {OUT_CSV}")


if __name__ == "__main__":
    main()
