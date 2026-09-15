from typing import List, Optional
from pydantic import BaseModel, Field


class IntentRequest(BaseModel):
    text: str = Field(..., description="User's natural-language free-text request for an experience")


class IntentResponse(BaseModel):
    location: Optional[str] = Field(None, description="Extracted target location")
    people: Optional[int] = Field(None, description="Extracted number of people (integer)")
    budget: Optional[int] = Field(None, description="Extracted budget in RWF (integer)")
    occasion: Optional[str] = Field(None, description="Extracted occasion or event purpose")
    preferences: Optional[List[str]] = Field(None, description="Extracted specific preferences")
    experience_types: Optional[List[str]] = Field(None, description="Extracted experience categories/types")
