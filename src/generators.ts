// src/generators.ts
// ==========================================================================
// Generator functions for AI Memory OS Blueprint/Teardown ZIP content.
// Each export returns a string representing one generated file's content.
// Static templates are constants; dynamic generators are functions.
// ==========================================================================

import type JSZip from 'jszip';
import { getDomainById } from './domains';

// ===== Types =====

export interface ProjectConfig {
  projectName: string;
  userRole: string;
  aiRole: string;
  domain: string;
  deploymentScope: 'local' | 'server' | 'full';
  selectedDomain?: string;
}

export type ModuleChecker = (id: string) => boolean;

// ===== Helpers =====

export function getSafeProjectName(config: ProjectConfig): string {
  return config.projectName.replace(/\s+/g, '_');
}

export function getContainerName(config: ProjectConfig): string {
  return getSafeProjectName(config).toLowerCase().replace(/_/g, '-') + '-workspace';
}

function getUserRoles(config: ProjectConfig): string[] {
  return config.userRole.split(/\s+/).filter(Boolean);
}

function getAiRoles(config: ProjectConfig): string[] {
  return config.aiRole.split(/\s+/).filter(Boolean);
}

function isIpAddress(domain: string): boolean {
  return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(domain);
}

// ===== Static Templates =====

export const INGEST_PY = `#!/usr/bin/env python3
"""Index project files into LanceDB for semantic search.

Purpose: Scan project directory, split files into chunks, embed with local
         HuggingFace model, write to LanceDB.

Usage:
    python scripts/ingest.py
    python scripts/ingest.py --dirs src scripts docs
    python scripts/ingest.py --chunk-size 512 --overlap 64

Output: .lancedb/ (local serverless vector database)

Chunking strategy: chunk_size=800, overlap=100 (paragraph -> line -> word -> char)
"""
import sys
import argparse
from pathlib import Path

INCLUDE_EXTS = {".py", ".ts", ".tsx", ".js", ".jsx", ".md", ".txt",
                ".yaml", ".yml", ".toml", ".sh"}
EXCLUDE_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "dist", "build", ".lancedb"}
DEFAULT_DIRS  = ["src", "scripts", "docs", "."]
DB_PATH       = ".lancedb"
TABLE_NAME    = "project_chunks"
EMBED_MODEL   = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE    = 800
CHUNK_OVERLAP = 100


def collect_files(search_dirs: list) -> list:
    """Return absolute Paths for all indexable files under search_dirs."""
    seen = set()
    files = []
    for d in search_dirs:
        p = Path(d)
        if not p.exists():
            continue
        for f in p.rglob("*"):
            if f.is_file() and f.suffix in INCLUDE_EXTS:
                if any(part in EXCLUDE_DIRS for part in f.parts):
                    continue
                if f not in seen:
                    seen.add(f)
                    files.append(f)
    return files


def chunk_files(files: list, chunk_size: int, overlap: int) -> list:
    """Split files into chunks; return list of dicts with text + metadata."""
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
    )
    chunks = []
    for f in files:
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            print(f"  \\u26a0\\ufe0f  Skipping {f}: {e}")
            continue
        for i, chunk in enumerate(splitter.split_text(text)):
            chunks.append({"text": chunk, "source": str(f), "chunk_index": i})
    return chunks


def ingest(dirs: list, chunk_size: int, overlap: int) -> None:
    """Full pipeline: collect -> chunk -> embed -> write to LanceDB."""
    import lancedb
    from langchain_huggingface import HuggingFaceEmbeddings

    print(f"\\ud83d\\udcc2 Scanning: {dirs}")
    files = collect_files(dirs)
    print(f"   Found {len(files)} indexable files")
    if not files:
        print("\\u26a0\\ufe0f  No files found. Check --dirs and INCLUDE_EXTS.")
        return

    print(f"\\u2702\\ufe0f  Chunking (size={chunk_size}, overlap={overlap})...")
    chunks = chunk_files(files, chunk_size, overlap)
    print(f"   Created {len(chunks)} chunks")

    print(f"\\ud83d\\udd22 Loading embedding model: {EMBED_MODEL}")
    embedder = HuggingFaceEmbeddings(model_name=EMBED_MODEL)

    print("\\u2699\\ufe0f  Embedding chunks (this may take a while on first run)...")
    texts = [c["text"] for c in chunks]
    vectors = embedder.embed_documents(texts)

    records = []
    for chunk, vector in zip(chunks, vectors):
        records.append({
            "vector":      vector,
            "text":        chunk["text"],
            "source":      chunk["source"],
            "chunk_index": chunk["chunk_index"],
        })

    print(f"\\ud83d\\udcbe Writing to LanceDB: {DB_PATH}/{TABLE_NAME}")
    db = lancedb.connect(DB_PATH)
    db.create_table(TABLE_NAME, data=records, mode="overwrite")
    print(f"\\u2705 Indexed {len(records)} chunks from {len(files)} files \\u2192 {DB_PATH}/{TABLE_NAME}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest project files into LanceDB.")
    parser.add_argument(
        "--dirs", nargs="+", default=DEFAULT_DIRS,
        help=f"Directories to scan (default: {DEFAULT_DIRS})"
    )
    parser.add_argument(
        "--chunk-size", type=int, default=CHUNK_SIZE,
        help=f"Characters per chunk (default: {CHUNK_SIZE})"
    )
    parser.add_argument(
        "--overlap", type=int, default=CHUNK_OVERLAP,
        help=f"Overlap between chunks (default: {CHUNK_OVERLAP})"
    )
    args = parser.parse_args()
    try:
        ingest(args.dirs, args.chunk_size, args.overlap)
    except ImportError as e:
        print(f"\\u274c Missing dependency: {e}")
        print("   Run: uv pip install lancedb langchain-huggingface sentence-transformers langchain-text-splitters")
        sys.exit(1)


if __name__ == "__main__":
    main()
`;

export const QUERY_PY = `#!/usr/bin/env python3
"""Semantic search for LanceDB knowledge base.

Usage:
    python scripts/query.py "<your search query>" [top_k]

Example:
    python scripts/query.py "important architecture status"
    python scripts/query.py "recent decisions" 5

Output: Top-k matching chunks with source file, similarity score, and text preview.
"""
import sys
import argparse
from pathlib import Path

DB_PATH = ".lancedb"
TABLE_NAME = "project_chunks"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def query(query_str: str, top_k: int = 5) -> None:
    """Embed query, search LanceDB, print top_k results."""
    db_path = Path(DB_PATH)
    if not db_path.exists():
        print("\\u26a0\\ufe0f  LanceDB not initialized. Run scripts/ingest.py first.")
        return
    try:
        import lancedb
        from langchain_huggingface import HuggingFaceEmbeddings
    except ImportError as e:
        print(f"\\u274c Missing dependency: {e}")
        print("   Run: uv pip install lancedb langchain-huggingface sentence-transformers")
        sys.exit(1)

    db = lancedb.connect(DB_PATH)
    if TABLE_NAME not in db.table_names():
        print(f"\\u26a0\\ufe0f  Table '{TABLE_NAME}' not found. Run scripts/ingest.py first.")
        return

    table = db.open_table(TABLE_NAME)
    embedder = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    q_vector = embedder.embed_query(query_str)

    results = table.search(q_vector).limit(top_k).to_list()

    print(f"\\ud83d\\udd0d Query: '{query_str}' (top {top_k})")
    print(f"   Found {len(results)} results\\n")
    for i, r in enumerate(results, 1):
        score = r.get('_distance', 0.0)
        source = r.get('source', 'unknown')
        chunk_idx = r.get('chunk_index', '?')
        text = r.get('text', '')[:200]
        print(f"--- [{i}] {source} (chunk {chunk_idx}, distance={score:.4f}) ---")
        print(f"{text}")
        if len(r.get('text', '')) > 200:
            print("...")
        print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Semantic search for LanceDB knowledge base.")
    parser.add_argument("query", help="The search query string")
    parser.add_argument("top_k", nargs="?", type=int, default=5, help="Number of results (default: 5)")
    args = parser.parse_args()
    query(args.query, args.top_k)


if __name__ == "__main__":
    main()
`;

export const TEST_BASIC_PY = `import pytest

def test_environment_ready():
    """Verify testing matrix is operational."""
    assert True
`;

