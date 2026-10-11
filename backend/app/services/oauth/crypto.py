from __future__ import annotations
import os
from pathlib import Path
from cryptography.fernet import Fernet

def cipher_for(data_dir:Path, managed:bool):
    raw=os.getenv("CFA_TOKEN_ENCRYPTION_KEY")
    if raw:
        return Fernet(raw.encode())
    if managed:
        raise RuntimeError("CFA_TOKEN_ENCRYPTION_KEY required in managed mode")
    keyfile=data_dir/"local_token.key"
    if keyfile.exists():
        key=keyfile.read_bytes().strip()
    else:
        key=Fernet.generate_key()
        keyfile.write_bytes(key)
        try: os.chmod(keyfile,0o600)
        except OSError: pass
    return Fernet(key)

def encrypt_json(cipher,obj):
    import json
    return cipher.encrypt(json.dumps(obj).encode()).decode()

def decrypt_json(cipher,blob):
    import json
    return json.loads(cipher.decrypt(blob.encode()).decode())
