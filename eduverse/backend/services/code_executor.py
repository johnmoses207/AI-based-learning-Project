import sys
import io
import contextlib
import subprocess
import tempfile
import os

def execute_python(code: str):
    """
    Executes Python code safely (simulated).
    """
    output_buffer = io.StringIO()
    # Basic safe globals (same as before)
    safe_globals = {
        "__builtins__": {
            "print": print, "range": range, "len": len, "int": int, "float": float,
            "str": str, "list": list, "dict": dict, "set": set, "bool": bool,
            "sum": sum, "min": min, "max": max, "abs": abs, "enumerate": enumerate,
            "zip": zip, "map": map, "filter": filter, "sorted": sorted,
        }
    }
    
    try:
        with contextlib.redirect_stdout(output_buffer):
            exec(code, safe_globals)
        return {"passed": True, "output": output_buffer.getvalue().strip(), "error": None}
    except Exception as e:
        return {"passed": False, "output": output_buffer.getvalue(), "error": str(e)}

def execute_javascript(code: str):
    """
    Executes JavaScript code using Node.js subprocess.
    """
    try:
        # Write code to temp file
        with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode='w', encoding='utf-8') as f:
            f.write(code)
            temp_path = f.name

        # Run node
        result = subprocess.run(
            ["node", temp_path],
            capture_output=True,
            text=True,
            timeout=5 # 5s timeout
        )
        
        # Cleanup
        os.unlink(temp_path)
        
        if result.returncode == 0:
            return {"passed": True, "output": result.stdout.strip(), "error": None}
        else:
            return {"passed": False, "output": result.stdout, "error": result.stderr.strip()}
            
    except subprocess.TimeoutExpired:
        return {"passed": False, "output": "", "error": "Execution timed out (5s limit)"}
    except Exception as e:
        return {"passed": False, "output": "", "error": str(e)}

def execute_code(code: str, language: str = "python"):
    if language.lower() == "javascript" or language.lower() == "js":
        return execute_javascript(code)
    else:
        return execute_python(code)
