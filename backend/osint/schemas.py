from pydantic import BaseModel
from typing import Optional, List


class ScanRequest(BaseModel):
    email: str
    username: str
    repo_url: Optional[str] = None


class BreachInfo(BaseModel):
    name: str
    title: str
    description: str
    breached_data: List[str]
    breach_date: str
    severity: str  # high, medium, low


class SocialProfile(BaseModel):
    username: str
    platform: str
    url: str
    found: bool


class Secret(BaseModel):
    type: str
    value: str
    line: int
    file: str
    severity: str


class ExposureScore(BaseModel):
    total_breaches: int
    total_credentials_exposed: int
    platforms_found: int
    secrets_found: int
    score: int  # 0-100, higher is worse


class ScanResult(BaseModel):
    email: str
    username: str
    breaches: List[BreachInfo]
    social_profiles: List[SocialProfile]
    secrets: List[Secret]
    exposure_score: ExposureScore
    timestamp: str
