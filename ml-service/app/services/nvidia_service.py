import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")


def check_nvidia_connectivity():
    """
    Checks network reachability and authentication status with NVIDIA NIM API.
    """
    try:
        client = OpenAI(
            base_url=NVIDIA_BASE_URL,
            api_key=NVIDIA_API_KEY if NVIDIA_API_KEY else "nvapi-dummy-key"
        )
        # Attempt to list models or ping base endpoint
        models = client.models.list()
        return {
            "status": "connected",
            "base_url": NVIDIA_BASE_URL,
            "authenticated": True,
            "available_models_count": len(models.data) if hasattr(models, "data") else 0
        }
    except Exception as e:
        err_msg = str(e)
        # 401 Unauthorized means host/network connectivity is SUCCESSFUL, but key is unauthenticated/placeholder
        if "401" in err_msg or "Unauthorized" in err_msg or "API key" in err_msg:
            return {
                "status": "reachable",
                "base_url": NVIDIA_BASE_URL,
                "authenticated": False,
                "message": "NVIDIA NIM API endpoint reached successfully over HTTPS (Requires valid NVIDIA_API_KEY for full inference)."
            }
        return {
            "status": "error",
            "base_url": NVIDIA_BASE_URL,
            "error": err_msg
        }
