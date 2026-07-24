"""
CRESTA chatbot views.

Two endpoints:
- chat        — single JSON response (Week 1, still useful for testing / fallback)
- chat_stream — real word-by-word SSE streaming (Week 2)

Auth follows the same @api_view + IsAuthenticated pattern as your
other advisor views, so it plugs into your existing JWT setup with no
extra config.
"""
import json

from django.http import StreamingHttpResponse
from langchain_core.messages import AIMessageChunk
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .agent import build_agent, load_history, append_history, clear_history


@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    """
    POST /api/chatbot/chat/
    Body: {"message": "What stocks do I hold?", "lang": "en"}
    Non-streaming — returns the full answer in one JSON response.
    """
    message = (request.data.get("message") or "").strip()
    lang = request.data.get("lang", "en")

    if not message:
        return Response({"error": "Message cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user if getattr(request.user, 'is_authenticated', False) else None
    user_id = user.id if user else "guest"

    try:
        agent = build_agent(user, lang=lang)
        chat_history = load_history(user_id)
        result = agent.invoke({
            "messages": chat_history + [{"role": "user", "content": message}]
        })
        answer = result["messages"][-1].content
    except Exception as e:
        return Response(
            {"error": f"Chat failed: {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    append_history(user_id, "user", message)
    if answer:
        append_history(user_id, "assistant", answer)

    return Response({"answer": answer})


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_stream(request):
    """
    POST /api/chatbot/chat/stream/
    Body: {"message": "What stocks do I hold?", "lang": "en"}
    """
    message = (request.data.get("message") or "").strip()
    lang = request.data.get("lang", "en")

    if not message:
        return Response({"error": "Message cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user if getattr(request.user, 'is_authenticated', False) else None
    user_id = user.id if user else "guest"

    agent = build_agent(user, lang=lang)
    chat_history = load_history(user_id)
    input_messages = chat_history + [{"role": "user", "content": message}]

    def event_stream():
        full_answer = ""
        try:
            for chunk, _metadata in agent.stream(
                {"messages": input_messages},
                stream_mode="messages",
            ):
                if isinstance(chunk, AIMessageChunk) and chunk.content:
                    token = chunk.content
                    if isinstance(token, str):
                        full_answer += token
                        yield f'data: {json.dumps({"token": token})}\n\n'
                    elif isinstance(token, list):
                        for b in token:
                            if isinstance(b, str):
                                full_answer += b
                                yield f'data: {json.dumps({"token": b})}\n\n'
                            elif isinstance(b, dict) and b.get("text"):
                                text_val = b.get("text")
                                full_answer += text_val
                                yield f'data: {json.dumps({"token": text_val})}\n\n'
        except Exception as e:
            yield f'data: {json.dumps({"error": str(e)})}\n\n'
        finally:
            append_history(user.id, "user", message)
            if full_answer:
                append_history(user.id, "assistant", full_answer)
            yield "data: [DONE]\n\n"

    resp = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    resp["Cache-Control"] = "no-cache"
    resp["X-Accel-Buffering"] = "no"
    return resp


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_chat(request):
    """POST /api/chatbot/reset/ — clears this user's conversation memory."""
    clear_history(request.user.id)
    return Response({"message": "Conversation history cleared"})