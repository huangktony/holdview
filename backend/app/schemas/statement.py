from pydantic import BaseModel, ConfigDict
from datetime import datetime

class StatementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    portfolio_id: int
    original_filename: str
    status: str
    file_size: int
    created_at: datetime