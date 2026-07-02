from flask import Flask, jsonify, render_template, request

from study_buddy.buddy import StudyBuddy

app = Flask(__name__)
buddy = StudyBuddy()


@app.route("/")
def index() -> str:
    return render_template("index.html")


@app.route("/api/respond", methods=["POST"])
def api_respond() -> tuple[dict, int]:
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    topic = (data.get("topic") or "your topic").strip() or "your topic"

    if not message:
        return {"error": "Please enter a study message."}, 400

    session = buddy.respond(message, topic=topic)
    return {
        "message": session.message,
        "topic": session.topic,
        "sentiment": {
            "label": session.sentiment.label.value,
            "compound_score": session.sentiment.compound_score,
            "positive": session.sentiment.positive,
            "neutral": session.sentiment.neutral,
            "negative": session.sentiment.negative,
        },
        "response": {
            "tone": session.response.tone,
            "opening": session.response.opening,
            "guidance": session.response.guidance,
            "suggestion": session.response.suggestion,
        },
        "formatted": buddy.format_response(session),
    }, 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
