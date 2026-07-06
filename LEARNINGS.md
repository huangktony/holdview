# 2026-05-22

## What I did today
- Used Claude to format an overview of the workflow of my application
- Broke it down into 5 stages:
    1. Frontend
    2. Backend
    3. Database
    4. Worker
    5. Queue

## What I didn't know before
- Workers are used as a way for slow jobs to be done by another program instead of blocking up backend
    - PDF processing may take long, don't want to block backend
- Queue (Redis) is a way for us to leave small messages in RAM to worker to know what tasks need to be done and where to find the files
    - Communication between backend and worker
- localhost addresses are hardcoded in the OS

## What still needs work
- Understanding JWT tokens in cookies for login vs local storage
- How Request/Response cycles work in HTTP when communicating between frontend and backend
- What does worker do with the message left in queue? How does it work in general?

# 2026-05-26

## What I did today
- Installed uv, initialized it and added FastAPI and uvicorn as dependencies onto the venv.
- Wrote my first FastAPI endpoint at the root that returns Hello from Holdview
- Used Claude to mental map on how an HTTP request flows from start (URL) to end

## What I didn't know before
- Program binds to a port, here we're using Uvicorn, listening to incoming HTTP requests
- An application, FastAPI, defines the endpoints
- We create Python venv because we don't want to have dependency conflict problems
    - Only one slot for one version of the library. Some programs may require a specific version, so we just use the venv instead of polluting our system.
    - Makes your program reproducible and easily to clean up
- uv is a package manager. A newer counterpart to pip. 
    - faster, contains workflow tools in one place
- uvicorn is program that runs on the server. Binds to a port, listening for requests. Also serves as a way to send data back to client.
- FastAPI is an app in server memory. Once a request comes in uvicorn hands it over for FastAPI to handle

## What still needs work
- Need to be able to explain how decorators work mechanically and what they are conceptually
- Async/await in Python
- Learn what CORS is
- Be able write my own endpoints and learn how to write them well

# 2026-06-04

## What I did today
- Synced up my local Git with Github repo using SSH token
- Scaffolded my frontend using Vite + React
- Wrote a working FastAPI backend with one endpoint, CORS configured
- Full stack wired end-to-end (React Dev Server to FastAPI + uvicorn), rendering data from API in browser

## What I didn't know before
- CORS allows legit requests/reponses made by JavaScript to safely pass by the browser's safety measure (Same-Origin Policy)
- Browsers only understands HTML/CSS/JS so we need a builder (Vite) that compiles our React (JSX) and TypeScript into JS
- Since the CORS middleware is written on the server side, the browser notes the request from localhost:5173 is cross-origin. Then the request hits uvicorn->FastAPI and goes through the CORS middleware and attaches the CORS header if localhost:5173 is in its allow_origins list.
- Scaffolding means setting up the boilerplate code. In our frontend we used npm create vite@latest to scaffold our Vite project. Then in our backend I used uv init to scaffold our Python project.

## What still needs work
- Async/await in Python
- Be able to understand and speak on every stage that happens in the full stack wiring from frontend to backend.
- Become very proficient in explaining the code in React and Python
- Writing endpoints and React components

# 2026-06-13

## What I did today
- I installed Postgres, setup SQLAlchemy and Alembic.
- Added Users table and User/Email columns as the first changes to our schema in SQLAlchemy. Then used Alembic to autogenerate migration file and reviewed it. Then made our first migration.

## What I didn't know before
- We use a connection string so that our libraries know where to talk to PostgreSQL and not the other way around. 
- SQLAlchemy talks to Postgres through a driver called psycopg, which handles the actual network protocol.
- Understood that the conneciton pool are preopened connections that sessions use to make changes/complete their tasks. Sessions group changes into transactions, which commit atomically or roll back entirely.
- Alembic is able to generate migration files by following through the SQLAlchemy models via Base

## What still needs work
- Locking in the Alembic loop mentally mapped. 
- Database read Path from end to end (SQLAlchemy to psycopg to Postgres and back)
- Process vs Library distinction

# 2026-06-13

## What I did today
- Added JWT auth: JWT signature is an HMAC of header+payload, signed with a server-only secret. Anyone can read the payload but no one can produce a valid signature without the secret, making the token tamper-proof
- Check tokens + other credentials to raise exceptions: invalid access token, missing user, incorrect password, past expiration
- Created a new schema for auth, LoginRequest which contains email and password where we query the database to verify if this email exists and we call bcrypt.checkpw(submitted_password, stored_hash) which uses the salt embedded in the stored hash to verify