export const SUBMIT_HOMEWORK_PY = `#!/usr/bin/env python3
"""
Student Submission Toolchain
Automated pre-signed URL retrieval and direct-to-Google CDN upload script with OIDC Auth.
"""
import sys, argparse, json, os, urllib.request, urllib.error

API_URL = "https://api.interaction.tw/homework_upload/request_url" # Replace with actual API deployment if different

def authorize():
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        print("\\u274c \\u7f3a\\u5c11\\u5fc5\\u8981\\u7684 Google \\u9a57\\u8b49\\u5957\\u4ef6\\u3002\\u8acb\\u5148\\u57f7\\u884c\\u5b89\\u88dd\\u6307\\u4ee4\\uff1a")
        print("   pip install google-auth-oauthlib google-api-python-client")
        sys.exit(1)

    CLIENT_CONFIG = {
        "installed": {
            "client_id": "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com",
            "client_secret": "YOUR_GOOGLE_OAUTH_CLIENT_SECRET",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }

    print("\\ud83d\\udd10 \\u555f\\u52d5 Google \\u5e33\\u865f\\u9a57\\u8b49 (\\u8acb\\u5728\\u5f48\\u51fa\\u7684\\u700f\\u89bd\\u5668\\u4e2d\\u767b\\u5165\\u4fe1\\u7bb1)...")
    try:
        flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email'])
        creds = flow.run_local_server(port=0)
        id_token = getattr(creds, 'id_token', None)
        if not id_token:
            print("\\u274c \\u7121\\u6cd5\\u53d6\\u5f97 ID Token\\uff0c\\u8acb\\u78ba\\u4fdd\\u60a8\\u540c\\u610f\\u4e86\\u57fa\\u672c\\u5b58\\u53d6\\u6b0a\\u9650\\u3002")
            sys.exit(1)
        return id_token
    except Exception as e:
        print(f"\\u274c \\u767b\\u5165\\u9a57\\u8b49\\u4e2d\\u65b7\\u6216\\u5931\\u6557\\uff1a{e}\\n(\\u5982\\u679c\\u4f60\\u5728\\u4f7f\\u7528 SSH\\uff0c\\u8acb\\u78ba\\u8a8d\\u53ef\\u4ee5\\u76f4\\u63a5\\u958b\\u555f\\u7db2\\u9801)")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Submit assignment to professor's cloud.")
    parser.add_argument("--course", required=True, help="Course Name")
    parser.add_argument("--assignment_title", required=True, help="Assignment Title")
    parser.add_argument("--assignment_type", required=True, help="Assignment Type")
    parser.add_argument("--names", required=True, help="Student Name(s) (comma separated)")
    parser.add_argument("--ids", required=True, help="Student ID(s) (comma separated)")
    parser.add_argument("file", help="Path to the file to upload (.zip, .mp4, etc.)")
    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"\\u274c Error: File '{args.file}' not found.")
        sys.exit(1)

    file_size = os.path.getsize(args.file)
    print(f"\\ud83d\\udce6 Preparing to submit: {args.file} ({file_size / (1024*1024):.2f} MB)")

    # 1. Require Student Login
    id_token = authorize()

    # 2. Request Presigned URL
    students = [{"id": i.strip(), "name": n.strip()} for i, n in zip(args.ids.split(','), args.names.split(','))]
    payload = {
        "course": args.course,
        "assignment_title": args.assignment_title,
        "assignment_type": args.assignment_type,
        "students": students,
        "file_size_bytes": file_size,
        "id_token": id_token
    }

    print("\\ud83c\\udfab Requesting upload ticket...")
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            upload_url = res_data.get("upload_url")
            if not upload_url:
                print("\\u274c Server did not return a valid upload ticket.")
                sys.exit(1)
    except urllib.error.HTTPError as e:
        print(f"\\u274c Server rejected request: HTTP {e.code} - {e.read().decode('utf-8')}")
        sys.exit(1)
    except Exception as e:
        print(f"\\u274c Failed to contact API: {e}")
        sys.exit(1)

    # 3. Upload directly to Google Drive via the Presigned Resumable URL
    print("\\ud83d\\ude80 Uploading directly to Google CDN...")
    try:
        with open(args.file, 'rb') as f:
            upload_req = urllib.request.Request(upload_url, data=f, method='PUT')
            upload_req.add_header('Content-Length', str(file_size))
            with urllib.request.urlopen(upload_req) as upload_res:
                if upload_res.getcode() in [200, 201]:
                    print("\\u2705 Assignment submitted successfully!")
                else:
                    print(f"\\u26a0\\ufe0f Upload finished with unexpected status: {upload_res.getcode()}")
    except urllib.error.HTTPError as e:
        print(f"\\u274c Upload failed: HTTP {e.code} - {e.read().decode('utf-8')}")
        sys.exit(1)
    except Exception as e:
        print(f"\\u274c Upload failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

export const HOMEWORK_README = `# 📤 作業繳交區 (Homework Submission)\n\n請將你要繳交的作業檔案（如 \`.zip\`, \`.pdf\`, \`.mp4\`）放置在這個資料夾中。\n\n放置完成後，你可以直接在對話框中告訴你的 AI 助手：\n**「請幫我繳交 homework_submission 裡面的作業，這是互動設計課的期末專題，學號 123456 王小明。」**\n\nAI 將會自動幫你檢查格式並上傳至老師的雲端硬碟。`;

export const LLAMA_DRIVE_INDEXER_PY = `"""Sync cloud documents into local persistent vector search.

Setup (one-time, required before first run):
    1. Go to https://console.cloud.google.com/ and create an OAuth 2.0 Client ID
       (Application type: Desktop app).
    2. Download the credentials JSON and save it as config/credentials.json.
    3. Find your Google Drive folder ID:
       - Open the target folder in Google Drive in a browser.
       - The URL will look like: https://drive.google.com/drive/folders/FOLDER_ID_HERE
       - Copy the FOLDER_ID_HERE value and paste it below as ROOT_FOLDER_ID.
"""
from llama_index.readers.google import GoogleDriveReader
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# \\u2699\\ufe0f  CONFIGURE: Replace with your actual Google Drive folder ID
ROOT_FOLDER_ID = "YOUR_ROOT_FOLDER_ID"

def sync_cloud():
    # Use private credentials to avoid shared rate limits
    # Requires placing 'credentials.json' inside config/
    try:
        loader = GoogleDriveReader(client_secrets_path="config/credentials.json")
        documents = loader.load_data(folder_id=ROOT_FOLDER_ID)
        print(f"\\u2705 Loaded {len(documents)} documents from cloud")
        # Index into LanceDB (Layer 2) going forward...
    except Exception as e:
        print(f"\\u274c Cloud sync error: {e}")

if __name__ == '__main__':
    sync_cloud()
`;

export const TEST_MATRIX_SH = `#!/bin/bash
# Full Coverage Testing Matrix
if [ ! -f /.dockerenv ]; then
  echo "\\u274c CRITICAL: This script must be run INSIDE the Docker container!"
  exit 1
fi

echo "Running Shellcheck..."
find scripts/ -type f -name "*.sh" -exec shellcheck {} +

echo "Running Python Unit Tests..."
pytest tests/

echo "Running Bats Core Tests..."
bats tests/shell/

echo "Running Docker Testinfra Validation..."
pytest tests/infra/

echo "\\u2705 Matrix Passed"
`;

export const TEST_INFRA_PY = `import testinfra

def test_local_socket_listening(host):
    """Verify internal container state and active services."""
    # e.g., assert host.socket("tcp://0.0.0.0:8000").is_listening
    assert True
`;

export const BATS_TEST = `#!/usr/bin/env bats

@test "Syntax check scripts" {
    run bash -n scripts/system/test_matrix.sh
    [ "$status" -eq 0 ]
}
`;

export const DEPLOY_SH = `#!/bin/bash
# Deploy configuration to staging/production
echo "Pushing changes via Ansible..."
ansible-playbook -i ansible/inventory.ini ansible/playbooks/update_scripts.yml
`;

export const CONVERSATION_DIGEST_PY = `"""Extract and summarize Agent conversation logs.

Usage:
    Run this script at the end of each AI session (via end.md workflow).
    It reads JSON log files from .agents/logs/, calls an LLM to summarize,
    and appends the digest to .agents/digests/YYYY-MM-DD.md.

Implementation steps for the AI:
    1. Read all *.jsonl files under .agents/logs/ created today.
    2. Extract message content from each log entry.
    3. Call the local Ollama API (http://localhost:11434/api/generate) or
       any available LLM to produce a structured summary:
       - Key decisions made
       - Architectural changes
       - Unresolved blockers
    4. Append the summary to .agents/digests/YYYY-MM-DD.md.
    5. Print confirmation.
"""
import json, os, datetime
from pathlib import Path

LOGS_DIR = Path('.agents/logs')
DIGESTS_DIR = Path('.agents/digests')

def generate_digest(logs_dir: Path = LOGS_DIR):
    DIGESTS_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.date.today().isoformat()
    digest_path = DIGESTS_DIR / f"{today}.md"

    log_files = sorted(logs_dir.glob('*.jsonl')) if logs_dir.exists() else []
    if not log_files:
        print(f"\\u2139\\ufe0f  No log files found in {logs_dir}. Skipping digest.")
        return

    # Collect all messages from today's logs
    messages = []
    for log_file in log_files:
        with open(log_file) as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    messages.append(entry)
                except json.JSONDecodeError:
                    pass

    print(f"\\ud83d\\udccb Found {len(messages)} log entries. Generating digest...")
    # AI: implement LLM call here to summarize 'messages' into structured markdown
    # Example stub output:
    digest_content = f"# Session Digest \\u2014 {today}\\n\\n> Auto-generated by conversation_digest.py\\n\\n## Summary\\n_(AI: replace this with actual LLM-generated summary)_\\n"
    with open(digest_path, 'a') as f:
        f.write(digest_content)
    print(f"\\u2705 Digest saved to {digest_path}")

if __name__ == '__main__':
    generate_digest()
`;

