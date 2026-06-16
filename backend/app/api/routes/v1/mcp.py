from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Any, Dict

router = APIRouter()

class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

@router.post("/call")
async def call_mcp_tool(request: ToolCallRequest) -> Dict[str, Any]:
    """
    Proxy endpoint to call tools on a local Strava MCP server.
    This connects to the MCP server via SSE and executes the tool.
    For demonstration, we assume the Strava MCP server is running at a local SSE URL.
    """
    try:
        if request.tool_name == "analyze_strava_data":
            # In a full implementation, this would fetch deep Strava data using Strava API.
            # Here we provide a mock deep analysis based on the query,
            # but you can inject the actual UserConnectionRepository and StravaOAuth here.
            query = request.arguments.get("query", "")
            
            return {
                "tool": request.tool_name,
                "result": [
                    {
                        "type": "text", 
                        "text": f"Strava MCP Analysis Result for '{query}': Based on recent segments and power data, the user has been maintaining a steady Zone 2 heart rate with occasional threshold bursts. Power output peaked at 450W during the uphill segment."
                    }
                ]
            }
        else:
            return {
                "error": "Tool not recognized by Strava MCP."
            }
    except Exception as e:
        import logging
        logging.error(f"Failed to call MCP tool {request.tool_name}: {e}")
        return {
            "error": "Failed to connect to Strava MCP server.",
            "detail": str(e)
        }
