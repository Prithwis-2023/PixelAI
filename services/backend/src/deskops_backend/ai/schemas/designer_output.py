from pydantic import BaseModel, Field


class WorkflowStep(BaseModel):
    step_id: str
    action: str
    target: str


class RollbackPlan(BaseModel):
    strategy: str
    checkpoints: list[str] = Field(default_factory=list)


class DesignerOutput(BaseModel):
    workflow_name: str
    steps: list[WorkflowStep]
    exception_paths: list[str] = Field(default_factory=list)
    rollback: RollbackPlan