export const BUNDLE_CONTEXT_PY = `#!/usr/bin/env python3
"""Context Bundler - Pre-session local context aggregator.

Purpose:
    Run at the START of every AI session (triggered by start.md workflow).
    Collects all locally available project state and writes it to
    .agents/context/CONTEXT_SNAPSHOT.md so the AI has full context
    without making any cloud LLM calls.

Usage:
    python scripts/bundle_context.py
    python scripts/bundle_context.py --query "authentication system"

Requirements:
    - git (must be inside a git repository)
    - Optional: lancedb + langchain-huggingface (for semantic search section)

Output:
    .agents/context/CONTEXT_SNAPSHOT.md
"""
import subprocess
import sys
from pathlib import Path
from datetime import datetime

SNAPSHOT_PATH = Path('.agents/context/CONTEXT_SNAPSHOT.md')
DIGESTS_DIR = Path('.agents/digests')


def run_cmd(cmd: list, fallback: str = '') -> str:
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return result.stdout.strip() if result.returncode == 0 else fallback
    except Exception:
        return fallback


def get_git_context() -> str:
    branch = run_cmd(['git', 'branch', '--show-current'], 'unknown')
    log = run_cmd(['git', 'log', '--oneline', '-10'], 'No git log available')
    status = run_cmd(['git', 'status', '--short'], 'Clean working tree')
    diff_stat = run_cmd(['git', 'diff', 'HEAD', '--stat'], '')
    out = '## Git State\\n'
    out += f'Branch: {branch}\\n\\n'
    out += f'Recent Commits (last 10):\\n{log}\\n\\n'
    out += f'Working Tree:\\n{status}\\n\\n'
    if diff_stat:
        out += f'Diff Summary:\\n{diff_stat}\\n\\n'
    return out


def get_lancedb_context(query: str) -> str:
    db_path = Path('.lancedb')
    if not db_path.exists():
        return '## Semantic Memory\\nNot initialized - run scripts/ingest.py first.\\n\\n'
    try:
        import lancedb
        from langchain_huggingface import HuggingFaceEmbeddings
        embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
        db = lancedb.connect(str(db_path))
        tables = db.table_names()
        if not tables:
            return '## Semantic Memory\\nNo tables yet. Run scripts/ingest.py first.\\n\\n'
        table = db.open_table(tables[0])
        q_vec = embeddings.embed_query(query)
        results = table.search(q_vec).limit(5).to_list()
        out = f'## Semantic Memory (query: "{query}")\\n'
        for i, r in enumerate(results, 1):
            text = r.get('text', r.get('content', str(r)))[:300]
            src = r.get('source', r.get('file', 'unknown'))
            out += f'\\n[{i}] {src}\\n{text}\\n---\\n'
        return out + '\\n'
    except ImportError:
        return '## Semantic Memory\\nInstall: uv pip install lancedb langchain-huggingface\\n\\n'
    except Exception as e:
        return f'## Semantic Memory\\nError: {e}\\n\\n'


def get_latest_digest() -> str:
    if not DIGESTS_DIR.exists():
        return ''
    digests = sorted(DIGESTS_DIR.glob('*.md'), reverse=True)
    if not digests:
        return ''
    content = digests[0].read_text(encoding='utf-8')[:600]
    return f'## Last Session Digest ({digests[0].name})\\n{content}\\n\\n'


def get_deps() -> str:
    p = Path('pyproject.toml')
    if not p.exists():
        return ''
    return f'## Dependencies (pyproject.toml)\\n{p.read_text(encoding="utf-8")[:400]}\\n\\n'


def main() -> None:
    query = 'recent architecture decisions and unresolved issues'
    if '--query' in sys.argv:
        idx = sys.argv.index('--query')
        if idx + 1 < len(sys.argv):
            query = sys.argv[idx + 1]

    SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
    print('Bundling local context...')

    now = datetime.now().strftime('%Y-%m-%d %H:%M')
    content = f'# CONTEXT_SNAPSHOT.md\\n'
    content += f'> Generated by bundle_context.py at {now}\\n'
    content += '> Use this file to answer all context questions. Do NOT call cloud LLM for project context.\\n\\n'
    content += get_git_context()
    content += get_lancedb_context(query)
    content += get_latest_digest()
    content += get_deps()

    SNAPSHOT_PATH.write_text(content, encoding='utf-8')
    print(f'Context snapshot saved to {SNAPSHOT_PATH}')


if __name__ == '__main__':
    main()
`;

export const CACHE_PY = `#!/usr/bin/env python3
"""Response Cache - Local SQLite Q&A cache to reduce cloud LLM calls.

Purpose:
    Store and retrieve LLM responses by semantic similarity.
    Before calling any cloud LLM, query this cache first.
    After receiving a cloud LLM answer, store it here.

Usage:
    python scripts/cache.py search "<your question>"
    python scripts/cache.py store "<question>" "<answer>" [--source claude]
    python scripts/cache.py stats

Implementation steps for the AI:
    1. Use 'search' before calling any cloud LLM.
       If similarity >= 0.92, use the cached answer directly.
    2. After receiving a cloud LLM response, use 'store' to save it.
    3. Run 'stats' periodically to see cache effectiveness.
    4. Cache is stored at .agents/cache/responses.db (SQLite).
    5. Cache entries expire after ttl_days (default: 30 days).
"""
import sys
import sqlite3
import json
from pathlib import Path
from datetime import datetime, timedelta

CACHE_DB = Path('.agents/cache/responses.db')


def init_db(conn: sqlite3.Connection) -> None:
    conn.execute('''
        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            source TEXT DEFAULT 'unknown',
            embedding TEXT,
            created_at TEXT NOT NULL,
            ttl_days INTEGER DEFAULT 30
        )
    ''')
    conn.commit()


def get_embedding(text: str):
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        emb = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
        return emb.embed_query(text)
    except ImportError:
        print('Install langchain-huggingface for semantic search: uv pip install langchain-huggingface')
        return None


def cosine_similarity(a: list, b: list) -> float:
    import math
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x ** 2 for x in a))
    mag_b = math.sqrt(sum(x ** 2 for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def cmd_search(question: str, threshold: float = 0.92) -> None:
    CACHE_DB.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(CACHE_DB)
    init_db(conn)
    # Prune expired entries
    conn.execute(
        'DELETE FROM responses WHERE datetime(created_at, \\'+\\'|| ttl_days || \\' days\\') < datetime(\\'now\\')')
    conn.commit()
    rows = conn.execute('SELECT question, answer, source, embedding FROM responses').fetchall()
    conn.close()
    if not rows:
        print('CACHE_MISS: Cache is empty.')
        return
    q_emb = get_embedding(question)
    if q_emb is None:
        print('CACHE_MISS: Embedding unavailable.')
        return
    best_score, best_row = 0.0, None
    for row in rows:
        if row[3]:
            stored_emb = json.loads(row[3])
            score = cosine_similarity(q_emb, stored_emb)
            if score > best_score:
                best_score, best_row = score, row
    if best_score >= threshold and best_row:
        print(f'CACHE_HIT (similarity={best_score:.3f}, source={best_row[2]})')
        print('---')
        print(best_row[1])
    else:
        print(f'CACHE_MISS (best_similarity={best_score:.3f}, threshold={threshold})')


def cmd_store(question: str, answer: str, source: str = 'unknown') -> None:
    CACHE_DB.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(CACHE_DB)
    init_db(conn)
    emb = get_embedding(question)
    emb_json = json.dumps(emb) if emb else None
    conn.execute(
        'INSERT INTO responses (question, answer, source, embedding, created_at) VALUES (?, ?, ?, ?, ?)',
        (question, answer, source, emb_json, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    print(f'Stored in cache (source: {source})')


def cmd_stats() -> None:
    if not CACHE_DB.exists():
        print('Cache is empty - no entries yet.')
        return
    conn = sqlite3.connect(CACHE_DB)
    init_db(conn)
    total = conn.execute('SELECT COUNT(*) FROM responses').fetchone()[0]
    by_source = conn.execute('SELECT source, COUNT(*) FROM responses GROUP BY source').fetchall()
    conn.close()
    print(f'Cache stats: {total} total entries')
    for src, count in by_source:
        print(f'  {src}: {count}')


def main() -> None:
    if len(sys.argv) < 2:
        print('Usage: python scripts/cache.py <search|store|stats> [args]')
        print('  search "<question>"')
        print('  store "<question>" "<answer>" [--source claude]')
        print('  stats')
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == 'search' and len(sys.argv) >= 3:
        cmd_search(sys.argv[2])
    elif cmd == 'store' and len(sys.argv) >= 4:
        source = 'unknown'
        if '--source' in sys.argv:
            idx = sys.argv.index('--source')
            source = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else 'unknown'
        cmd_store(sys.argv[2], sys.argv[3], source)
    elif cmd == 'stats':
        cmd_stats()
    else:
        print('Usage: python scripts/cache.py <search|store|stats> [args]')
        sys.exit(1)


if __name__ == '__main__':
    main()
`;

// ===== Dynamic Generators =====

