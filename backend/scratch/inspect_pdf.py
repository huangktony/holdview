import pdfplumber

PDF_PATH = "/Users/tonyhuang/Downloads/statements/36e9358b-f99b-3ba3-b37b-2a633199038d.pdf"

with pdfplumber.open(PDF_PATH) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    print()

    # hit page 3 (where portfolio summary starts in the file)
    page = pdf.pages[2]

    print("=" * 60)
    print("=" * 60)
    print("PAGE 3 — extract_text()")
    print("=" * 60)
    print(page.extract_text())
    
    print()
    print("=" * 60)
    print("PAGE 3 — extract_tables()")
    print("=" * 60)
    tables = page.extract_tables()
    print(f"Number of tables found: {len(tables)}")
    for i, table in enumerate(tables):
        print(f"\n--- Table {i} ---")
        for row in table:
            print(row)