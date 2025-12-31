from fastapi import APIRouter
from .statements import router as statements_router
from .transactions import router as transactions_router
from .analytics import router as analytics_router

router = APIRouter()

router.include_router(statements_router, prefix="/statements", tags=["statements"])
router.include_router(transactions_router, prefix="/transactions", tags=["transactions"])
router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