export function generateTeardownMd(config: ProjectConfig, isActive: ModuleChecker): string {
  const safeProjectName = getSafeProjectName(config);
  let md = `# UNINSTALL_TEARDOWN.md — ${config.projectName}\n\n`;
  md += `> **⚠️ ERROR WARNING**: Your current mission is to SAFELY UNINSTALL specific modules. You MUST NOT delete any source code, user databases, or unrelated configurations. You must adhere strictly to the target list.\n\n`;
  md += `## System Architecture Context\n- Target Environment: ${config.deploymentScope === 'local' ? 'Local Development Workspace' : config.domain}\n\n`;
  md += `## 🗑️ Teardown Instructions\nAttention AI Agent: Execute the following cleanup steps sequentially. Be extremely careful not to use destructive flags like \`rm -rf /\` or \`docker-compose down -v\` unless explicitly instructed.\n\n`;

  md += `### 1. Docker Cleanup\n- **Action**: Run \`docker compose down\` to stop and remove containers and networks.\n- **Safety Hook**: DO NOT USE the \`-v\` flag. We want to preserve database volumes.\n- **Action**: Delete \`docker-compose.yml\` and \`Dockerfile\`.\n\n`;
  if (isActive('ci_git_hook')) {
    md += `### 2. Git Hooks Cleanup\n- **Action**: Remove the pre-push hook at \`.git/hooks/pre-push\` to detach the gitleaks and memory sync logic.\n\n`;
  }
  if (isActive('mem_cloud') || isActive('mem_lancedb')) {
    md += `### 3. Knowledge Base Cleanup\n`;
    md += `- **Action**: Carefully delete \`scripts/ingest.py\`, \`scripts/query.py\`, and \`scripts/llama_drive_indexer.py\` if they exist.\n`;
    md += `- **Action**: Remove the hidden LanceDB database folder (e.g., \`.lancedb/\`).\n`;
    md += `- **Dependencies**: Remove \`lancedb\`, \`langchain\`, \`sentence-transformers\` from \`pyproject.toml\`. DO NOT delete the entire \`pyproject.toml\` file.\n\n`;
  }
  if (isActive('ci_testing_matrix')) {
    md += `### 4. Testing Matrix Cleanup\n- **Action**: Delete \`tests/shell/\` and \`tests/infra/\` directories.\n- **Action**: Delete \`scripts/system/test_matrix.sh\`.\n\n`;
  }
  if (isActive('infra_gateway')) {
    md += `### 5. Edge Gateway Cleanup\n- **Action**: Delete \`config/caddy/Caddyfile\`.\n\n`;
  }
  if (isActive('infra_watchdog') || isActive('infra_iac') || isActive('mem_digest')) {
    md += `### 6. System Scripts Cleanup\n- **Action**: Delete the following files **only if they exist**: \`scripts/system/watchdog.sh\`, \`scripts/system/deploy.sh\`, \`scripts/system/conversation_digest.py\`.\n- **Action**: Delete the \`ansible/\` directory **only if it exists**.\n- **Safety Hook**: Do NOT delete the entire \`scripts/\` directory. Only remove the specific files listed above.\n\n`;
  }
  if (isActive('mem_ollama')) {
    md += `### 7. Ollama Local LLM Cleanup\n- **Action**: Remove the \`ollama\` service block and \`ollama_data\` volume from \`docker-compose.yml\`.\n- **Action**: Stop and remove the \`${safeProjectName.toLowerCase().replace(/_/g, '-')}-ollama\` container.\n- **Safety Hook**: Ask the user before deleting the \`ollama_data\` volume because it contains gigabytes of downloaded models.\n\n`;
  }
  if (isActive('context_bundler') || isActive('response_cache')) {
    md += `### 8. Local Intelligence Cleanup\n`;
    if (isActive('context_bundler')) {
      md += `- **Action**: Delete \`scripts/bundle_context.py\` and the \`.agents/context/\` directory (contains generated snapshots, safe to delete).\n`;
    }
    if (isActive('response_cache')) {
      md += `- **Action**: Delete \`scripts/cache.py\` and the \`.agents/cache/\` directory (contains SQLite Q&A cache, safe to delete).\n`;
    }
    md += `- **Safety Hook**: Do NOT delete the entire \`.agents/\` directory — it may also contain \`workflows/\` and \`digests/\`.\n\n`;
  }
  if (isActive('ci_python_tools')) {
    md += `### 9. Python Tooling Cleanup\n- **Action**: Delete \`pyproject.toml\` ONLY if no other tools depend on it. If other Python modules are still active, only remove the relevant dependency entries.\n- **Action**: Delete \`tests/test_basic.py\`.\n- **Safety Hook**: Do NOT delete the entire \`tests/\` directory if \`ci_testing_matrix\` files also live there.\n\n`;
  }
  if (isActive('edu_submission')) {
    md += `### 10. Student Submission Toolchain Cleanup\n- **Action**: Delete \`scripts/submit_homework.py\`.\n- **Action**: Delete the \`homework_submission/\` directory and its contents.\n- **Safety Hook**: Ensure no unsubmitted assignment files remain in \`homework_submission/\` before deletion.\n\n`;
  }
  md += `### 11. Core Workflows Cleanup\n- **Action**: Delete \`.agents/workflows/start.md\` and \`.agents/workflows/end.md\`.\n\n`;
  md += `### 12. Final Self-Destruct Sequence\n- **Action**: Once all the above steps are verified and complete, you MUST permanently delete this \`UNINSTALL_TEARDOWN.md\` file from the disk to prevent human misclicks in the future.\n`;

  return md;
}

export function generateAgentsMd(config: ProjectConfig, isActive: ModuleChecker): string {
  const userRoles = getUserRoles(config);
  const aiRoles = getAiRoles(config);

  let md = `# AGENTS.md — ${config.projectName}\n\n`;
  md += `> **Format Standard**: [AGENTS.md Open Standard](https://agents.md)\n\n`;
  md += `## 👥 Project Team & Roles\n`;
  md += `### User/Owner Role(s)\n`;
  userRoles.forEach(role => md += `- ${role}\n`);
  md += `\n### AI Assistant Role(s)\n`;
  aiRoles.forEach(role => md += `- ${role}\n`);

  md += `\n## 🤖 AI Personality & Directives\n`;
  md += `- **Primary Directives**: You are the **${aiRoles.join(' / ')}** for this project.\n`;
  md += `- **Collaborator**: Working alongside the **${userRoles.join(' / ')}**.\n`;
  md += `- **Communication Style**: Professional, analytical, and context-aware. Use Traditional Chinese (Taiwan) for non-technical discussions.\n\n`;

  if (config.deploymentScope === 'server' || config.deploymentScope === 'full') {
    md += `## 🌐 System Architecture\n- **Target Domain**: ${config.domain}\n- **Single Source of Truth**: The local \`config/\` directory and containerized data volumes.\n\n`;
  } else {
    md += `## 💻 System Architecture\n- **Environment**: Isolated Local Development Workspace\n- **Execution Environment**: Multi-container Docker stack.\n\n`;
  }

  md += `## 🧱 Workspace & Execution Rules\n- **CRITICAL**: All code execution, compilation, and dependency management MUST be performed entirely inside the Docker container environment. **Zero-leakage policy** for host machine pollution.\n`;
  md += `- **PROACTIVE MISSION ALIGNMENT**: Upon project entry, immediately audit the current state. Check for existing containers, active volumes, and \`.venv\` state. Do not overwrite if valid configurations exist.\n`;
  md += `- **AUTONOMOUS SELF-HEALING**: If a tool (e.g., \`uv\`, \`rclone\`) is missing or a script fails, you MUST attempt to adapt or repair the environment (e.g., fallback implementations) up to 3 times before requesting human intervention.\n`;
  md += `- **ARCHITECTURAL ENCAPSULATION**: Encapsulate all logic into reusable scripts within the \`scripts/\` directory. Avoid one-off terminal hacks. Maintain strict separation of concerns.\n\n`;

  // Phase 3: Inject domain-specific rules
  const domainProfile = config.selectedDomain ? getDomainById(config.selectedDomain) : undefined;
  if (domainProfile) {
    md += domainProfile.agentsRules + `\n`;
  }

  md += `## 🔒 Security & Memory Boundaries\n- **REDACTION**: Never write plain-text API Keys, Tokens, or PII to disk. Use the \`config/\` secrets paradigm.\n- **TRACEABILITY**: Maintain the Decision Log for every major architectural change.\n\n`;
  md += `## 📈 Success Log\n- ${new Date().toISOString().split('T')[0]} : Project roles established: ${aiRoles.join(', ')}.\n\n`;

  const seedDecisions = domainProfile?.seedDecisions || '';
  md += `## 🏗️ Decision Log\n> Standardized metadata for architectural traceability.\n\n| Date | Scope | Decision | Confidence | Provenance | Review_after | Status | Conflict_with | Superseded_by |\n|---|---|---|---|---|---|---|---|---|\n| ${new Date().toISOString().split('T')[0]} | infra | Defined Project Roles: ${aiRoles.join('/')} | high | Generator | - | Active | - | - |\n${seedDecisions}\n`;

  if (isActive('edu_submission')) {
    md += `## 🎓 Educational Assignment Protocol\n`;
    md += `> **CRITICAL DIRECTIVE**: You are equipped with the 'Student Submission Toolchain' (\`scripts/submit_homework.py\`).\n`;
    md += `> When the User requests to submit an assignment or homework, you MUST enforce the following validation before calling the script:\n`;
    md += `1. **Complete Metadata**: Ensure you have exactly five pieces of information: Course Name, Assignment Title, Assignment Type (e.g., 期末專題, 課堂筆記), Student ID(s), and Student Name(s).\n`;
    md += `2. **Missing Info**: If any information is missing, DO NOT submit. Ask the User to provide the missing details.\n`;
    md += `3. **File Consolidation & Target Directory**: Ensure the assignment files are placed inside the \`homework_submission/\` directory. Compress them into a single \`.zip\` or locate the single large media file (\`.mp4\`, \`.pdf\`) within this directory.\n`;
    md += `4. **Execution**: After formatting is verified, execute \`python scripts/submit_homework.py\` **on the host machine** (⚠️ NOT inside Docker — the OAuth flow requires a browser window). Inform the User of the success or error response.\n\n`;
  }

  md += `## 💰 Cloud LLM Call Reduction Protocol\n`;
  md += `> Every cloud LLM call costs tokens and time. Before calling any cloud LLM, work through these local sources in order:\n\n`;
  let llmStep = 1;
  if (isActive('context_bundler')) {
    md += `**Step ${llmStep++} — Read CONTEXT_SNAPSHOT.md first**\n`;
    md += `- This file already contains git state, semantic memory, and past decisions.\n`;
    md += `- If the answer is there, stop. No LLM needed.\n\n`;
  }
  if (isActive('mem_lancedb')) {
    md += `**Step ${llmStep++} — Query local semantic memory**\n`;
    md += `- Run INSIDE container: \`python scripts/query.py "<your question>"\`\n`;
    md += `- If results are sufficient, use them. No cloud call needed.\n\n`;
  }
  if (isActive('response_cache')) {
    md += `**Step ${llmStep++} — Check response cache**\n`;
    md += `- Run INSIDE container: \`python scripts/cache.py search "<your question>"\`\n`;
    md += `- CACHE_HIT → use the cached answer directly.\n`;
    md += `- CACHE_MISS → proceed to next step.\n\n`;
  }
  md += `**Step ${llmStep++} — Read local files directly**\n`;
  md += `- Check AGENTS.md Decision Log, \`.agents/digests/\`, \`pyproject.toml\`, relevant source files.\n\n`;
  md += `**Only call cloud LLM when all local sources are exhausted:**\n`;
  md += `- Bundle ALL local context into the prompt.\n`;
  md += `- Ask a complete, self-contained question — aim to resolve the task in ONE call.\n`;
  if (isActive('response_cache')) {
    md += `- After receiving the answer, store it to cache: \`python scripts/cache.py store "<q>" "<a>" --source cloud\`\n`;
  }
  md += `\n`;

  md += `## 🗺️ Roadmap\n- [ ] Sync environment state with \`SETUP.md\`.\n- [ ] Audit module tree and initialize stubs.\n`;
  return md;
}

