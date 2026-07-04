from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime

class HoldingCreate(BaseModel):
    symbol: str
    shares: Decimal


class HoldingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    shares: Decimal
    price: Decimal | None
    mkt_value: Decimal | None
    portfolio_id: int
    created_at: datetime