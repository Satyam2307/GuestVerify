# GuestVerify — AI Smart Home Gatekeeper

> **Ring Doorbell + Amazon Bedrock Agent** | Hackathon Track: Ring API / Ecosystem + AWS Builder

GuestVerify is an AI-powered gatekeeper for Ring smart home doorbells. When a doorbell event (motion or chime) occurs, GuestVerify captures the visitor's transcript, matches it against an active delivery/guest schedule, and uses **Amazon Bedrock (Claude 3.5 Haiku)** to decide whether to grant entry, issue an automated response, or raise a security alert.

---

## Features

- **Automated Screening** — Visitors are automatically evaluated against your active delivery & guest schedule
- **Context-Aware Decisions** — AI checks `deliveries.json` and only grants access to pre-authorized guests
- **Real-time Security Alerts** — Unannounced or suspicious visitors trigger immediate DENIED responses
- **Interactive Simulator** — Split-screen dashboard to simulate Ring events and observe live AI reasoning
- **Schedule Management** — Add/remove deliveries and guests directly from the dashboard

## Quick Start

### 1. Prerequisites

- Python 3.10+
- AWS credentials configured for Bedrock access

### 2. Install

```bash
pip install -r requirements.txt
```

### 3. Configure AWS

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### 4. Run

```bash
python app.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## API Endpoints

| Method   | Endpoint                              | Description                        |
| -------- | ------------------------------------- | ---------------------------------- |
| `POST`   | `/api/v1/ring-webhook`                | Receive Ring webhook events        |
| `GET`    | `/api/v1/deliveries`                  | Get active delivery/guest schedule |
| `POST`   | `/api/v1/deliveries`                  | Add a delivery or guest entry      |
| `DELETE` | `/api/v1/deliveries/{type}/{index}`   | Remove a schedule entry            |
| `GET`    | `/api/v1/events`                      | Get in-memory event log            |

### Webhook Payload

```json
{
  "device_id": "front_door_camera",
  "event_type": "ding",
  "transcript": "Hi, dropping off an Amazon package for John",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Response

```json
{
  "status": "success",
  "event_id": "uuid",
  "processed_at": "2024-01-15T10:30:01Z",
  "decision": "GRANTED",
  "reason": "Amazon delivery matches active delivery for John",
  "action": "unlock_porch_box"
}
```

---

## Architecture

```
┌──────────────────────────────────────────┐
│        Frontend Dashboard (SPA)          │
│  Simulator Controls + Live AI Terminal   │
└──────────────────┬───────────────────────┘
                   │ POST /api/v1/ring-webhook
                   ▼
┌──────────────────────────────────────────┐
│          FastAPI Server (app.py)          │
└────────┬─────────────────────┬───────────┘
         │                     │
         ▼                     ▼
┌─────────────────┐  ┌─────────────────────┐
│ deliveries.json │  │  Amazon Bedrock SDK  │
│ (Guest Records) │  │ (Claude 3.5 Haiku)  │
└─────────────────┘  └────────┬────────────┘
                              ▼
                   ┌────────────────────┐
                   │ AI Decision:       │
                   │ GRANTED / DENIED   │
                   └────────────────────┘
```

## Tech Stack

- **Backend:** Python 3.10+ / FastAPI / Uvicorn
- **AI Engine:** AWS Bedrock (Claude 3.5 Haiku)
- **Frontend:** HTML5 + TailwindCSS + Vanilla JS
- **Data Store:** Local JSON (`deliveries.json`)

## License

MIT License — Open Source
