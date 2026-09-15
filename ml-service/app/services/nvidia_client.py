import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

INTENT_EXTRACTION_SYSTEM_PROMPT = (
    "You are an intent extraction engine. Given a user's natural-language request for an experience "
    "(dinner, activity, event, etc.), extract only the following fields as a single JSON object: location, "
    "people (integer), budget (integer, in RWF), occasion, preferences (array of strings), "
    "experience_types (array of strings). If a field is not mentioned, set it to null — never guess or infer "
    "a value that wasn't stated. Return ONLY the raw JSON object. No explanation, no markdown code fences, "
    "no extra text before or after it."
)


class NVIDIAClient:
    """NVIDIA NIM API client for intent extraction."""

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY")
        self.base_url = base_url or os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.model = model or os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")

    def extract_intent(self, text: str) -> Dict[str, Any]:
        """Extract intent data from user natural-language text request."""
        raise NotImplementedError("NVIDIA API call method skeleton.")
