from decimal import Decimal, ROUND_HALF_UP
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import uuid4
from pathlib import Path
import jwt

from app.db.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.models.statement import Statement
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse
from app.schemas.holding import HoldingCreate, HoldingResponse
from app.schemas.statement import StatementResponse
from app.schemas.analysis import AnalysisItem, PortfolioAnalysisResponse
from app.core.security import create_access_token, decode_access_token
from app.services.parsers.types import ParsedHolding, ParseError
from app.services.parsers.robinhood import parse_robinhood_statement



import bcrypt

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB
UPLOAD_DIR = Path("uploads/statements")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "http://localhost:5174"],
    allow_methods = ["*"],
    allow_headers = ["*"],
    allow_credentials = True,
)

@app.get("/")
def root():
    return {"message": "Hello from Holdview"}

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db.refresh(new_user)
    return new_user

@app.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.post("/auth/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if user is None:
        raise credentials_exception
    if not bcrypt.checkpw(credentials.password.encode("utf-8"), user.password_hash.encode("utf-8")):
        raise credentials_exception
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, token_type="bearer")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None: 
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/portfolios", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    portfolio: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_portfolio = Portfolio(name=portfolio.name, user_id=current_user.id)
    db.add(new_portfolio)

    db.commit()
    
    db.refresh(new_portfolio)
    return new_portfolio

@app.get("/portfolios", response_model=list[PortfolioResponse])
def list_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    return portfolios

def get_user_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Portfolio:
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
    ).first()
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@app.post("/portfolios/{portfolio_id}/holdings", response_model=HoldingResponse, status_code=status.HTTP_201_CREATED)
def create_holding(
    holding: HoldingCreate,
    portfolio: Portfolio = Depends(get_user_portfolio),
    db: Session = Depends(get_db),

):
    
    new_holding = Holding(symbol=holding.symbol, shares=holding.shares, portfolio_id=portfolio.id)

    db.add(new_holding)

    db.commit()

    db.refresh(new_holding)
    return new_holding

@app.get("/portfolios/{portfolio_id}/holdings", response_model=list[HoldingResponse])
def list_holdings(
    portfolio: Portfolio = Depends(get_user_portfolio),
    db: Session = Depends(get_db),
):  
    return db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()

@app.post("/portfolios/{portfolio_id}/statements", response_model=StatementResponse, status_code=status.HTTP_201_CREATED)
async def upload_statement(
    file: UploadFile = File(...),
    portfolio: Portfolio = Depends(get_user_portfolio),
    db: Session = Depends(get_db),
):
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="File is not a PDF")
    
    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (> 10 MB)")


    storage_path = UPLOAD_DIR / f"{uuid4()}.pdf"

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    storage_path.write_bytes(contents)

    new_statement = Statement(portfolio_id=portfolio.id, original_filename=file.filename, storage_path=str(storage_path), file_size=len(contents))
    
    db.add(new_statement)

    db.commit()

    db.refresh(new_statement)

    try:
        parsed_holdings = parse_robinhood_statement(storage_path)
        db.query(Holding).filter(Holding.portfolio_id == portfolio.id).delete()
        for parsed_holding in parsed_holdings:
            db.add(Holding(symbol=parsed_holding.symbol, shares=parsed_holding.shares, price=parsed_holding.price, mkt_value=parsed_holding.mkt_value, portfolio_id=portfolio.id))
        new_statement.status = "parsed"
        db.commit()
    except ParseError as e:
        new_statement.status = "failed"
        new_statement.error_message = str(e)
        db.commit()

    db.refresh(new_statement)
    return new_statement

@app.get("/portfolios/{portfolio_id}/analysis", response_model=PortfolioAnalysisResponse)
def get_portfolio_analysis(
    portfolio: Portfolio = Depends(get_user_portfolio),
    db: Session = Depends(get_db),
):
    holdings_with_val = db.query(Holding).filter(Holding.portfolio_id == portfolio.id, Holding.mkt_value.is_not(None)).all()

    if not holdings_with_val:
        return PortfolioAnalysisResponse(total_mkt_value=Decimal("0"), items=[])
    
    total_mkt_value = sum(holding.mkt_value for holding in holdings_with_val)
    
    analysis_list = []
    for holding in holdings_with_val:
        pct_of_portfolio = (holding.mkt_value / total_mkt_value).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        new_analysis = AnalysisItem(symbol=holding.symbol, mkt_value=holding.mkt_value, pct_of_portfolio=pct_of_portfolio)
        analysis_list.append(new_analysis)

    analysis_list.sort(key=lambda item: item.pct_of_portfolio, reverse=True)

    return PortfolioAnalysisResponse(total_mkt_value=total_mkt_value, items=analysis_list)
    
