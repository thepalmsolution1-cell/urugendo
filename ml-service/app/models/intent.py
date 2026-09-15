from typing import List, Optional
from pydantic import BaseModel, Field


class IntentRequest(BaseModel):
    user_prompt: str = Field(..., description="Raw text query/prompt from user")
    context: Optional[dict] = Field(default=None, description="Optional context metadata")


class ExtractedIntent(BaseModel):
    category: Optional[str] = Field(None, description="Extracted category/experience type")
    location: Optional[str] = Field(None, description="Extracted target location")
    max_budget: Optional[float] = Field(None, description="Extracted budget limit")
    keywords: List[str] = Field(default_factory=list, description="Extracted key search terms")


class IntentResponse(BaseModel):
    status: str = Field("success", description="Status of intent extraction")
    intent: ExtractedIntent = Field(..., description="Structured extracted intent")
