"""Feed-forward network sculpture, second build: deterministic Blender builder.

Run:  blender --background --python blender/neural-net/build.py [-- --graybox]

Nine stacked layers of neurons (spheres on a sunflower spiral, one disk per
layer, input layer on top) joined by sparse weights (thin cylinders, at most
FAN_IN per neuron). Exports neural-net.glb beside this script, saves the
editable .blend with every weight object, and renders the poster stills.

Data contract consumed by neural.js in the site root (see CONTRACT.md):
  * Node objects are named Node_<layer>_<index>; all share one icosphere mesh.
    Extras: layer, index, birth (global reveal order, layer-major then index),
    src (indices of the source neurons in the previous layer) and w (their
    weights, same order). The input layer has no src / w.
  * One WeightProto object carries the shared unit cylinder mesh that runs
    from z=0 to z=1 in Blender (+Y in glTF). The browser instances it once per
    weight and stretches it between the two neurons, so the weights are not
    exported as objects: 320 neurons with up to 12 sources each describe them
    completely, and the GLB stays small.
  * The .blend keeps every Edge_<layer>_<src>_<dst> object for the still and
    for inspection; validate.py rebuilds them from the extras after a fresh
    import and renders the result.
  * No text or letters exist in the geometry: labels belong to the page.
"""
import bpy, math, json, sys, random
from pathlib import Path
from mathutils import Vector

O = Path(__file__).resolve().parent
GRAY = '--graybox' in sys.argv

LAYERS = [8, 24, 40, 56, 64, 56, 40, 24, 8]   # neurons per layer, input (top) to output (bottom)
FAN_IN = 12                                   # incoming weights per neuron (all of them when the layer above is smaller)
SPACING = 1.6                                 # distance between layers along Blender z (glTF y)
SPIRAL = 0.36                                 # sunflower spiral constant: radius = SPIRAL * sqrt(i + 0.5)
NODE_RADIUS = 0.13
EDGE_RADIUS = 0.013                           # unit radius, scaled per |weight| in the browser
SEED = 20260916
GOLDEN = math.pi * (3 - math.sqrt(5))

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


# Daylight ink on paper: the page's --chalk (#20363e) and a softer graphite.
ink = material('Ink neuron', (0.014, 0.038, 0.050), 0.05, 0.42)
weight_mat = material('Graphite weight', (0.20, 0.25, 0.28), 0.0, 0.62)

# Neuron positions. Each layer is a disk in the x-y plane (a sunflower spiral,
# centre first, so the reveal grows outward), stacked along z with the input
# layer on top. A seeded wobble keeps it drawn rather than plotted.
positions, birth_order = {}, []
top = (len(LAYERS) - 1) / 2 * SPACING
for l, n in enumerate(LAYERS):
    z = top - l * SPACING
    phase = 0.61 * l
    for i in range(n):
        r = SPIRAL * math.sqrt(i + 0.5) * (1 + (rng.random() - 0.5) * 0.10)
        a = phase + i * GOLDEN
        positions[(l, i)] = Vector((r * math.cos(a), r * math.sin(a), z + (rng.random() - 0.5) * 0.16))
        birth_order.append((l, i))

# Sparse weights: every neuron below the input takes FAN_IN distinct sources
# from the layer above, drawn once at random and frozen.
incoming = {}   # (layer, index) -> list of (src_index, weight)
edges = []
for l in range(1, len(LAYERS)):
    k = min(FAN_IN, LAYERS[l - 1])
    for j in range(LAYERS[l]):
        sources = sorted(rng.sample(range(LAYERS[l - 1]), k))
        row = []
        for i in sources:
            w = max(-1.0, min(1.0, rng.gauss(0, 0.55)))
            w = round(w, 3)
            row.append((i, w))
            edges.append((l - 1, i, j, w))
        incoming[(l, j)] = row

neurons = bpy.data.collections.new('Neurons')
weights = bpy.data.collections.new('Weights')
s.collection.children.link(neurons)
s.collection.children.link(weights)

if GRAY:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=NODE_RADIUS, segments=12, ring_count=8)
    node_proto = bpy.context.object
else:
    bpy.ops.mesh.primitive_ico_sphere_add(radius=NODE_RADIUS, subdivisions=3)
    node_proto = bpy.context.object
    for f in node_proto.data.polygons:
        f.use_smooth = True
node_mesh = node_proto.data
node_mesh.name = 'Neuron'
node_mesh.materials.append(ink)

