#!/usr/bin/env python3
"""Fix syntax errors left after icon removal — empty ternary expressions and standalone empty JSX."""
import os
import re

SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src')


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Fix empty ternary: {condition ?  : } -> null (remove the expression)
    # Pattern: {expr ?  : }
    content = re.sub(r'\{[^{}]+\?\s*:\s*\}', '{null}', content)
    
    # 2. Fix ternary with one side empty: {condition ?  : <Something>} or {condition ? <Something> : }
    # {expr ? '' : ''} patterns
    content = re.sub(r"\{[^{}]+\?\s*''\s*:\s*''\s*\}", "''", content)
    
    # 3. Fix standalone empty expressions like: {insight.type === 'warning' && }
    content = re.sub(r'\{[^{}]+&&\s*\}', '{null}', content)
    
    # 4. Clean up lines that are just {null} on their own inside JSX
    content = re.sub(r'^\s*\{null\}\s*$', '', content, flags=re.MULTILINE)
    
    # 5. Fix "condition ?  :" (empty first operand in ternary, second operand has content)
    # e.g. {branch.profit >= 0 ?  : } followed by more content
    content = re.sub(r'(\{[^{}?]+\?)\s+(:\s*\})', r'\1 null \2', content)
    content = re.sub(r'(\{[^{}?]+\?\s*null\s*:\s*\})', '{null}', content)
    
    # Remove {null} entirely 
    content = re.sub(r'\s*\{null\}\s*', ' ', content)
    
    # 6. Clean up extra whitespace on lines
    lines = content.split('\n')
    cleaned = []
    for line in lines:
        # Remove trailing whitespace
        line = line.rstrip()
        cleaned.append(line)
    content = '\n'.join(cleaned)
    
    # 7. Remove consecutive blank lines (max 1)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    src = os.path.abspath(SRC_DIR)
    changed = 0
    
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in ('node_modules', 'build', '.git')]
        for fname in files:
            if fname.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, fname)
                if fix_file(filepath):
                    relpath = os.path.relpath(filepath, src)
                    print(f"  Fixed: {relpath}")
                    changed += 1
    
    print(f"\nFixed {changed} files")


if __name__ == '__main__':
    main()
