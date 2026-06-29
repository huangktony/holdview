from dataclasses import dataclass
from decimal import Decimal

@dataclass
class ParsedHolding:
    symbol: str
    shares: Decimal

class ParseError(Exception):
    pass