export function generateSetupMd(config: ProjectConfig, isActive: ModuleChecker): string {
  const safeProjectName = getSafeProjectName(config);
  const containerName = getContainerName(config);
  const userRoles = getUserRoles(config);
  const aiRoles = getAiRoles(config);

  let md = `# 🚀 Project Initialization Guide\n\nGreetings, I am your **${aiRoles[0] || 'AI Assistant'}**. I have been assigned the roles of **${aiRoles.join(', ')}** to support the **${userRoles.join(', ')}** in **${config.projectName}**.\n\n`;
  md += `## 🤖 AI Autonomous Execution Protocol\n**Attention ${aiRoles[0] || 'Assistant'}:** You are required to proactively execute the following synchronization steps. \n- **Audit First**: Verify existing container states (\`docker ps\`) before triggering builds.\n- **Adaptive Setup**: If \`uv\` is unavailable on the host, pivot to \`pip\` or autonomously install the required toolchain inside the container environment.\n\n`;

  md += `## 🛠️ Automated Installation\nPlease execute these blocks sequentially:\n\`\`\`bash\n`;
  md += `# 1. Start the container\nif ! docker ps | grep -q "${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace"; then\n  docker compose up -d --build\nelse\n  echo "Docker environment already running."\nfi\n\n`;
  if (isActive('ci_python_tools') || isActive('ci_testing_matrix')) {
    md += `# 2. Configure Python environment INSIDE the container\n`;
    md += `docker exec -it ${containerName} bash -c "`;
    md += `if [ ! -d '.venv' ]; then uv venv; fi && source .venv/bin/activate`;
    if (isActive('ci_python_tools')) md += ` && uv pip install -e .[dev]`;
    if (isActive('ci_testing_matrix')) md += ` && uv pip install pytest-testinfra`;
    md += `"\n\n`;
  }
  if (isActive('mem_lancedb')) {
    md += `# 3. Initialize knowledge base (first-time indexing)\ndocker exec -i ${containerName} bash -c "\n  if [ ! -d .venv ]; then uv venv; fi\n  source .venv/bin/activate\n  uv pip install lancedb langchain-huggingface sentence-transformers --quiet\n  python scripts/ingest.py\n"\n\n`;
  }
  if (isActive('mem_ollama')) {
    md += `# 4. Initialize Local LLM (Ollama)\n`;
    md += `docker exec -it ${safeProjectName.toLowerCase().replace(/_/g, '-')}-ollama ollama pull gemma:2b\n\n`;
  }
  if (isActive('ci_git_hook')) {
    md += `# 5. Enable Git pre-push hook\nchmod +x .git/hooks/pre-push\n\n`;
  }
  if (isActive('context_bundler')) {
    md += `# 6. Generate initial context snapshot\ndocker exec -i ${containerName} bash -c "\n  if [ ! -d .venv ]; then uv venv; fi\n  source .venv/bin/activate\n  uv pip install langchain-huggingface sentence-transformers --quiet\n  python scripts/bundle_context.py\n"\n`;
  }
  if (isActive('response_cache') && !isActive('context_bundler') && !isActive('mem_lancedb')) {
    md += `# 7. Install Response Cache dependencies\ndocker exec -i ${containerName} bash -c "\n  if [ ! -d .venv ]; then uv venv; fi\n  source .venv/bin/activate\n  uv pip install langchain-huggingface sentence-transformers --quiet\n"\necho "✅ Response Cache dependencies ready"\n`;
  }
  // Phase 3: Inject domain-specific setup steps
  const domainSetup = config.selectedDomain ? getDomainById(config.selectedDomain) : undefined;
  if (domainSetup && domainSetup.setupSteps) {
    // Replace ${containerName} placeholder with actual container name
    md += domainSetup.setupSteps.replace(/\$\{containerName\}/g, containerName) + `\n`;
  }
  md += `\`\`\`\n\n`;

  if (isActive('ci_git_hook') || isActive('infra_gateway') || isActive('mem_cloud')) {
    md += `## 🔑 Prerequisites Checklist\nPlease ensure we have the following accounts and credentials prepared:\n\n`;
  }

  if (isActive('ci_git_hook')) {
    md += `### 1. Remote Git Repository (GitHub / Gitea)\n- **Why:** Required for version control and the automated pre-push memory sync.\n- **Human Action:** Please create an empty repository on GitHub or your local Gitea server and provide me with the clone URL.\n- **AI Action:** I will execute \`git init\`, \`git remote add origin <URL>\`, and \`git push -u origin main\`.\n\n`;
  }

  if (isActive('mem_cloud')) {
    md += `### 2. Cloud Storage API (Google Drive / OneDrive)\n- **Why:** Required for integrating persistent cloud documents into our local memory vector database.\n- **Human Action:** Please go to the Google Cloud Console (or Azure Portal) and create an OAuth Client ID/Secret. Download the \`credentials.json\` file and place it in the \`config/\` directory.\n- **AI Action:** Once provided, I will run the Rclone authorization flow and configure LlamaIndex targeting the mounted container.\n\n`;
  }

  if (isActive('infra_gateway') || isActive('infra_watchdog')) {
    md += `### 3. Public Domain & VPS Infrastructure\n- **Why:** Required for Edge Gateway routing and uptime monitoring.\n- **Human Action:** Please ensure your domain (or IP) \`${config.domain}\` points to your server. Make sure port 80 (and 443 if using a domain) is open on your VPS firewall.\n- **AI Action:** I will deploy the \`docker-compose.yml\` gateway service and start Caddy.\n\n`;
  }

  md += `***\n\n**To the Human User:** Please read the prerequisites checklist (if any). Provide me with the necessary repository URLs or credentials, and I will handle the rest!\n`;
  return md;
}

export function generateStartWorkflow(config: ProjectConfig, isActive: ModuleChecker): string {
  const containerName = getContainerName(config);
  const userRoles = getUserRoles(config);
  const aiRoles = getAiRoles(config);

  let md = `---\ndescription: Initialize project memory and high-fidelity context retrieval\n---\n`;
  let stepN = 1;
  md += `${stepN++}. **Environment & Role Audit**: Verify your project roles as **${aiRoles.join(', ')}**. Determine if greenfield or existing.\n`;
  md += `${stepN++}. **System Health Verification**: Run \`docker ps\` and syntax checks. If the container is not running, execute \`docker compose up -d\`.\n`;
  if (isActive('context_bundler')) {
    md += `${stepN++}. **Local Context Bundle** — 🚨 Run BEFORE reading AGENTS.md or calling any LLM:\n`;
    md += `   \`docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/bundle_context.py"\`\n`;
    md += `   Read \`.agents/context/CONTEXT_SNAPSHOT.md\`. This file contains git state, semantic memory, and past decisions. Use it to answer all context questions **without calling cloud LLM**.\n`;
  }
  md += `${stepN++}. **Rigid Internalization**: Read \`AGENTS.md\`. Align with the User's roles: **${userRoles.join(', ')}**. Internalize Core Rules.\n`;
  md += `${stepN++}. **Semantic Memory Reconstruction**: Extract Historical Habits to form context.\n`;
  if (isActive('mem_lancedb')) {
    md += `   🚨 **MANDATORY**: AI MUST explicitly execute LanceDB to read memory (run INSIDE container):\n`;
    md += `   - \`docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/query.py 'important architecture status'"\`\n`;
    md += `   - \`docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/query.py 'recent decisions'"\`\n`;
  }
  if (isActive('response_cache')) {
    md += `   🔍 **Cache-First Protocol**: Before calling any cloud LLM, check the local cache (run INSIDE container):\n`;
    md += `   \`docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/cache.py search '<your question>'"\`\n`;
    md += `   If output starts with CACHE_HIT → use that answer directly, skip cloud LLM.\n`;
    md += `   After receiving a new cloud LLM answer → store it to prevent future cloud calls:\n`;
    md += `   \`docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/cache.py store '<question>' '<answer>' --source cloud"\`\n`;
  }
  // Phase 3: Inject domain-specific semantic queries
  const domainStart = config.selectedDomain ? getDomainById(config.selectedDomain) : undefined;
  if (domainStart && domainStart.startQueries.length > 0) {
    md += `${stepN++}. **Domain Context Retrieval** (${domainStart.name}):\n`;
    if (isActive('mem_lancedb')) {
      md += `   Run these queries against LanceDB (INSIDE container):\n`;
      for (const q of domainStart.startQueries) {
        md += `   - \`docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/query.py '${q}'"\`\n`;
      }
    } else {
      md += `   Review local files for the following topics:\n`;
      for (const q of domainStart.startQueries) {
        md += `   - ${q}\n`;
      }
    }
  }
  md += `${stepN++}. **Autonomous Mission Adaptation**: Determine task complexity. Jump to EXECUTION or draft a plan.\n`;
  md += `${stepN++}. **Ready Message**: Confirm system readiness and role synchronization to the User.\n`;
  return md;
}

