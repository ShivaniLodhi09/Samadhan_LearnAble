import streamlit as st
import plotly.express as px
import pandas as pd
import random

# Import your sentiment and response modules
from sentiment import detect_emotion
from response_engine import study_response

# ---------------- HEADER ----------------
st.markdown("""
    <div style='background: linear-gradient(to right, #a8c0ff, #3f2b96);
                padding: 20px; border-radius: 10px; text-align: center; color: white;'>
        <h1>Sentiment Aware Study Buddy</h1>
        <p>Learn smarter, with empathy.</p>
    </div>
""", unsafe_allow_html=True)

# ---------------- SIDEBAR ----------------
st.sidebar.title("Study Mode")
mode = st.sidebar.radio("Choose Mode", ["Practice", "Quiz", "Revision"])

st.sidebar.subheader("Emotion Trends")
# Example emotion data for chart
emotion_df = pd.DataFrame({
    "Session": [1, 2, 3, 4, 5],
    "Joy": [0.8, 0.6, 0.7, 0.9, 0.85],
    "Frustrated": [0.2, 0.4, 0.3, 0.1, 0.15],
    "Sadness": [0.1, 0.2, 0.15, 0.05, 0.1],
    "Confidence": [0.5, 0.6, 0.7, 0.8, 0.9]
})
fig = px.line(emotion_df, x="Session", y=["Joy","Frustrated","Sadness","Confidence"],
              labels={"value":"Confidence Score","variable":"Emotion"},
              title="Emotion Trends")
st.sidebar.plotly_chart(fig, use_container_width=True)

st.sidebar.subheader("Achievements")
st.sidebar.markdown("🏅 Resilient Learner")
st.sidebar.markdown("🔍 Curious Explorer")
st.sidebar.markdown("🔥 3-Day Streak")

dark_mode = st.sidebar.checkbox("Dark Mode")

# ---------------- CHAT INTERFACE ----------------
st.markdown("### 💬 Chat with Your Study Buddy")

user_input = st.text_input("Type your thoughts...")
if user_input:
    emotion, confidence = detect_emotion(user_input)
    response = study_response(user_input)

    # User bubble
    st.markdown(
        f"<div style='text-align:right; background:#f0f0f0; padding:10px; border-radius:10px;'>👩‍💻 {user_input}</div>",
        unsafe_allow_html=True
    )
    # Buddy bubble
    st.markdown(
        f"<div style='text-align:left; background:#e0f7fa; padding:10px; border-radius:10px;'>🤖 {response}<br><small>Detected: {emotion} ({confidence*100:.0f}%)</small></div>",
        unsafe_allow_html=True
    )

# ---------------- MOTIVATIONAL QUOTES ----------------
st.markdown("### 🌟 Motivational Quote")
quotes = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
    "Learning never exhausts the mind. – Leonardo da Vinci",
    "Mistakes are proof that you are trying."
]
st.info(random.choice(quotes))

# ---------------- GAMIFICATION ----------------
st.markdown("### 🏆 Progress & Streaks")
st.progress(12/15)  # Example: 12 out of 15 goals completed
st.markdown("🔥 5-Day Streak")

# ---------------- QUICK QUIZ ----------------
if st.button("Start Quick Quiz!"):
    st.write("Launching a mini challenge...")
    st.write("Q: What is 2 + 2?")
    st.write("Options: A) 3  B) 4  C) 5")
