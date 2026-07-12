from pathlib import Path

import pdfplumber


src = Path(r"E:\HACKATHON\Odoo 12Jul,26")
out = Path("work/pdf_text")
out.mkdir(parents=True, exist_ok=True)

files = [
    "AssetFlow problem statement.pdfAssetFlow problem statement.pdf",
    "EcoSphere ESG Management Platform.pdf",
    "TransitOps Smart Transport Operations Platform.pdf",
]

for name in files:
    pdf = src / name
    text_parts = [f"FILE: {name}\n"]
    with pdfplumber.open(str(pdf)) as document:
        text_parts.append(f"PAGES: {len(document.pages)}\n")
        for index, page in enumerate(document.pages, start=1):
            text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            text_parts.append(f"\n--- PAGE {index} ---\n{text}\n")

    target = out / (pdf.stem[:80].replace(" ", "_") + ".txt")
    full_text = "\n".join(text_parts)
    target.write_text(full_text, encoding="utf-8")
    print(f"{target} {len(full_text)} chars")