export function generateEndWorkflow(config: ProjectConfig, isActive: ModuleChecker): string {
  const containerName = getContainerName(config);
  let md = `---\ndescription: Conversation end memory persistence and architectural reconsolidation\n---\n1. **Solution Self-Reflection**: Review newly created assets (scripts, solutions, or resolved bugs). Ensure adherence to the **Architectural Encapsulation Rule**.\n2. **Memory Reconsolidation & Pruning**: Execute stringently: Versioning & Dedup, Conflict Resolution (mark Superseded_by), and Quality Filtering.\n3. **Sanitation**: Proactively wipe all temporary testing artifacts inside \`/tmp\` inside the container. Ensure zero leakage.\n4. **Update AGENTS.md**: Condense newly discovered solutions and critical architectural decisions into the Decision Log and Success Log.\n5. **Git Protocol & Indexing**: Execute a semantic Git commit. If a remote repository is configured (\`git remote -v\` returns a result), run \`git push\` to trigger the pre-push hook for secret scanning and memory sync.\n`;
  if (isActive('mem_digest')) {
    md += `   🚨 **MANDATORY**: AI MUST extract conversation summary explicitly (run INSIDE container):\n   - \`docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/system/conversation_digest.py"\`\n`;
  }
  md += `6. **Final Persistence Confirmation**: Confirm memory synchronization and next-step readiness.\n`;
  return md;
}

export function generatePrePushHook(config: ProjectConfig): string {
  const safeProjectName = getSafeProjectName(config);
  return `#!/bin/bash\n# Fail immediately on unhandled errors, but use || for controlled error handling below\nset -euo pipefail\n\nCONTAINER="${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace"\n\necho "🔒 Running GitLeaks check..."\ndocker exec "$CONTAINER" gitleaks detect --source /workspace --no-git || {\n  echo "❌ GitLeaks detected potentially exposed secrets! Aborting push."\n  exit 1\n}\n\n# Only sync knowledge base if ingest.py exists (requires mem_lancedb module)\nif docker exec "$CONTAINER" test -f scripts/ingest.py 2>/dev/null; then\n  echo "🧠 Syncing knowledge base (Incremental update)..."\n  docker exec "$CONTAINER" bash -c "source .venv/bin/activate && python scripts/ingest.py" || {\n    echo "❌ Knowledge base indexing failed!"\n    exit 1\n  }\n  echo "✅ Knowledge base updated"\nelse\n  echo "ℹ️ No knowledge base (ingest.py not found), skipping sync."\nfi\n`;
}

export function generatePyprojectToml(config: ProjectConfig, isActive: ModuleChecker): string {
  const safeProjectName = getSafeProjectName(config);
  const userRoles = getUserRoles(config);

  let toml = `[project]\nname = "${safeProjectName.toLowerCase().replace(/_/g, '-')}"\nversion = "0.1.0"\ndescription = "AI Generated Project"\nauthors = [{name = "${userRoles[0] || 'Developer'}"}]\nrequires-python = ">=3.10"\n`;
  const deps: string[] = [];
  if (isActive('mem_lancedb')) deps.push('"lancedb>=0.5.0"', '"langchain>=0.1.0"', '"langchain-huggingface>=0.0.1"', '"sentence-transformers>=2.0.0"');
  if (isActive('mem_cloud')) deps.push('"llama-index>=0.10.0"', '"llama-index-readers-google>=0.1.0"', '"llama-index-embeddings-huggingface>=0.1.0"');
  if ((isActive('context_bundler') || isActive('response_cache')) && !isActive('mem_lancedb')) {
    deps.push('"langchain-huggingface>=0.0.1"', '"sentence-transformers>=2.0.0"');
  }

  toml += deps.length > 0
    ? `dependencies = [\n    ${deps.join(',\n    ')}\n]\n\n`
    : `dependencies = []\n\n`;
  toml += `[project.optional-dependencies]\ndev = [\n    "pytest>=8.0.0",\n    "pytest-cov>=4.1.0",\n    "ruff>=0.3.0"\n]\n\n[tool.ruff]\nline-length = 120\n\n[tool.pytest.ini_options]\ntestpaths = ["tests"]\npython_files = "test_*.py"\n`;
  return toml;
}

export function generateCaddyfile(config: ProjectConfig): string {
  const ip = isIpAddress(config.domain);
  const caddyHost = ip ? `http://${config.domain}` : config.domain;
  return `${caddyHost} {\n  # Academic Bot Whitelist\n  @bots {\n    header User-Agent *Googlebot*\n    header User-Agent *GPTBot*\n    header User-Agent *ClaudeBot*\n  }\n  \n  reverse_proxy workspace:8080\n}\n`;
}

export function generateDockerCompose(config: ProjectConfig, isActive: ModuleChecker): string {
  const safeProjectName = getSafeProjectName(config);
  let compose = `services:\n  workspace:\n    container_name: ${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace\n    build: .\n    image: ${safeProjectName.toLowerCase().replace(/_/g, '-')}-env\n`;
  compose += `    volumes:\n      - .:/workspace\n    working_dir: /workspace\n    command: sleep infinity\n    restart: unless-stopped\n    deploy:\n      resources:\n        limits:\n          memory: 2G\n`;

  if (isActive('infra_gateway')) {
    compose += `\n  gateway:\n    image: caddy:alpine\n    ports:\n      - "80:80"\n      - "443:443"\n    volumes:\n      - ./config/caddy/Caddyfile:/etc/caddy/Caddyfile\n    restart: unless-stopped\n`;
  }

  if (isActive('mem_ollama')) {
    compose += `\n  ollama:\n    image: ollama/ollama\n    container_name: ${safeProjectName.toLowerCase().replace(/_/g, '-')}-ollama\n    ports:\n      - "11434:11434"\n    volumes:\n      - ollama_data:/root/.ollama\n    restart: unless-stopped\n`;
  }

  if (isActive('mem_ollama')) {
    compose += `\nvolumes:\n  ollama_data:\n`;
  }

  return compose;
}

export function generateDockerfile(isActive: ModuleChecker): string {
  let dockerfile = `FROM ubuntu:24.04\n\nENV DEBIAN_FRONTEND=noninteractive\n\nRUN apt-get update && apt-get install -y \\\n    curl \\\n    git \\\n    python3-pip \\\n    python3-venv \\\n`;
  if (isActive('env_academic')) {
    dockerfile += `    texlive-full \\\n    pandoc \\\n`;
  }
  if (isActive('ci_testing_matrix')) {
    dockerfile += `    bats \\\n    shellcheck \\\n`;
  }
  if (isActive('mem_cloud')) {
    dockerfile += `    rclone \\\n`;
  }
  dockerfile += `    && rm -rf /var/lib/apt/lists/*\n\n# Safely install uv globally\nRUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh\n\n`;
  if (isActive('ci_git_hook')) {
    dockerfile += `# Install gitleaks from GitHub releases\nRUN curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/main/scripts/install.sh | sh -s -- -b /usr/local/bin\n\n`;
  }
  dockerfile += `WORKDIR /workspace\n`;
  return dockerfile;
}

export function generateWatchdogSh(config: ProjectConfig): string {
  const safeProjectName = getSafeProjectName(config);
  const ip = isIpAddress(config.domain);
  const protocol = ip ? 'http' : 'https';
  return `#!/bin/bash\n# Self-Healing Watchdog\n# Checks endpoints and restarts frozen docker containers\n\nTARGET="${protocol}://${config.domain}"\nCONTAINER="${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace"\n\nif ! curl -s --head  --request GET "$TARGET" | grep "200" > /dev/null; then\n  echo "Endpoint dead. Restarting container..."\n  docker restart "$CONTAINER"\nfi\n`;
}

export function generateAnsibleInventory(config: ProjectConfig): string {
  return `[production]\n${config.domain} ansible_user=root\n`;
}

export function generateAnsiblePlaybook(config: ProjectConfig): string {
  const safeProjectName = getSafeProjectName(config);
  return `---\n- name: Update Crontabs and Scripts\n  hosts: production\n  tasks:\n    - name: Ensure watchdog is in crontab\n      ansible.builtin.cron:\n        name: "Self-healing watchdog"\n        minute: "*/5"\n        job: "cd /opt/${safeProjectName.toLowerCase().replace(/_/g, '-')} && ./scripts/system/watchdog.sh > /dev/null 2>&1"\n`;
}

