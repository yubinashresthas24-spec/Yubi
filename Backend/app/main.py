from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.routers import auth, dashboard, inventories, items, router as root_router

app = FastAPI(title="InvenTrack API")

# ── CORS (must be before routes) ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    from sqlalchemy import text as _text
    with engine.begin() as conn:
        conn.execute(_text("DROP SCHEMA public CASCADE"))
        conn.execute(_text("CREATE SCHEMA public"))
    models.Base.metadata.create_all(bind=engine)


# ── Router Registration ───────────────────────────────────────────────────────
app.include_router(root_router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(inventories.router)
app.include_router(items.router)
