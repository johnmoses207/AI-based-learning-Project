def mcp_response(agent, status, decision, confidence, data=None):
    """
    Standardize response format for all MCP agents.
    """
    return {
        "agent": agent,
        "status": status,
        "decision": decision,
        "confidence": confidence,
        "data": data or {}
    }
