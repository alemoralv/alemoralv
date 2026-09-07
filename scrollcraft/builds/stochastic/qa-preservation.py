from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re

build = Path(__file__).resolve().parent
root = build.parents[2]
baseline = build / 'review/baseline'

class Content(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.buffers = {}
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
        key = attrs.get('id')
        if 'masthead-bio' in attrs.get('class', '').split():
            key = 'masthead-bio'
        if tag not in {'meta', 'link', 'br', 'hr', 'img', 'input', 'source', 'wbr'}:
            self.stack.append((tag, key))
        if key:
            self.buffers.setdefault(key, [])
    def handle_endtag(self, tag):
        for n in range(len(self.stack) - 1, -1, -1):
            if self.stack[n][0] == tag:
                self.stack = self.stack[:n]
                break
    def handle_data(self, data):
        for _, key in self.stack:
            if key:
                self.buffers[key].append(data)
    def normalized(self, key):
        return re.sub(r'\s+', ' ', ''.join(self.buffers.get(key, []))).strip()

result = {'pages': []}
for page, ids in [
    ('index.html', ['masthead-bio', 'about', 'projects', 'notes', 'academic-background', 'modules']),
    ('thinking-in-measures.html', ['thesis']),
]:
    before, after = Content(), Content()
    before.feed((baseline / (page + '.source')).read_text(encoding='utf-8-sig'))
    after.feed((root / page).read_text(encoding='utf-8-sig'))
    result['pages'].append({'page': page, 'sections': {key: before.normalized(key) == after.normalized(key) for key in ids}, 'missingOriginalLinks': sorted(set(before.links) - set(after.links))})
hashes = json.loads((baseline / 'source-hashes.json').read_text(encoding='utf-8'))
result['postFragments'] = {name: hashlib.sha256((root / name).read_bytes()).hexdigest() == old for name, old in hashes.items()}
(build / 'review/preservation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result))
