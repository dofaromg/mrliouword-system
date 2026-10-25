"""Reproducible expected-file, hash and ZIP coverage audit (excludes runtime caches)."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parent
EXPECTED = [
    'dispatch.py', 'commercial_gate.py', 'bridge-client.mjs', 'test_dispatch.py',
    'README.md', 'GOVERNANCE_ADDENDUM.md', 'PACKAGE_AUDIT.py',
    'policy.json', 'task-example.json', 'registry-example.json',
    'evidence/commercial-gap-result.json', 'evidence/validation.json',
    'governance/3c38eeeec5b581bda54ee462e627b3e0.json',
    'governance/3bb8eeeec5b581238cf4dbc2548f6006.json',
    'upstream/TaskChannel.ts', 'upstream/BridgeOrchestrator.ts',
    'upstream/BaseChannel.ts', 'upstream/SocketTransport.ts',
    'upstream/index.ts', 'upstream/SOURCES.json'
]


def audit():
    actual = {str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file()
              and '__pycache__' not in p.parts and p.name != 'MANIFEST.json'}
    missing, extra = sorted(set(EXPECTED)-actual), sorted(actual-set(EXPECTED))
    assert not missing and not extra, (missing, extra)
    entries = []
    for name in EXPECTED:
        raw = (ROOT/name).read_bytes()
        assert len(raw) > 0, name
        entries.append({'path': name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
    source = json.loads((ROOT/'upstream/SOURCES.json').read_text())
    for s in source:
        assert (ROOT/'upstream'/s['name']).stat().st_size == s['bytes']
    manifest = {'expected': EXPECTED, 'files': entries, 'missing': missing, 'extra': extra,
                'mismatch': [], 'empty': [], 'orphan': [],
                'excluded': ['__pycache__ (runtime cache)', 'MANIFEST.json (self-hash recursion)'],
                'package_content_status': 'PASS', 'full_system_status': 'NOT_LIVE_VALIDATED',
                'upstream_dependency_gaps': ['ExtensionChannel.ts', 'exact dependency lockfile', 'Socket.IO server source'],
                'governance_status': 'BUILT_FOR_REVIEW / COMMERCIAL_UNRESOLVED'}
    (ROOT/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    target = ROOT.parent/'MRL_World_Model_Commercial_Governance_20260922_v1.zip'
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name in EXPECTED+['MANIFEST.json']:
            archive.write(ROOT/name, arcname=ROOT.name+'/'+name)
    with zipfile.ZipFile(target) as archive:
        assert set(archive.namelist()) == {ROOT.name+'/'+n for n in EXPECTED+['MANIFEST.json']}
        assert archive.testzip() is None
        for item in entries:
            assert hashlib.sha256(archive.read(ROOT.name+'/'+item['path'])).hexdigest() == item['sha256']
    print(json.dumps({'zip':str(target),'payload_files':len(entries),'zip_entries':len(entries)+1,
                      'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
                      'package_content_status':'PASS','full_system_status':'NOT_LIVE_VALIDATED'},indent=2))


if __name__ == '__main__':
    audit()
