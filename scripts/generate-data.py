"""Export Ministries_PVP_Clean.xlsx to public/data/ministries_pvp.csv (stripped headers)."""
from __future__ import annotations

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
# Repo root dashboard: workbook next to scripts/ inside repo.
# Nested layout (repo contains psc-pvp-dashboard folder): workbook one level above app folder.
_WORKBOOK_NAMES = ("Ministries_PVP_Clean.xlsx",)
_CANDIDATE_DIRS = (
    ROOT,
    ROOT.parent,
)
XLSX: Path | None = None
for d in _CANDIDATE_DIRS:
    for name in _WORKBOOK_NAMES:
        p = d / name
        if p.is_file():
            XLSX = p
            break
    if XLSX is not None:
        break

OUT_DIR = ROOT / "public" / "data"
OUT_CSV = OUT_DIR / "ministries_pvp.csv"


def main() -> None:
    if XLSX is None:
        searched = ", ".join(str(d / _WORKBOOK_NAMES[0]) for d in _CANDIDATE_DIRS)
        raise SystemExit(f"Missing workbook Ministries_PVP_Clean.xlsx. Checked: {searched}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(XLSX, sheet_name="data")
    df.columns = df.columns.astype(str).str.strip()
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"Using workbook: {XLSX}")
    print(f"Wrote {len(df)} rows to {OUT_CSV}")


if __name__ == "__main__":
    main()
