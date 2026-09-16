"""Feed-forward network sculpture: deterministic Blender builder.

Run:  blender --background --python blender/neural-net/build.py [-- --graybox]

Creates 5 fully connected layers of neurons (spheres) joined by weights
(thin cylinders), exports neural-net.glb beside this script, saves the
editable .blend and renders a hero still used as the website's poster.

Data contract consumed by neural.js in the site root:
  * Node objects are named Node_<layer>_<index>; all share one icosphere mesh.
  * Edge objects are named Edge_<layer>_<from>_<to>; all share one unit
    cylinder mesh that runs from z=0 to z=1 in Blender (y in glTF), so the
    browser can stretch it between two moving neurons with a single scale.
  * Custom properties travel as glTF extras: nodes carry layer/index,
    edges carry layer/src/dst/weight.
  * No text or letters exist in the geometry: labels belong to the page.
"""
import bpy, math, json, sys, random
from pathlib import Path
from mathutils import Vector

O = Path(__file__).resolve().parent
GRAY = '--graybox' in sys.argv

LAYERS = [4, 7, 9, 7, 4]          # neurons per layer, input to output
SPACING = 1.45                    # distance between layers along x
NODE_RADIUS = 0.115
EDGE_RADIUS = 0.011               # unit radius, scaled per |weight| in the browser
SEED = 20260915

rng = random.Random(SEED)
bpy.ops.wm.read_factory_settings(use_empty=True)
s = bpy.context.scene
s.unit_settings.system = 'METRIC'


def material(name, color, metal, rough):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    return m


# Daylight ink on paper: the page's --chalk (#20363e) and a softer weight grey.
ink = material('Ink neuron', (0.014, 0.038, 0.050), 0.05, 0.42)
weight_mat = material('Graphite weight', (0.20, 0.25, 0.28), 0.0, 0.62)

# Neuron positions. Each layer is a ring in the y-z plane so the object has
# real depth when rotated, with a deterministic wobble so it reads as drawn,
# not plotted. Rings alternate their phase so consecutive layers interleave.
positions = {}
for l, n in enumerate(LAYERS):
    x = (l - (len(LAYERS) - 1) / 2) * SPACING
    r = 0.42 + 0.155 * n
    phase = (l % 2) * math.pi / n + 0.35 * l
    for i in range(n):
        a = phase + i * math.tau / n
        rr = r * (1 + (rng.random() - 0.5) * 0.16)
        positions[(l, i)] = Vector((x + (rng.random() - 0.5) * 0.14,
                                    rr * math.cos(a) * 1.15,
                                    rr * math.sin(a) * 0.82))

edges = []
for l in range(len(LAYERS) - 1):
    for i in range(LAYERS[l]):
        for j in range(LAYERS[l + 1]):
            w = rng.gauss(0, 0.55)
            w = max(-1.0, min(1.0, w))
            edges.append((l, i, j, w))

collection = bpy.data.collections.new('Feed-forward network')
s.collection.children.link(collection)

if GRAY:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=NODE_RADIUS, segments=12, ring_count=8)
    node_mesh = bpy.context.object.data
    node_proto = bpy.context.object
else:
    bpy.ops.mesh.primitive_ico_sphere_add(radius=NODE_RADIUS, subdivisions=3)
    node_proto = bpy.context.object
    for f in node_proto.data.polygons:
        f.use_smooth = True
    node_mesh = node_proto.data
node_mesh.name = 'Neuron'
node_mesh.materials.append(ink)

bpy.ops.mesh.primitive_cylinder_add(vertices=6 if GRAY else 10, radius=EDGE_RADIUS, depth=1.0, location=(0, 0, 0.5))
edge_proto = bpy.context.object
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
edge_mesh = edge_proto.data
edge_mesh.name = 'Weight'
edge_mesh.materials.append(weight_mat)
for f in edge_mesh.polygons:
    f.use_smooth = len(f.vertices) == 4

for (l, i), p in positions.items():
    ob = bpy.data.objects.new(f'Node_{l}_{i}', node_mesh)
    ob.location = p
    ob['layer'] = l
    ob['index'] = i
    collection.objects.link(ob)