bpy.ops.mesh.primitive_cylinder_add(vertices=6 if GRAY else 10, radius=EDGE_RADIUS, depth=1.0, end_fill_type='NOTHING', location=(0, 0, 0.5))
edge_proto = bpy.context.object
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
edge_mesh = edge_proto.data
edge_mesh.name = 'Weight'
edge_mesh.materials.append(weight_mat)
for f in edge_mesh.polygons:
    f.use_smooth = True
edge_proto.name = 'WeightProto'
edge_proto['role'] = 'weight-prototype'
for c in list(edge_proto.users_collection):
    c.objects.unlink(edge_proto)
neurons.objects.link(edge_proto)

for birth, (l, i) in enumerate(birth_order):
    ob = bpy.data.objects.new(f'Node_{l}_{i}', node_mesh)
    ob.location = positions[(l, i)]
    ob['layer'] = l
    ob['index'] = i
    ob['birth'] = birth
    if (l, i) in incoming:
        ob['src'] = [src for src, _ in incoming[(l, i)]]
        ob['w'] = [w for _, w in incoming[(l, i)]]
    neurons.objects.link(ob)

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
    weights.objects.link(ob)

bpy.data.objects.remove(node_proto, do_unlink=True)

bpy.ops.object.select_all(action='DESELECT')
for ob in neurons.objects:
    ob.select_set(True)
glb = O / ('graybox.glb' if GRAY else 'neural-net.glb')
bpy.ops.export_scene.gltf(filepath=str(glb), export_format='GLB', use_selection=True,
                          export_animations=False, export_extras=True, export_apply=True)

node_tri = sum(len(f.vertices) - 2 for f in node_mesh.polygons)
edge_tri = sum(len(f.vertices) - 2 for f in edge_mesh.polygons)
metrics = {
    'blender': bpy.app.version_string,
    'seed': SEED,
    'layers': LAYERS,
    'fan_in': FAN_IN,
    'spacing': SPACING,
    'nodes': len(positions),
    'edges': len(edges),
    'weight_sum': round(sum(w for *_, w in edges), 3),
    'source_sum': sum(i for _, i, _, _ in edges),
    'node_triangles': node_tri,
    'edge_triangles': edge_tri,
    'total_triangles': node_tri * len(positions) + edge_tri * len(edges),
    'materials': [ink.name, weight_mat.name],
    'edge_axis': 'local +Z from 0 to 1 in Blender, exported as +Y in glTF',
    'exported_objects': len(neurons.objects),
    'glb_bytes': glb.stat().st_size,
    'stages': ['stacked sunflower disks', 'icosphere neuron', 'unit cylinder weight prototype', 'sparse fan-in weights', 'birth order in extras', 'export neurons and prototype'],
}
(O / ('graybox-metrics.json' if GRAY else 'authored-metrics.json')).write_text(json.dumps(metrics, indent=2))

# Paper-light studio for the poster still. The browser lights its own scene;
# this render is the reduced-motion / coarse-pointer / no-WebGL image.
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


area('Key window', (-9, -12, 12), 3200, 9, (1, 0.98, 0.94))
area('Fill', (11, -10, 2), 1300, 8, (0.94, 0.97, 1))
area('Rim', (4, 12, 7), 1800, 6, (1, 1, 1))

cam_data = bpy.data.cameras.new('Poster camera')
cam_data.lens = 70
camera = bpy.data.objects.new('Poster camera', cam_data)
s.collection.objects.link(camera)
s.camera = camera
camera.location = (6, -30, 7.5)
camera.rotation_euler = (Vector((0, 0, -0.3)) - camera.location).to_track_quat('-Z', 'Y').to_euler()

s.render.engine = 'CYCLES'
s.cycles.samples = 12 if GRAY else 64
s.cycles.use_denoising = True
s.cycles.device = 'CPU'
s.render.resolution_x = 1400
s.render.resolution_y = 1400
s.render.resolution_percentage = 30 if GRAY else 100
s.render.film_transparent = True
s.view_settings.view_transform = 'Standard'
bpy.ops.wm.save_as_mainfile(filepath=str(O / ('graybox.blend' if GRAY else 'neural-net.blend')))
s.render.filepath = str(O / ('graybox.png' if GRAY else 'hero.png'))
bpy.ops.render.render(write_still=True)
if not GRAY:
    # The site posters straight from the render: full and half size WebP.
    img = bpy.data.images['Render Result']
    s.render.image_settings.file_format = 'WEBP'
    s.render.image_settings.color_mode = 'RGBA'
    s.render.image_settings.quality = 82
    img.save_render(str(O / 'poster.webp'))
    s.render.resolution_percentage = 50
    s.render.filepath = str(O / 'poster-small.webp')
    bpy.ops.render.render(write_still=True)
print('NEURAL_BUILD_DONE', json.dumps(metrics))
