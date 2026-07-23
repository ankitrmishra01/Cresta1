"""
CRESTA chatbot agent construction.

Dev: Groq LLaMA 3.1 70B (free, fast). Prod: swap to Gemini 1.5 Flash
(see PRODUCTION SWAP comment below) — no other code changes needed.

Uses LangChain v1's `create_agent` (the old `create_tool_calling_agent`
+ `AgentExecutor` pair from 0.x was removed in LangChain 1.0 — the
`pip install langchain` you ran pulled the new version, hence the
ImportError). The new API is graph-based (built on LangGraph under the
hood) but the interface is actually simpler: pass the model, tools, and
a system_prompt string, then `.invoke({"messages": [...]})`.

Conversation history uses Django's cache framework (not a hard Redis
dependency). It works today with LocMem, and if you later set
CACHES["default"] to django-redis in settings.py, this same code
automatically persists history across workers with zero changes here.
"""
from django.core.cache import cache
from langchain.agents import create_agent
from langchain_groq import ChatGroq

from .tools import build_tools
from .prompts import get_system_prompt

HISTORY_TTL = 86400  # 24h, mirrors the blueprint's Redis TTL
MAX_TURNS = 10        # keep last 10 user+assistant turns


def _history_key(user_id) -> str:
    return f"chatbot:history:{user_id}"


def load_history(user_id):
    """Return chat history as plain {"role", "content"} dicts, which is
    what create_agent's `messages` state expects."""
    raw = cache.get(_history_key(user_id), [])
    return [{"role": t["role"], "content": t["content"]} for t in raw[-(MAX_TURNS * 2):]]


def append_history(user_id, role: str, content: str):
    raw = cache.get(_history_key(user_id), [])
    raw.append({"role": role, "content": content})
    cache.set(_history_key(user_id), raw[-(MAX_TURNS * 2):], timeout=HISTORY_TTL)


def clear_history(user_id):
    cache.delete(_history_key(user_id))


def build_agent(user, lang: str = "en"):
    # llama-3.1-8b-instant is fast, supports tool calling on Groq natively,
    # and streams text instantly.
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1)

    # PRODUCTION SWAP:
    # from langchain_google_genai import ChatGoogleGenerativeAI
    # llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)

    tools = build_tools(user)
    return create_agent(llm, tools=tools, system_prompt=get_system_prompt(lang))