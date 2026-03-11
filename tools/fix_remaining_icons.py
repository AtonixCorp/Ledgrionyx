#!/usr/bin/env python3
"""Second pass: remove remaining Fa* icon references missed by first pass."""
import os
import re

SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src')


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Remove icon={FaXxx} props (without JSX brackets)
    content = re.sub(r'\s*icon=\{Fa\w+\}', '', content)
    
    # 2. Remove icon: FaXxx in object literals
    content = re.sub(r',?\s*icon:\s*Fa\w+\s*(?=[,}])', '', content)
    # Clean up leading comma if icon was first property
    content = re.sub(r'\{\s*,', '{', content)
    
    # 3. Remove icon: (empty value) in objects  
    content = re.sub(r',?\s*icon:\s*(?=[,}])', '', content)
    content = re.sub(r'\{\s*,', '{', content)
    
    # 4. Fix ternary with empty first operand: {condition ?  : null}
    content = re.sub(r'\{[^{}]+\?\s+:\s*null\s*\}', '', content)
    
    # 5. Remove any remaining standalone <FaXxx> or <FaXxx /> patterns
    content = re.sub(r'<Fa\w+\s*/?>', '', content)
    
    # 6. Remove any remaining Fa* references in JSX expressions like {FaXxx}
    # Only in JSX context (inside curly braces)
    content = re.sub(r'\{Fa[A-Z]\w*\}', '', content)
    
    # 7. Clean up empty icon rendering: {item.icon && <span>...</span>} where icon is now null
    content = re.sub(r'\{[^{}]*\.icon\s*&&\s*<[^>]*>\{[^}]*\.icon\}<[^>]*/>\}', '', content)
    
    # 8. Remove lines that are now just whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
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
