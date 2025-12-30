import httpx
from typing import Optional

OLLAMA_URL = "http://localhost:11434/api/generate"

async def analyze_code(code: str, language: str) -> str:
        
    prompt = f"""You are an expert code reviewer and a creative problem solver with a deep understanding of {language} development. Your task is to analyze the following code and provide:

1. A detailed breakdown of any bugs or errors, including their root causes and potential fixes.
2. Identification of security vulnerabilities, with recommendations for mitigation.
3. Suggestions for improving performance, with explanations of why these changes are beneficial.
4. Insights into code style and adherence to best practices, with examples of how to improve readability and maintainability.
5. Creative ideas for enhancing the functionality or design of the code, where applicable.

Be thorough, professional, and imaginative in your feedback. Provide line-by-line analysis where relevant, and ensure your suggestions are actionable and well-explained.

Code to analyze:
```{language}
{code}
```

Provide your comprehensive analysis:"""

    try:
        async with httpx.AsyncClient(timeout=900.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": "codellama",
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "No analysis generated for the given code.")
    except httpx.TimeoutException:
        return "Error: Analysis timed out . Please try again."
    except Exception as e:
        return f"Error analyzing code: {str(e)}"