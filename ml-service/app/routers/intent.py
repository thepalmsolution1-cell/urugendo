from fastapi import APIRouter
from app.models.intent import IntentRequest, IntentResponse

router = APIRouter(prefix="/api/v1", tags=["Intent Extraction"])


@router.post("/extract-intent", response_model=IntentResponse)
async def extract_intent(request: IntentRequest):
    """Router endpoint skeleton for extracting intent from user natural-language text."""
    raise NotImplementedError("Intent router endpoint pending connection to NVIDIA client service.")
