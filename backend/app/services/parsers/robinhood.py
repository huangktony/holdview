import pdfplumber
from decimal import Decimal

from app.services.parsers.types import ParsedHolding, ParseError

def parse_robinhood_statement(file_path: str) -> list[ParsedHolding]:
    with pdfplumber.open(file_path) as pdf:
        parsed_list = []
        in_holdings = False
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text is None:
                continue
            for line in text.split('\n'):
                print(f"[page {page_num+1}] in_holdings={in_holdings} | {line!r}")
                if "Securities Held in Account" in line:
                    in_holdings = True
                    continue
                if in_holdings and line.startswith("Total Securities"):
                    return parsed_list
                if in_holdings:
                    tokens = line.split()
                    if len(tokens) >= 5 and tokens[1] in ("Margin", "Cash"):
                        parsed_price = Decimal(tokens[3].lstrip('$').replace(',', ''))
                        parsed_mkt_value = Decimal(tokens[4].lstrip('$').replace(',', ''))
                        new_parse = ParsedHolding(symbol=tokens[0], shares=Decimal(tokens[2]), price=parsed_price, mkt_value=parsed_mkt_value)
                        parsed_list.append(new_parse)
        raise ParseError("Holdings section terminator not found")