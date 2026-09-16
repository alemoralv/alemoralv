"""Fresh-import check of neural-net.glb against authored-metrics.json.

Run:  blender --background --python blender/neural-net/validate.py

Re-imports the exported GLB into an empty scene, confirms the neuron count,
the shared meshes, finite transforms, the extras (layer, index, birth, src,
w), the birth order, the unit weight axis, and that the incoming-weight table
in the extras reproduces the authored weight count and checksums. It then
rebuilds every weight from those extras alone (instancing the imported
prototype mesh) and renders six fixed views from the imported data.
"""
import bpy, json, math, bmesh
from pathlib import Path
from mathutils import Vector

O = Path(__file__).resolve().parent
expected = json.loads((O / 'authored-metrics.json').read_text())
LAYERS = expected['layers']
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(O / 'neural-net.glb'))
s = bpy.context.scene
obs = [o for o in s.objects if o.type == 'MESH']
assert not [o for o in s.objects if o.type == 'FONT'], 'no text objects may exist'
nodes = [o for o in obs if o.name.startswith('Node_')]
protos = [o for o in obs if o.name == 'WeightProto']
assert len(nodes) == expected['nodes'], (len(nodes), expected['nodes'])
assert len(protos) == 1, 'exactly one weight prototype'
assert len(obs) == len(nodes) + 1, 'only neurons and the prototype are exported'
assert len({o.data.name for o in nodes}) == 1, 'neurons must share one mesh'
assert all(math.isfinite(v) for o in obs for row in o.matrix_world for v in row)
assert all('layer' in o and 'index' in o and 'birth' in o for o in nodes), 'node extras missing'
proto = protos[0]
zs = [v.co.z for v in proto.data.vertices]
assert abs(min(zs)) < 1e-5 and abs(max(zs) - 1) < 1e-5, 'weight mesh must span z in [0, 1]'
assert proto['role'] == 'weight-prototype'

# Birth order: a permutation of 0..N-1, layer-major then index.
by_key = {(int(o['layer']), int(o['index'])): o for o in nodes}
assert len(by_key) == len(nodes), 'duplicate layer/index'
assert all(0 <= l < len(LAYERS) and 0 <= i < LAYERS[l] for l, i in by_key), 'layer/index outside LAYERS'
assert all((l, i) in by_key for l in range(len(LAYERS)) for i in range(LAYERS[l])), 'a neuron is missing'
births = sorted((int(o['birth']), (int(o['layer']), int(o['index']))) for o in nodes)
assert [b for b, _ in births] == list(range(len(nodes))), 'birth is not a permutation'
assert [k for _, k in births] == sorted(by_key), 'birth must be layer-major then index'

# Incoming weights from the extras: valid sources, fan-in, count and checksums.
edges, worst_fan = [], 0
for (l, j), o in by_key.items():
    if l == 0:
        assert 'src' not in o and 'w' not in o, 'input neurons take no weights'
        continue
    src, w = list(o['src']), list(o['w'])
    assert len(src) == len(w) > 0, (l, j)
    assert len(set(src)) == len(src), 'duplicate source'
    assert all(0 <= int(i) < LAYERS[l - 1] for i in src), 'source outside the layer above'
    assert all(-1 <= float(x) <= 1 for x in w), 'weight outside [-1, 1]'
    worst_fan = max(worst_fan, len(src))
    edges.extend((l - 1, int(i), j, float(x)) for i, x in zip(src, w))
assert len(edges) == expected['edges'], (len(edges), expected['edges'])
assert worst_fan <= expected['fan_in']
assert abs(sum(w for *_, w in edges) - expected['weight_sum']) < 1e-3, 'weight checksum'
assert sum(i for _, i, _, _ in edges) == expected['source_sum'], 'source checksum'

# Rebuild every weight from the extras alone, instancing the imported prototype mesh.
rebuilt = bpy.data.collections.new('Rebuilt weights')
s.collection.children.link(rebuilt)
for l, i, j, w in edges:
    a = by_key[(l, i)].matrix_world.translation
    b = by_key[(l + 1, j)].matrix_world.translation
    d = b - a
    assert d.length > 0.2, 'degenerate weight'
    ob = bpy.data.objects.new(f'Rebuilt_{l}_{i}_{j}', proto.data)
    ob.location = a
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = d.to_track_quat('Z', 'Y')
    ob.scale = (0.55 + 0.9 * abs(w), 0.55 + 0.9 * abs(w), d.length)
    rebuilt.objects.link(ob)
proto.hide_render = True

tri_node = sum(len(f.vertices) - 2 for f in nodes[0].data.polygons)
tri_edge = sum(len(f.vertices) - 2 for f in proto.data.polygons)
tri = tri_node * len(nodes) + tri_edge * len(edges)
assert tri == expected['total_triangles'], (tri, expected['total_triangles'])
degenerate = 0
for mesh in {o.data.name: o.data for o in obs}.values():
    bm = bmesh.new(); bm.from_mesh(mesh)
    degenerate += sum(f.calc_area() < 1e-10 for f in bm.faces)
    bm.free()
assert degenerate == 0

with bpy.data.libraries.load(str(O / 'neural-net.blend'), link=False) as (src, dst):
    dst.objects = [n for n in src.objects if n in ['Poster camera', 'Key window', 'Fill', 'Rim']]
    dst.worlds = src.worlds
for ob in dst.objects:
    s.collection.objects.link(ob)
s.world = dst.worlds[0]
s.camera = bpy.data.objects['Poster camera']
s.render.engine = 'CYCLES'; s.cycles.samples = 24; s.cycles.use_denoising = True; s.cycles.device = 'CPU'
s.view_settings.view_transform = 'Standard'
s.render.resolution_x = 512; s.render.resolution_y = 512; s.render.resolution_percentage = 100; s.render.film_transparent = True
for name, loc in [('hero', (6, -30, 7.5)), ('front', (0, -30, 0)), ('back', (0, 30, 0)), ('left', (-30, 0, 0)), ('right', (30, 0, 0)), ('top', (0, 0, 30))]:
    s.camera.location = loc
    s.camera.rotation_euler = (-s.camera.location).to_track_quat('-Z', 'Y').to_euler()
    s.render.filepath = str(O / f'import-{name}.png')
    bpy.ops.render.render(write_still=True)
report = {
    'status': 'passed',
    'authored': expected,
    'imported': {'nodes': len(nodes), 'prototypes': len(protos), 'edges_from_extras': len(edges), 'max_fan_in': worst_fan,
                 'triangles': tri, 'degenerate_faces': degenerate, 'glb_bytes': (O / 'neural-net.glb').stat().st_size},
    'observations': ['Neurons share one mesh; the weight prototype is the second. The browser instances both.',
                     'Every weight was rebuilt from the src / w extras of its destination neuron and rendered in six fixed views.',
                     'Birth order is layer-major then spiral index, so the reveal grows top to bottom and centre outward.',
                     'Growth, signal propagation, hover springs and rotation are browser code, not baked animation.'],
}
(O / 'import-validation.json').write_text(json.dumps(report, indent=2))
print('IMPORT_VALIDATED', json.dumps(report['imported']))
