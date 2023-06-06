from typing import Any
from dataclasses import dataclass, field

from .db import start_engine
from .settings import DB_SETTINGS

@dataclass
class BackEndResponse:
    type: str
    status: str = "ok" # ["ok", "error", "inprogress"]
    error: str = ""
    output: dict[str, Any] = field(default_factory=dict)

    def json(self) -> dict[str, Any]:
        return {
            "type": self.type,
            "status": self.status,
            "error": self.error,
            "output": self.output
        }
    
start_engine(**DB_SETTINGS)