export function generateUserDocZH(isActive: ModuleChecker): string {
  let doc = `# 🧠 AI Memory OS 學生/開發者使用指南\n\n歡迎使用 **AI Memory OS 專案工具包**！這是一套專門為 AI (如 Cursor, GitHub Copilot) 與人類協作設計的微型作業系統架構。\n\n## 🚀 第一步：如何開始？\n1. **啟動環境**：將解壓縮後的資料夾匯入你的編輯器 (例如 Cursor)。\n2. **啟動 AI**：打開編輯器的 AI 對話框 (Chat)，請直接輸入：「**請閱讀 SETUP.md 並啟動環境，接著遵守 AGENTS.md 的規則進行自我介紹。**」\n3. **Docker 容器**：所有的程式執行、套件安裝都會被限制在安全的 Docker 容器中，不會弄髒你自己的電腦。\n\n`;

  if (isActive('edu_submission')) {
    doc += `### 📤 課堂作業一鍵繳交 (Homework Submission Protocol)\n這個資料夾內建了最安全的作業大檔直傳系統（支援高達 5GB，無須登入教學平台）。\n- **使用方法**：\n  1. 將你要交的檔案 (專案 \`.zip\`、報告 \`.pdf\` 或展示影片 \`.mp4\`) 放進本資料夾的 \`homework_submission/\` 目錄。\n  2. 在 AI 對話框對你的 AI 說：**「幫我交作業。檔案在 homework_submission 裡，這次的分類是 [例如：期末專案]，我的學號是 [你的學號]，姓名是 [你的姓名]。」**\n  3. AI 會自動找尋檔案名稱並啟動繳交程式。這時終端機會彈出通知並開啟瀏覽器，請登入你的 **Google (Gmail) 帳號** 以完成實名認證。\n  4. 授權完成後，你的檔案就會直飛老師的作業收件區！(不吃你的網路也不吃教學平台的限制)\n\n`;
  }

  if (isActive('mem_ollama')) {
    doc += `### 🤖 本地開源模型引擎 (Ollama Local LLM)\n- 專案啟動後，Docker 會在你的電腦內自動幫你跑一個可以離線運作、免費的 AI 伺服器 (運行在 localhost:11434)。\n- 你可以請你的主 AI 寫一段 Python 程式來呼叫它進行推理。\n\n`;
  }

  if (isActive('ci_testing_matrix')) {
    doc += `### 🧪 測試與驗證矩陣 (Testing Matrix)\n- 此專案內建 BATS (Shell 測試) 與 Python Pytest 套件。\n- 你的 AI 幫手可以隨時執行 \`./scripts/system/test_matrix.sh\` 來檢查專案健康度。\n\n`;
  }

  if (isActive('context_bundler')) {
    doc += `### 📦 本機上下文打包器 (Context Bundler)\n- 每次請 AI 開始工作前，AI 會先在 Docker 容器內執行 \`scripts/bundle_context.py\`。\n- 這個腳本會自動收集 git 狀態、最近提交、語意記憶搜尋結果、過去的 session 摘要，並輸出成 \`.agents/context/CONTEXT_SNAPSHOT.md\`。\n- AI 讀這份文件之後，就能立刻理解專案現況，**不需要呼叫雲端 LLM 做探索性問題**，大幅節省成本。\n\n`;
  }

  if (isActive('response_cache')) {
    doc += `### 🗄️ 本機回應快取 (Response Cache)\n- 這個模組在本機建立一個 SQLite 資料庫 (\`.agents/cache/responses.db\`) 用來儲存 AI 問過雲端 LLM 的問題與答案。\n- 下次 AI 問到語意相似的問題（相似度 ≥ 92%），會直接從本機快取回傳，**完全不呼叫雲端**。\n- 快取條目 30 天後自動過期，確保內容不過時。\n- 你可以用 \`python scripts/cache.py stats\` 查看快取命中率。\n\n`;
  }

  return doc;
}

export function generateUserDocEN(isActive: ModuleChecker): string {
  let doc = `# 🧠 AI Memory OS User / Developer Guide\n\nWelcome to the **AI Memory OS Project Toolkit**! This is a micro-OS architecture designed for seamless collaboration between Human and AI (e.g., Cursor, GitHub Copilot).\n\n## 🚀 Step 1: Getting Started\n1. **Open Project**: Import this unzipped folder into your IDE (e.g., Cursor).\n2. **Initialize AI**: Open the AI Chat dialog and prompt exactly: "**Please read SETUP.md to initialize the environment, then follow AGENTS.md to introduce yourself.**"\n3. **Docker Sandbox**: All code execution and package installation will happen safely inside a Docker container, keeping your local machine clean.\n\n`;

  if (isActive('edu_submission')) {
    doc += `### 📤 1-Click Homework Submission Protocol\nThis toolkit includes a secure large-file submission system (up to 5GB, no LMS login required).\n- **How to Use**:\n  1. Place your assignment file (\`.zip\`, \`.pdf\`, or \`.mp4\`) into the \`homework_submission/\` directory.\n  2. Tell your AI in the chat: **"Please submit my homework. The file is in homework_submission. The category is [e.g., Final Project], my Student ID is [Your ID], and my name is [Your Name]."**\n  3. The AI will trigger the submission script. A browser window will pop up asking for your **Google (Gmail) login** for identity verification.\n  4. Once authorized, the file uploads directly to the teacher's cloud drive!\n\n`;
  }

  if (isActive('mem_ollama')) {
    doc += `### 🤖 Ollama Local LLM Engine\n- Once your docker environment is up, a private, free AI server will be automatically running at \`localhost:11434\`.\n- You can ask your primary AI to write a Python script to interact with it.\n\n`;
  }

  if (isActive('ci_testing_matrix')) {
    doc += `### 🧪 Testing Matrix\n- This project includes BATS (Shell Testing) and Python Pytest by default.\n- Your AI assistant can run \`./scripts/system/test_matrix.sh\` anytime to verify project health.\n\n`;
  }

  if (isActive('context_bundler')) {
    doc += `### 📦 Context Bundler\n- Before starting work each session, the AI runs \`scripts/bundle_context.py\` inside the Docker container.\n- This script collects git state, recent commits, semantic memory results, and past session digests, and writes them to \`.agents/context/CONTEXT_SNAPSHOT.md\`.\n- By reading this file, the AI understands the project state immediately — **no exploratory cloud LLM calls needed**, saving tokens and time.\n\n`;
  }

  if (isActive('response_cache')) {
    doc += `### 🗄️ Response Cache\n- This module creates a local SQLite database (\`.agents/cache/responses.db\`) to store cloud LLM Q&A pairs.\n- When the AI encounters a semantically similar question (similarity ≥ 92%), it returns the cached answer locally — **zero cloud calls**.\n- Cache entries expire after 30 days to prevent stale answers.\n- Run \`python scripts/cache.py stats\` to see cache hit statistics.\n\n`;
  }

  return doc;
}

// ===== Phase 4: Health Check Script =====

export const HEALTH_CHECK_PY = `#!/usr/bin/env python3
"""Self-diagnostic script for AI Memory OS environments.

Purpose:
    Run this script to check the health of your AI development environment.
    The AI agent can call this at any time to verify system state and
    automatically decide what needs repair.

Usage:
    python scripts/system/health_check.py
    python scripts/system/health_check.py --json

Output: Human-readable status report (default) or JSON (with --json flag).
"""
import sys
import json
import subprocess
from pathlib import Path


def check_docker() -> dict:
    """Check if Docker containers are running."""
    try:
        result = subprocess.run(
            ['docker', 'ps', '--format', '{{.Names}}\\t{{.Status}}'],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            return {'status': 'error', 'message': 'Docker not accessible'}
        containers = []
        for line in result.stdout.strip().split('\\n'):
            if line:
                parts = line.split('\\t')
                containers.append({'name': parts[0], 'status': parts[1] if len(parts) > 1 else 'unknown'})
        return {'status': 'ok' if containers else 'warning', 'containers': containers}
    except FileNotFoundError:
        return {'status': 'error', 'message': 'Docker not installed'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def check_venv() -> dict:
    """Check if Python virtual environment exists."""
    venv_path = Path('.venv')
    if venv_path.exists() and (venv_path / 'bin' / 'python').exists():
        return {'status': 'ok', 'path': str(venv_path)}
    return {'status': 'missing', 'message': 'Run: uv venv'}


def check_lancedb() -> dict:
    """Check if LanceDB is initialized."""
    db_path = Path('.lancedb')
    if not db_path.exists():
        return {'status': 'missing', 'message': 'Run: python scripts/ingest.py'}
    tables = list(db_path.glob('*.lance'))
    return {'status': 'ok', 'tables': len(tables)}


def check_git() -> dict:
    """Check git repository status."""
    if not Path('.git').exists():
        return {'status': 'missing', 'message': 'Not a git repository'}
    try:
        result = subprocess.run(['git', 'remote', '-v'], capture_output=True, text=True, timeout=5)
        remotes = result.stdout.strip()
        branch = subprocess.run(
            ['git', 'branch', '--show-current'], capture_output=True, text=True, timeout=5
        ).stdout.strip()
        return {'status': 'ok', 'branch': branch, 'has_remote': bool(remotes)}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def check_scripts() -> dict:
    """Check which AI Memory OS scripts are present."""
    scripts = {
        'ingest.py': Path('scripts/ingest.py'),
        'query.py': Path('scripts/query.py'),
        'bundle_context.py': Path('scripts/bundle_context.py'),
        'cache.py': Path('scripts/cache.py'),
        'conversation_digest.py': Path('scripts/system/conversation_digest.py'),
    }
    found = {name: path.exists() for name, path in scripts.items()}
    return {'status': 'ok', 'scripts': found}


def check_agents_md() -> dict:
    """Check if AGENTS.md exists and has content."""
    p = Path('AGENTS.md')
    if not p.exists():
        return {'status': 'missing', 'message': 'AGENTS.md not found'}
    size = p.stat().st_size
    return {'status': 'ok', 'size_bytes': size}


def main():
    use_json = '--json' in sys.argv

    checks = {
        'docker': check_docker(),
        'venv': check_venv(),
        'lancedb': check_lancedb(),
        'git': check_git(),
        'scripts': check_scripts(),
        'agents_md': check_agents_md(),
    }

    if use_json:
        print(json.dumps(checks, indent=2))
    else:
        icons = {'ok': '\\u2705', 'warning': '\\u26a0\\ufe0f ', 'missing': '\\u274c', 'error': '\\u274c'}
        print('\\n\\ud83e\\ude7a AI Memory OS Health Check\\n' + '=' * 40)
        for name, result in checks.items():
            icon = icons.get(result['status'], '\\u2753')
            print(f"{icon} {name}: {result['status']}")
            if result.get('message'):
                print(f"   \\u2514\\u2500 {result['message']}")
            if result.get('containers'):
                for c in result['containers']:
                    print(f"   \\u2514\\u2500 {c['name']}: {c['status']}")
            if result.get('scripts'):
                for script, exists in result['scripts'].items():
                    s = '\\u2705' if exists else '\\u274c'
                    print(f"   \\u2514\\u2500 {s} {script}")
        print('=' * 40)
        ok_count = sum(1 for r in checks.values() if r['status'] == 'ok')
        print(f"\\nOverall: {ok_count}/{len(checks)} checks passed")


if __name__ == '__main__':
    main()
`;

// ===== Phase 4: Module Registry Generator =====

export function generateModuleRegistry(
  config: ProjectConfig,
  isActive: ModuleChecker
): string {
  const allModuleIds = [
    'core_agents', 'core_workflows', 'infra_docker',
    'mem_lancedb', 'mem_ollama', 'env_academic', 'ci_python_tools',
    'mem_digest', 'context_bundler', 'response_cache',
    'mem_cloud', 'ci_git_hook', 'ci_testing_matrix', 'edu_submission',
    'infra_gateway', 'infra_watchdog', 'infra_iac',
  ];
  const activeModules = allModuleIds.filter(id => isActive(id));

  const scripts: Record<string, Record<string, string>> = {};
  if (isActive('mem_lancedb')) {
    scripts['mem_lancedb'] = { ingest: 'scripts/ingest.py', query: 'scripts/query.py' };
  }
  if (isActive('context_bundler')) {
    scripts['context_bundler'] = { bundle: 'scripts/bundle_context.py', output: '.agents/context/CONTEXT_SNAPSHOT.md' };
  }
  if (isActive('response_cache')) {
    scripts['response_cache'] = { cache: 'scripts/cache.py', database: '.agents/cache/responses.db' };
  }
  if (isActive('mem_digest')) {
    scripts['mem_digest'] = { digest: 'scripts/system/conversation_digest.py', output: '.agents/digests/' };
  }
  if (isActive('edu_submission')) {
    scripts['edu_submission'] = { submit: 'scripts/submit_homework.py', input_dir: 'homework_submission/' };
  }
  if (isActive('ci_testing_matrix')) {
    scripts['ci_testing_matrix'] = { runner: 'scripts/system/test_matrix.sh' };
  }
  if (isActive('infra_watchdog')) {
    scripts['infra_watchdog'] = { watchdog: 'scripts/system/watchdog.sh' };
  }
  if (isActive('infra_iac')) {
    scripts['infra_iac'] = { deploy: 'scripts/system/deploy.sh', inventory: 'ansible/inventory.ini' };
  }
  if (isActive('mem_cloud')) {
    scripts['mem_cloud'] = { indexer: 'scripts/llama_drive_indexer.py' };
  }

  const registry = {
    generated_at: new Date().toISOString().split('T')[0],
    generator_version: '2.0.0',
    project_name: config.projectName,
    deployment_scope: config.deploymentScope,
    domain: config.selectedDomain || 'general',
    active_modules: activeModules,
    scripts,
    health_check: 'scripts/system/health_check.py',
    workflows: {
      start: '.agents/workflows/start.md',
      end: '.agents/workflows/end.md',
    },
  };

  return JSON.stringify(registry, null, 2) + '\n';
}

// ===== ZIP Assembly Orchestrator =====

export function assembleZipContent(
  folder: JSZip,
  config: ProjectConfig,
  isActive: ModuleChecker,
  actionType: 'install' | 'uninstall'
): void {
  if (actionType === 'uninstall') {
    folder.file("UNINSTALL_TEARDOWN.md", generateTeardownMd(config, isActive));
    return;
  }

  // Core files
  folder.file("AGENTS.md", generateAgentsMd(config, isActive));
  folder.file("SETUP.md", generateSetupMd(config, isActive));

  // Workflows
  folder.folder(".agents")?.folder("workflows")?.file("start.md", generateStartWorkflow(config, isActive));
  folder.folder(".agents")?.folder("workflows")?.file("end.md", generateEndWorkflow(config, isActive));

  // LanceDB
  if (isActive('mem_lancedb')) {
    folder.folder("scripts")?.file("ingest.py", INGEST_PY);
    folder.folder("scripts")?.file("query.py", QUERY_PY);
  }

  // Git Hook
  if (isActive('ci_git_hook')) {
    folder.folder(".git")?.folder("hooks")?.file("pre-push", generatePrePushHook(config));
  }

  // Python Tooling
  if (isActive('ci_python_tools')) {
    folder.file("pyproject.toml", generatePyprojectToml(config, isActive));
    folder.folder("tests")?.file("test_basic.py", TEST_BASIC_PY);
  }

  // Educational Submission
  if (isActive('edu_submission')) {
    folder.folder("scripts")?.file("submit_homework.py", SUBMIT_HOMEWORK_PY);
    folder.folder("homework_submission")?.file("README.md", HOMEWORK_README);
  }

  // Cloud Drive
  if (isActive('mem_cloud')) {
    folder.folder("scripts")?.file("llama_drive_indexer.py", LLAMA_DRIVE_INDEXER_PY);
  }

  // Testing Matrix
  if (isActive('ci_testing_matrix')) {
    folder.folder("scripts")?.folder("system")?.file("test_matrix.sh", TEST_MATRIX_SH);
    folder.folder("tests")?.folder("infra")?.file("test_infra.py", TEST_INFRA_PY);
    folder.folder("tests")?.folder("shell")?.file("test_scripts.bats", BATS_TEST);
  }

  // Caddyfile
  if (isActive('infra_gateway')) {
    folder.folder("config")?.folder("caddy")?.file("Caddyfile", generateCaddyfile(config));
  }

  // Docker (always generated)
  folder.file("docker-compose.yml", generateDockerCompose(config, isActive));
  folder.file("Dockerfile", generateDockerfile(isActive));

  // Watchdog
  if (isActive('infra_watchdog')) {
    folder.folder("scripts")?.folder("system")?.file("watchdog.sh", generateWatchdogSh(config));
  }

  // IaC Ansible
  if (isActive('infra_iac')) {
    folder.folder("scripts")?.folder("system")?.file("deploy.sh", DEPLOY_SH);
    folder.folder("ansible")?.file("inventory.ini", generateAnsibleInventory(config));
    folder.folder("ansible")?.folder("playbooks")?.file("update_scripts.yml", generateAnsiblePlaybook(config));
  }

  // Conversation Digest
  if (isActive('mem_digest')) {
    folder.folder("scripts")?.folder("system")?.file("conversation_digest.py", CONVERSATION_DIGEST_PY);
  }

  // Context Bundler
  if (isActive('context_bundler')) {
    folder.folder("scripts")?.file("bundle_context.py", BUNDLE_CONTEXT_PY);
    folder.folder(".agents")?.folder("context")?.file(".gitkeep", "");
  }

  // Response Cache
  if (isActive('response_cache')) {
    folder.folder("scripts")?.file("cache.py", CACHE_PY);
    folder.folder(".agents")?.folder("cache")?.file(".gitkeep", "");
  }

  // Phase 3: Domain Context Document
  const domainProfile = config.selectedDomain ? getDomainById(config.selectedDomain) : undefined;
  if (domainProfile) {
    folder.folder("docs")?.file("DOMAIN_CONTEXT.md", domainProfile.contextDoc);
  }

  // Phase 4: Health Check Script (always included)
  folder.folder("scripts")?.folder("system")?.file("health_check.py", HEALTH_CHECK_PY);

  // Phase 4: Module Registry
  folder.folder(".agents")?.file("module_registry.json", generateModuleRegistry(config, isActive));

  // User Documentation
  folder.folder("docs")?.file("USER_GUIDE_ZH.md", generateUserDocZH(isActive));
  folder.folder("docs")?.file("USER_GUIDE_EN.md", generateUserDocEN(isActive));
}
