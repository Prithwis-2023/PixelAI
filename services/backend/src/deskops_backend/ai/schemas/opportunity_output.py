from pydantic import BaseModel, Field


class OpportunityCandidate(BaseModel):
    candidate_id: str
    name: str
    success_probability: float = Field(ge=0, le=1)
    risk_score: float = Field(ge=0, le=1)
    normalized_time_saved: float = Field(ge=0, le=1)
    score: float = Field(ge=0, le=1)
    reason: str


class OpportunityOutput(BaseModel):
    candidates: list[OpportunityCandidate] = Field(default_factory=list)
