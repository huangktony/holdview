from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PortfolioCreate(BaseModel):
    name: str

class PortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime