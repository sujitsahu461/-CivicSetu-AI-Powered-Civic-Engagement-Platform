"""
CivicSetu - Project ZIP Generator & Distribution Server Script
Generates a clean, production-ready .zip archive of the CivicSetu codebase
excluding transient directories like node_modules, .git, __pycache__, etc.
"""

import os
import zipfile
import sys
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR
OUTPUT_ZIP = PROJECT_ROOT.parent / "CivicSetu_Codebase.zip"
ALT_ZIP = PROJECT_ROOT / "CivicSetu_Codebase.zip"

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__",
    ".pytest_cache",
    ".vscode",
    ".idea",
    "venv",
    ".venv",
    "env",
    ".env.local"
}

EXCLUDE_EXTS = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".zip"
}

def create_project_zip(output_path):
    print(f"Creating clean project archive at: {output_path}")
    count = 0
    total_bytes = 0
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for root, dirs, files in os.walk(PROJECT_ROOT):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in EXCLUDE_EXTS or file == "CivicSetu_Codebase.zip":
                    continue
                
                full_path = Path(root) / file
                rel_path = full_path.relative_to(PROJECT_ROOT)
                
                # Double check to prevent node_modules from sneaking in
                if any(part in EXCLUDE_DIRS for part in rel_path.parts):
                    continue
                
                try:
                    zf.write(full_path, arcname=str(rel_path))
                    count += 1
                    total_bytes += full_path.stat().st_size
                except Exception as e:
                    print(f"Warning: skipped {rel_path} ({e})")
                    
    zip_size_mb = output_path.stat().st_size / (1024 * 1024)
    raw_size_mb = total_bytes / (1024 * 1024)
    print(f"Successfully packaged {count} files.")
    print(f"Raw source size: {raw_size_mb:.2f} MB")
    print(f"Compressed archive size: {zip_size_mb:.2f} MB")
    return output_path

if __name__ == "__main__":
    target = ALT_ZIP
    create_project_zip(target)
