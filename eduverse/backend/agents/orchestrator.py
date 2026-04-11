from agents.profiling_agent import profiling_agent      # Gemini
from agents.curriculum_agent import curriculum_agent    # Gemini
from agents.learn_agent import learn_agent              # DeepSeek


# =====================================================
# ONBOARDING ORCHESTRATOR
# Uses: Gemini
# Flow: Profiling → Curriculum / Roadmap
# =====================================================
async def orchestrator(student):
    # 1️⃣ Profiling Agent (Gemini)
    profile = await profiling_agent(student)

    # 2️⃣ Curriculum Agent (Gemini, depends on profile)
    curriculum = await curriculum_agent(profile)

    return {
        "profile": profile,
        "curriculum": curriculum
    }


# =====================================================
# LEARNING ORCHESTRATOR
# Uses: Gemini
# Flow: Topic → Learn Agent (Text + Video)
# Triggered ONLY when user clicks a topic
# =====================================================
async def activate_learn_agent(topic: str):
    # Learn Agent (Gemini)
    learning_content = await learn_agent(topic)

    return learning_content
