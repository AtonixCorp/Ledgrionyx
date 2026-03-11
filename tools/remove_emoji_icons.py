#!/usr/bin/env python3
"""Remove all emojis and react-icons from frontend source files."""
import os
import re
import sys

SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src')

# Match emoji unicode ranges
EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U0001F900-\U0001F9FF"  # supplemental symbols
    "\U0001FA00-\U0001FA6F"  # chess symbols
    "\U0001FA70-\U0001FAFF"  # symbols extended
    "\U00002702-\U000027B0"  # dingbats
    "\U000024C2-\U0001F251"  # enclosed chars
    "\U0000FE0F"             # variation selector
    "\U0000200D"             # zero width joiner
    "\U00002600-\U000026FF"  # misc symbols
    "\U00002700-\U000027BF"  # dingbats
    "\U0000FE00-\U0000FE0F"  # variation selectors
    "\U0000231A-\U0000231B"  # watch/hourglass
    "\U000023E9-\U000023F3"  # media controls
    "\U000023F8-\U000023FA"  # media controls
    "\U00002934-\U00002935"  # arrows
    "\U000025AA-\U000025AB"  # squares
    "\U000025B6\U000025C0"   # play buttons
    "\U000025FB-\U000025FE"  # squares
    "\U00002B05-\U00002B07"  # arrows
    "\U00002B1B-\U00002B1C"  # squares
    "\U00002B50\U00002B55"   # star/circle
    "\U00003030\U0000303D"   # wavy dash
    "\U00003297\U00003299"   # japanese
    "]+", re.UNICODE
)

# Patterns for react-icon imports
ICON_IMPORT_RE = re.compile(
    r"^import\s+\{[^}]*\}\s+from\s+['\"]react-icons/[^'\"]+['\"];\s*$",
    re.MULTILINE
)

# Standalone icon component: <FaXxx /> or <FaXxx prop="val" />
ICON_JSX_RE = re.compile(r'<Fa\w+\s*/>')
ICON_JSX_PROPS_RE = re.compile(r'<Fa\w+\s+[^>]*/>')

# icon={<FaXxx />} prop on components
ICON_PROP_RE = re.compile(r'\s*icon=\{<Fa\w+\s*/?>\}')

# icon: <FaXxx /> in object literals (nav arrays)
ICON_OBJ_RE = re.compile(r'icon:\s*<Fa\w+\s*/?>,?\s*')

# {item.icon && <span className="nav-icon">{item.icon}</span>} patterns
ICON_NAV_RENDER_RE = re.compile(r'<span\s+className="nav-icon">\{[^}]*\}</span>')

# Cleanup leftover whitespace in strings after emoji removal
MULTI_SPACE_RE = re.compile(r'  +')


def process_file(filepath):
    """Process a single file to remove emojis and icons."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Remove emoji characters
    content = EMOJI_RE.sub('', content)
    # Clean up leftover spaces from emoji removal (e.g., "🤖 AI" -> " AI" -> "AI")
    # But be careful not to collapse intentional spaces
    content = re.sub(r"'(\s+)([A-Z])", lambda m: "'" + m.group(2) if len(m.group(1).strip()) == 0 else m.group(0), content)
    content = re.sub(r'"(\s+)([A-Z])', lambda m: '"' + m.group(2) if len(m.group(1).strip()) == 0 else m.group(0), content)
    content = re.sub(r'`(\s+)([A-Z$])', lambda m: '`' + m.group(2) if len(m.group(1).strip()) == 0 else m.group(0), content)
    content = re.sub(r'>(\s+)([A-Z])', lambda m: '>' + m.group(2) if len(m.group(1).strip()) == 0 else m.group(0), content)
    # Clean "{ }" that might be left (emoji was the only content)
    content = re.sub(r"'(\s+)'", "''", content)
    
    # 2. Remove react-icons import lines
    content = ICON_IMPORT_RE.sub('', content)
    
    # 3. Remove icon={<FaXxx />} props
    content = ICON_PROP_RE.sub('', content)
    
    # 4. Remove icon: <FaXxx /> in object properties
    content = ICON_OBJ_RE.sub('', content)
    
    # 5. Replace standalone <FaXxx ... /> with nothing
    content = ICON_JSX_PROPS_RE.sub('', content)
    content = ICON_JSX_RE.sub('', content)
    
    # 6. Clean up <span className="nav-icon"></span> that are now empty
    content = re.sub(r'<span\s+className="nav-icon">\s*</span>', '', content)
    
    # 7. For Modal.jsx close button - replace empty button content with ×
    if 'modal-close' in content or 'Modal' in os.path.basename(filepath):
        content = re.sub(
            r'(<button\s+className="modal-close"[^>]*>)\s*(</button>)',
            r'\1×\2',
            content
        )
    
    # 8. Clean up empty lines left by import removal (max 2 consecutive blank lines)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # 9. Clean up password toggle eyes (Login/Register) - replace with text
    # Pattern: {showPassword ? '👁' : '👁‍🗨'} -> already cleaned by emoji removal
    # Replace empty strings with text
    content = re.sub(r"\{show[Pp]assword\s*\?\s*''\s*:\s*''\}", "'{showPassword ? \"Hide\" : \"Show\"}'", content)
    content = re.sub(r"\{showConfirmPassword\s*\?\s*''\s*:\s*''\}", "'{showConfirmPassword ? \"Hide\" : \"Show\"}'", content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    src = os.path.abspath(SRC_DIR)
    changed = 0
    total = 0
    
    for root, dirs, files in os.walk(src):
        # Skip node_modules, build
        dirs[:] = [d for d in dirs if d not in ('node_modules', 'build', '.git')]
        for fname in files:
            if fname.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, fname)
                total += 1
                if process_file(filepath):
                    relpath = os.path.relpath(filepath, src)
                    print(f"  Modified: {relpath}")
                    changed += 1
    
    print(f"\nDone: {changed}/{total} files modified")


if __name__ == '__main__':
    main()
