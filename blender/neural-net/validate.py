"""Fresh-import check of neural-net.glb against authored-metrics.json.

Run:  blender --background --python blender/neural-net/validate.py

Re-imports the exported GLB into an empty scene, confirms counts, shared
meshes, finite transforms, extras and the unit edge axis, then renders six
fixed views from the imported data (not the source scene).
"""
import bpy, json, math, bmesh
from pathlib import Path
from mathutils import Vector

O = Path(__file__).resolve().parent
expected = json.loads((O / 'authored-metrics.json').read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(O / 'neural-net.glb'))
s = bpy.context.scene
obs = [o for o in s.objects if o.type == 'MESH']
nodes = [o for o in obs if o.name.startswith('Node_')]
edges = [o for o in obs if o.name.startswith('Edge_')]
assert len(nodes) == expected['nodes'], (len(nodes), expected['nodes'])
assert len(edges) == expected['edges'], (len(edges), expected['edges'])
assert len({o.data.name for o in nodes}) == 1, 'neurons must share one mesh'
assert len({o.data.name for o in edges}) == 1, 'weights must share one mesh'
assert all(math.isfinite(v) for o in obs for row in o.matrix_world for v in row)
assert all('weight' in o and 'layer' in o and 'src' in o and 'dst' in o for o in edges), 'edge extras missing'
assert all('layer' in o and 'index' in o for o in nodes), 'node extras missing'
edge_mesh = edges[0].data
zs = [v.co.z for v in edge_mesh.vertices]
assert abs(min(zs)) < 1e-5 and abs(max(zs) - 1) < 1e-5, 'edge mesh must span z in [0, 1]'
tri = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in obs)
assert tri == expected['total_triangles'], (tri, expected['total_triangles'])
degenerate = 0
for mesh in {o.data.name: o.data for o in obs}.values():
    bm = bmesh.new(); bm.from_mesh(mesh)
    degenerate += sum(f.calc_area() < 1e-10 for f in bm.faces)
    bm.free()
assert degenerate == 0
# Every edge must end at its two neurons after the import.
by_name = {o.name: o for o in obs}
worst = 0.0
for e in edges:
    a = by_name[f"Node_{e['layer']}_{e['src']}"].matrix_world.translation
    b = by_name[f"Node_{e['layer'] + 1}_{e['dst']}"].matrix_world.translation
    start = e.matrix_world.translation
    end = e.matrix_world @ Vector((0, 0, 1))
    worst = max(worst, (start - a).length, (end - b).length)
assert worst < 1e-4, worst

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
for name, loc in [('hero', (1.6, -12.5, 3.4)), ('front', (0, -12, 0)), ('back', (0, 12, 0)), ('left', (-12, 0, 0)), ('right', (12, 0, 0)), ('top', (0, 0, 12))]:
    s.camera.location = loc
    s.camera.rotation_euler = (-s.camera.location).to_track_quat('-Z', 'Y').to_euler()
    s.render.filepath = str(O / f'import-{name}.png')
    bpy.ops.render.render(write_still=True)
report = {
    'status': 'passed',
    'authored': expected,
    'imported': {'nodes': len(nodes), 'edges': len(edges), 'triangles': tri, 'degenerate_faces': degenerate,
                 'max_edge_endpoint_error': worst, 'glb_bytes': (O / 'neural-net.glb').stat().st_size},
    'observations': ['Neurons and weights are two shared meshes; the browser instances them.',
                     'Six fixed views rendered from the fresh import.',
                     'Signal propagation, hover springs and rotation are browser code, not baked animation.'],
}
(O / 'import-validation.json').write_text(json.dumps(report, indent=2))
print('IMPORT_VALIDATED', json.dumps(report['imported']))