for l, i, j, w in edges:
    a = positions[(l, i)]
    b = positions[(l + 1, j)]
    d = b - a
    ob = bpy.data.objects.new(f'Edge_{l}_{i}_{j}', edge_mesh)
    ob.location = a
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = d.to_track_quat('Z', 'Y')
    ob.scale = (0.55 + 0.9 * abs(w), 0.55 + 0.9 * abs(w), d.length)
    ob['layer'] = l
    ob['src'] = i
    ob['dst'] = j
    ob['weight'] = w
    collection.objects.link(ob)

bpy.data.objects.remove(node_proto, do_unlink=True)
bpy.data.objects.remove(edge_proto, do_unlink=True)

bpy.ops.object.select_all(action='DESELECT')
for ob in collection.objects:
    ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(O / ('graybox.glb' if GRAY else 'neural-net.glb')), export_format='GLB',
                          use_selection=True, export_animations=False, export_extras=True, export_apply=True)

node_tri = sum(len(f.vertices) - 2 for f in node_mesh.polygons)
edge_tri = sum(len(f.vertices) - 2 for f in edge_mesh.polygons)
metrics = {
    'blender': bpy.app.version_string,
    'seed': SEED,
    'layers': LAYERS,
    'nodes': len(positions),
    'edges': len(edges),
    'node_triangles': node_tri,
    'edge_triangles': edge_tri,
    'total_triangles': node_tri * len(positions) + edge_tri * len(edges),
    'materials': [ink.name, weight_mat.name],
    'edge_axis': 'local +Z from 0 to 1 in Blender, exported as +Y in glTF',
    'stages': ['ring layout', 'icosphere neuron', 'unit cylinder weight', 'two ink materials', 'export with extras'],
}
(O / ('graybox-metrics.json' if GRAY else 'authored-metrics.json')).write_text(json.dumps(metrics, indent=2))

# Paper-light studio for the poster still. The browser lights its own scene;
# this render is the reduced-motion / coarse-pointer fallback image.
world = bpy.data.worlds.new('Paper studio')
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
bg.inputs[0].default_value = (0.92, 0.95, 0.91, 1)
bg.inputs[1].default_value = 0.9
s.world = world


def area(name, pos, power, size, color):
    d = bpy.data.lights.new(name, 'AREA')
    d.energy = power
    d.shape = 'DISK'
    d.size = size
    d.color = color
    o = bpy.data.objects.new(name, d)
    s.collection.objects.link(o)
    o.location = pos
    o.rotation_euler = (-o.location).to_track_quat('-Z', 'Y').to_euler()


area('Key window', (-4, -6, 6), 900, 6, (1, 0.98, 0.94))
area('Fill', (5, -5, 2), 350, 5, (0.94, 0.97, 1))
area('Rim', (2, 6, 4), 500, 4, (1, 1, 1))

cam_data = bpy.data.cameras.new('Poster camera')
cam_data.lens = 62
camera = bpy.data.objects.new('Poster camera', cam_data)
s.collection.objects.link(camera)
s.camera = camera
camera.location = (1.6, -12.5, 3.4)
camera.rotation_euler = (Vector((0.1, 0, 0.15)) - camera.location).to_track_quat('-Z', 'Y').to_euler()

s.render.engine = 'CYCLES'
s.cycles.samples = 12 if GRAY else 64
s.cycles.use_denoising = True
s.cycles.device = 'CPU'
s.render.resolution_x = 1600
s.render.resolution_y = 900
s.render.resolution_percentage = 40 if GRAY else 100
s.render.film_transparent = True
s.view_settings.view_transform = 'Standard'
bpy.ops.wm.save_as_mainfile(filepath=str(O / ('graybox.blend' if GRAY else 'neural-net.blend')))
s.render.filepath = str(O / ('graybox.png' if GRAY else 'hero.png'))
bpy.ops.render.render(write_still=True)
print('NEURAL_BUILD_DONE', json.dumps(metrics))
