import os
import re

def fix_neo_brutalism(directory):
    replacements = [
        (r'\bglass-panel\b', 'premium-panel'),
        (r'\brounded-3xl\b', 'rounded'),
        (r'\brounded-2xl\b', 'rounded'),
        (r'\brounded-\[3rem\]\b', 'rounded'),
        (r'\brounded-\[2rem\]\b', 'rounded'),
        (r'\bborder-2\b', 'border'),
        (r'\bborder-4\b', 'border'),
        (r'\bshadow-2xl\b', 'shadow-sm'),
        (r'\bshadow-xl\b', 'shadow-sm'),
        (r'\bshadow-lg\b', 'shadow-sm'),
        (r'\bbackdrop-blur-xl\b', ''),
        (r'\bbackdrop-blur-3xl\b', ''),
        (r'\bbackdrop-blur-sm\b', ''),
        (r'\bbackdrop-blur-md\b', ''),
    ]
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.css'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements:
                    new_content = re.sub(old, new, new_content)
                
                # Cleanup multiple spaces left by removing classes
                new_content = re.sub(r' +', ' ', new_content)
                new_content = new_content.replace(' "', '"')
                
                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == '__main__':
    fix_neo_brutalism('c:\\Users\\om231\\OneDrive\\Desktop\\Minor\\frontend\\src')
