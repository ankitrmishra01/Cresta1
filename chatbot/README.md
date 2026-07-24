# chatbot/ — Cresta Conversational AI Module

This module is a **placeholder** for the Cresta conversational AI chatbot.
It is currently **unimplemented** and owned by whoever picks it up.

## Owner

**Team Member:** *(assign owner here)*

## Intended API Contract

### `POST /api/chatbot/query/`

**Authentication:** JWT Bearer token (same as other Cresta API endpoints)

**Request Body:**
```json
{
  "message": "Should I buy Reliance right now?",
  "context": {
    "ticker": "RELIANCE.NS",
    "session_id": "optional-conversation-id"
  }
}
```

**Response (200 OK):**
```json
{
  "response": "Based on current market analysis...",
  "sources": [
    {"type": "sentiment", "data": "..."},
    {"type": "prediction", "data": "..."}
  ],
  "session_id": "conversation-id-for-follow-ups"
}
```

**Response (501 Not Implemented):**
```json
{
  "error": "Chatbot module is not yet implemented",
  "status": "placeholder"
}
```

## Architecture (Proposed)

```
chatbot/
├── __init__.py    # Django app init
├── apps.py        # ChatbotConfig (Django AppConfig)
├── urls.py        # URL routing (POST /chatbot/query/)
├── views.py       # API view (currently returns 501)
└── README.md      # This file
```

## Integration Points

When implemented, this module should:
1. Import from `recommender.engine` and `recommender.ensemble_predictor`
   to ground responses in actual ML predictions
2. Use the same JWT authentication as `backend/advisor/`
3. Register as a Django app in `robo_advisor/settings.py`
4. Add URL routing in `robo_advisor/urls.py`

## TODO

- [ ] Choose LLM backend (OpenAI, Gemini, local model, etc.)
- [ ] Implement conversational flow with context retention
- [ ] Connect to recommender engine for grounded responses
- [ ] Add conversation history model to Django ORM
- [ ] Add rate limiting for chatbot endpoints
- [ ] Add frontend chat UI component
