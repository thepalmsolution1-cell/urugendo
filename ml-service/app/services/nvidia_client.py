import json
import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from openai import OpenAI

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

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = 30.0
    ):
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY")
        self.base_url = base_url or os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.model = model or os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
        self.timeout = timeout

    def _get_openai_client(self) -> OpenAI:
        if not self.api_key or self.api_key == "nvapi-your-nvidia-nim-api-key-here":
            raise ValueError("Missing or invalid NVIDIA_API_KEY configuration.")
        return OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=self.timeout
        )

    def _clean_json_response(self, content: str) -> str:
        """Strips markdown code blocks or wrapping whitespace from model output."""
        cleaned = content.strip()
        # Regex to strip ```json ... ``` or ``` ... ``` code block wrappers
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
        if match:
            cleaned = match.group(1).strip()
        return cleaned

    def extract_intent_raw(self, text: str) -> str:
        """Calls NVIDIA NIM OpenAI-compatible chat completion API and returns raw string response."""
        client = self._get_openai_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": INTENT_EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": text}
            ],
            temperature=0.1,
            top_p=0.9
        )
        if not response.choices or not response.choices[0].message.content:
            raise ValueError("Received empty response from NVIDIA API.")
        return response.choices[0].message.content.strip()

    def extract_intent(self, text: str) -> Dict[str, Any]:
        """Extract intent data from user natural-language text request and parse to dict."""
        raw_response = self.extract_intent_raw(text)
        cleaned_response = self._clean_json_response(raw_response)
        try:
            parsed_data = json.loads(cleaned_response)
            if not isinstance(parsed_data, dict):
                raise ValueError("Model response is not a valid JSON object.")
            return parsed_data
        except (json.JSONDecodeError, ValueError) as err:
            raise json.JSONDecodeError(
                f"Failed to parse NVIDIA NIM JSON output: {str(err)}", cleaned_response, 0
            ) from err
