from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class AnalysisItem(BaseModel):
    symbol: str
    mkt_value: Decimal
    pct_of_portfolio: Decimal

class PortfolioAnalysisResponse(BaseModel):
    total_mkt_value: Decimal
    items: list[AnalysisItem]