# Sentiment Aware Study Buddy

A Python app that detects how a learner feels from their message and adapts study guidance accordingly.

## Features

- **Sentiment detection** - Uses VADER to classify messages as positive, neutral, or negative.
- **Adaptive responses** - Adjusts tone and suggestions based on detected sentiment:
  - **Negative** → supportive, break tasks into smaller steps
  - **Neutral** → clear, structured guidance
  - **Positive** → encouraging, challenge-oriented suggestions

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

## Usage

**Interactive mode:**

```bash
python main.py --topic "calculus"
```

**Single message:**

```bash
python main.py -m "I'm so frustrated, I can't understand derivatives" -t "calculus"
```

**Web dashboard:**

```bash
pip install -r requirements.txt
python dashboard.py
```

Then open `http://127.0.0.1:5000/` in your browser.

## Project structure

```
study_buddy/
├── sentiment/detector.py   # VADER-based sentiment analysis
├── responses/adapter.py    # Sentiment → study strategy mapping
└── buddy.py                # Main orchestrator
main.py                     # CLI entry point
```

## Example

```
You: I'm so frustrated, I can't understand derivatives

Buddy:
Detected sentiment: negative (score: -0.62)
Tone: supportive

It sounds like this topic is wearing on you - that's completely normal when learning something new.

Let's break calculus into smaller steps. Focus on one concept at a time instead of trying to master everything at once.

Next step: Try a 10-minute review session, then take a short break. Come back and explain the idea out loud in your own words.
```
