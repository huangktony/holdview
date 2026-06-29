from app.services.parsers.robinhood import parse_robinhood_statement

# Replace with the path to your actual Robinhood PDF
PDF_PATH = "/Users/tonyhuang/Downloads/statements/36e9358b-f99b-3ba3-b37b-2a633199038d.pdf"

holdings = parse_robinhood_statement(PDF_PATH)
print(f"Parsed {len(holdings)} holdings:")
for h in holdings:
    print(f"  {h.symbol}: {h.shares}")