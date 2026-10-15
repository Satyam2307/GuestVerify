import asyncio
from typing import List, Dict, Optional, Set
from ..models import EventRecord


class MemoryEventStore:
    def __init__(self, max_events: int = 200):
        self._events: List[EventRecord] = []
        self._max_events = max_events
        self._subscribers: Set[asyncio.Queue] = set()

    def add_event(self, record: EventRecord) -> None:
        self._events.insert(0, record)
        if len(self._events) > self._max_events:
            self._events.pop()

    def get_event(self, event_id: str) -> Optional[EventRecord]:
        for e in self._events:
            if e.event_id == event_id:
                return e
        return None

    def list_events(
        self,
        decision: Optional[str] = None,
        device_id: Optional[str] = None,
        limit: int = 50
    ) -> List[EventRecord]:
        results = self._events
        if decision:
            results = [e for e in results if e.decision == decision]
        if device_id:
            results = [e for e in results if e.device_id == device_id]
        return results[:limit]

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subscribers.discard(q)

    async def broadcast(self, event_type: str, data: dict) -> None:
        payload = {"event_type": event_type, "data": data}
        dead_queues = set()
        for q in list(self._subscribers):
            try:
                q.put_nowait(payload)
            except Exception:
                dead_queues.add(q)
        for q in dead_queues:
            self._subscribers.discard(q)


memory_event_store = MemoryEventStore()
