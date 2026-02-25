from pydantic import BaseModel, Field


class SummaryGroup(BaseModel):
    name: str
    duration_minutes: int = Field(ge=0)
    frequency: int = Field(ge=0)


class RepetitivePattern(BaseModel):
    pattern_id: str
    description: str
    occurrences: int = Field(ge=0)


class SummarizerOutput(BaseModel):
    day_summary: str
    work_categories: list[SummaryGroup]
    repetitive_patterns: list[RepetitivePattern]