## What I didn't know before
- User enumeration defense: giving same error for "no such user" or "wrong password"
- OAuth2Password Bearer parses the token if the format is right, if not, it raises a 401. Verification happens in decode_access_token

## What still needs work
- Solidifying auth mapping and being able to describe every step
- Understanding how JWT tokens can be protected
- Authorization vs Authentication
- Re-recall the layering: oauth2_scheme (parsing) → decode_access_token (cryptographic verification) → DB lookup (existence verification). Three distinct steps for three distinct failure modes.

# 2026-06-14

## What I did today
- Added portfolios and holdings table with foreign key relations
- Used relationship() + back_populates to ensure SQLAlchemy sees that the relationship is the same end to end and sync up those relational values
- Migrated the database schema using Alembic

## What I didn't know before
- relationship() = lets you access a foreign-key relationship as an attribute VS. manually querying for it
- back_populates = when two relationship() calls are paired we can use this to keep them in sync
- Foreign Key allows you to connect two tables together
- Relationship allows you to access user.portfolios / portfolio.holdings and vice versa (easy accessing)
    - Avoids # Without relationship attributes — painful
    portfolio = db.query(Portfolio).first()
    user = db.query(User).filter(User.id == portfolio.user_id).first()

## What still needs work
- Understanding writing models syntax
- Knowing when a column can be forced to be unique
    - Only when you know that only thing can have one of this

# 2026-06-18

## What I did today
- Wrote the Pydantic schemas for Holding (HoldingCreate, HoldingResponse) and Portfolio (PortfolioCreate, PortfolioResponse)
- Wrote POST and GET endpoints for /portfolios with JWT auth + user filtering
- Used curl to test JWT auth and user filtering

## What I didn't know before
- Input schemas should not include server-controlled fields in order to prevent unauthorized users from accessing other users
-.filter(Portfolio.user_id == current_user.id) is a security boundary to filter out other users
- On response schemas we need from_attributes=True (ConfigDict) to allow Pydantic to read fields off our SQLAlchemy models
- 201 Created vs 200 OK is that 201 is for successful POST that creates something

## What still needs work
- Understanding Class-vs-instance, mentally check code you're writing
- Mentally compiling code and thinking through solutions
- Remember from_attributes=True
- SQLAlchemy queries return a Query object, not a list — need .all() to actually execute and get the list 

# 2026-06-21

## What I did today
- Built endpoints POST/GET for holdings with ownership verification
- Refactored ownership check as a reusable dependency (get_user_portfolio)
- Created Statement model + Pydantic schema
- Built endpoint for Statement PDF upload with ownership verification + max file size + content verification + UUID storage

## What I didn't know before
- 404 vs 403: returning 403 leaks data that the item exists but 404 keeps information hidden from attackers
- When you load an object through ownership check, don't use user input rather information pulled from object itself (acts as defense)
- Create a dependency for code repeated in multiple endpoints

## What still needs work
- Leaving dead code after refactoring
- Look at Robinhood PDF
- Understanding when async def is required 
- Pydantic schema vs SQLAlchemy models are not the same
    - Pydantic schema defines what can come in through the API request body
    - SQLAlchemy model defines what goes into the database

# 2026-06-27

## What I did today
- pdfplumber exploration on a real Robinhood brokerage PDF
- Accepted ADR-003

## What I didn't know before
- Sometimes pdfplumber's extract_tables() does not work on Robinhood's format. To compensate use text then parse by each line

## What still needs work
- Have not yet implemented proper parsing yet
- Understand and have sound reasoning for implementation details (Replace vs Append vs Merge decision on new statement uploads)

# 2026-06-28

## What I did today
- Wired up PDF parser with upload_statement endpoint, added try and except body for PDF parsing
- Finished end-to-end Robinhood statement upload to parsing to loading db
- Wrote PDF parsing dataclass + added Statement error_message
- Debugged the PDF parser as first page hits "Total Securities" our chosen terminator

## What I didn't know before
- dataclasses in Python

## What still needs work
- Understanding try/except blocks
- Learn dataclasses 
- Fimiliarize with pdfplumber

# 2026-07-03

## What I did today
- Added price and mkt_value to Holding
- ParsedHolding and upload_statement extended to include mkt_value and price for concentration analysis
- Added new AnalysisItem and PortfolioAnalysisResponse schemas
- New concentration analysis endpoint 

## What I didn't know before
- Pulling from an external API changes our scale a lot
- Pydantic schemas are different from SQLAlchemy models
- Empty is not an error

## What still needs work
- Being able to make sound design choices
- Understand what the differences between Pydantic schemas and SQLAlchemy models and when to use what
- When to use model_config = ConfigDict(from_attributes=True)
