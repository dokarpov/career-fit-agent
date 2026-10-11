from __future__ import annotations
from abc import ABC, abstractmethod

class JobSource(ABC):
    name: str

    @abstractmethod
    async def search(self, query: str, countries: list[str], remote_only: bool):
        raise NotImplementedError
