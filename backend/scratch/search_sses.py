import os

def search_pattern(root_dir, pattern):
    print(f"Searching for '{pattern}' in {root_dir}...")
    for root, dirs, files in os.walk(root_dir):
        if 'venv' in root or 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith(('.py', '.js', '.jsx', '.html', '.css', '.bat', '.json')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line_num, line in enumerate(f, 1):
                            if pattern.lower() in line.lower():
                                print(f"Found in {file_path}:{line_num} -> {line.strip()}")
                except Exception as e:
                    pass

if __name__ == "__main__":
    search_pattern(r"c:\Users\sharmash vali\OneDrive\Attachments\Documents\Desktop\RejectionIQ", "SSES")
