from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.intent import IntentRequest, IntentResponse, ExtractedIntent

app = FastAPI(
    title="Urugendo ML Service",
    description="Python FastAPI service for AI intent extraction and NVIDIA NIM vector embeddings",
    version="1.0.0"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health status endpoint."""
    return {"status": "ok", "service": "ml-service"}


@app.post("/api/v1/extract-intent", response_model=IntentResponse, tags=["AI / Intent Extraction"])
async def extract_intent(request: IntentRequest):
    """Placeholder endpoint for NVIDIA NIM intent extraction."""
    # Request/response model baseline structure - implementation details pending
    placeholder_intent = ExtractedIntent(
        category="ecotourism",
        location="Musanze, Rwanda",
        max_budget=500.0,
        keywords=["gorilla trekking", "volcanoes", "nature"]
    )
    return IntentResponse(status="success", intent=placeholder_intent)
