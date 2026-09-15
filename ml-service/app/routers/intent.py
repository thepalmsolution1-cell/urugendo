from fastapi import APIRouter
from app.models.intent import IntentRequest, IntentResponse
from app.services.nvidia_client import NVIDIAClient

router = APIRouter(prefix="/api/v1", tags=["Intent Extraction"])
nvidia_client = NVIDIAClient()


@router.post("/extract-intent", response_model=IntentResponse)
async def extract_intent(request: IntentRequest):
    """Extracts structured intent from user natural-language text by invoking NVIDIA client service."""
    extracted_data = nvidia_client.extract_intent(request.text)
    return IntentResponse(**extracted_data)
