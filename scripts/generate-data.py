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


def _sheet_data_name(workbook_path: Path) -> str:
    """Worksheet must be named `data` (case-insensitive: Data, DATA, …)."""
    xl = pd.ExcelFile(workbook_path)
    for raw in xl.sheet_names:
        name = raw.strip()
        if name.casefold() == "data":
            return raw
    found = ", ".join(repr(s) for s in xl.sheet_names)
    raise SystemExit(
        f"Worksheet 'data' not found in {workbook_path}. Available sheets: {found}"
    )


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
    sheet = _sheet_data_name(wb)
    df = pd.read_excel(wb, sheet_name=sheet)
    df.columns = df.columns.astype(str).str.strip()
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"Using workbook: {wb} (sheet: {sheet!r})")
    print(f"Wrote {len(df)} rows to {OUT_CSV}")


if __name__ == "__main__":
    main()
