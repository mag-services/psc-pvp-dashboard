"""Export Ministries_PVP_Clean.xlsx to public/data/ministries_pvp.csv (stripped headers)."""
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT.parent / "Ministries_PVP_Clean.xlsx"
OUT_DIR = ROOT / "public" / "data"
OUT_CSV = OUT_DIR / "ministries_pvp.csv"


def main() -> None:
    if not XLSX.is_file():
        raise SystemExit(f"Missing workbook: {XLSX}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(XLSX, sheet_name="data")
    df.columns = df.columns.astype(str).str.strip()
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"Wrote {len(df)} rows to {OUT_CSV}")


if __name__ == "__main__":
    main()
