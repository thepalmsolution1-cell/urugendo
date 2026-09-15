from fastapi import APIRouter, HTTPException, status
from openai import (
    AuthenticationError,
    APITimeoutError,
    APIConnectionError,
    APIStatusError,
)
from app.models.intent import IntentRequest, IntentResponse
from app.services.nvidia_client import NVIDIAClient

router = APIRouter(prefix="/api/v1", tags=["Intent Extraction"])
nvidia_client = NVIDIAClient()


@router.post("/extract-intent", response_model=IntentResponse)
async def extract_intent(request: IntentRequest):
    """Extracts structured intent from user natural-language text by invoking NVIDIA client service."""
    try:
        extracted_data = nvidia_client.extract_intent(request.text)
        return IntentResponse(**extracted_data)
    except APITimeoutError as err:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"NVIDIA API Timeout: Request to NVIDIA NIM service timed out. ({str(err)})"
        )
    except (APIConnectionError, APIStatusError) as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"NVIDIA API Error: Upstream service error. ({str(err)})"
        )
    except (ValueError, AuthenticationError) as err:
        err_msg = str(err)
        if "API_KEY" in err_msg or "Authentication" in err_msg or "401" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"NVIDIA API Key Configuration Error: {err_msg}"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )
