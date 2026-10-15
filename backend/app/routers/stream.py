import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..storage.memory_store import memory_event_store

router = APIRouter(prefix="/api/v1", tags=["Live Stream"])


@router.get("/stream")
async def live_event_stream():
    """
    Server-Sent Events (SSE) live stream.
    Broadcasts real-time events to all connected clients:
    - ring_event_received
    - analysis_started
    - analysis_completed
    - policy_evaluated
    - action_executed
    """
    queue = memory_event_store.subscribe()

    async def event_generator():
        try:
            # Yield initial connection confirmation
            yield f"event: connected\ndata: {json.dumps({'message': 'Connected to GuestVerify Live SSE Stream'})}\n\n"

            while True:
                try:
                    # Wait for next event or send periodic keep-alive
                    msg = await asyncio.wait_for(queue.get(), timeout=20.0)
                    event_type = msg.get("event_type", "message")
                    data = msg.get("data", {})
                    yield f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat keep-alive
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            memory_event_store.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
