from fastapi import APIRouter
from app.api.v1.vessels import router as vessels_router
from app.api.v1.fuels import router as fuels_router
from app.api.v1.predict import router as predict_router
from app.api.v1.emissions import router as emissions_router
from app.api.v1.optimize import router as optimize_router
from app.api.v1.benchmark import router as benchmark_router
from app.api.v1.scenarios import router as scenarios_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.routes import router as routes_router
from app.api.v1.assumptions import router as assumptions_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(dashboard_router)
api_router.include_router(vessels_router)
api_router.include_router(fuels_router)
api_router.include_router(routes_router)
api_router.include_router(predict_router)
api_router.include_router(emissions_router)
api_router.include_router(optimize_router)
api_router.include_router(benchmark_router)
api_router.include_router(scenarios_router)
api_router.include_router(assumptions_router)
