from dataclasses import dataclass
from decimal import Decimal

@dataclass
class ParsedHolding:
    symbol: str
    shares: Decimal
    price: Decimal
    mkt_value: Decimal

class ParseError(Exception):
    pass