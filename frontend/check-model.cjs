const { NodeIO } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const path = require('path');

async function inspect(file) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(file);
  const root = doc.getRoot();

  console.log(`=== ${path.basename(file)} ===\n`);
  const nodes = root.listNodes();
  console.log(`Nodes: ${nodes.length}`);
  nodes.forEach((n, i) => {
    const mesh = n.getMesh();
    console.log(`  Node[${i}]: "${n.getName()}" ${mesh ? '→ has mesh' : ''}`);
  });

  const meshes = root.listMeshes();
  console.log(`Meshes: ${meshes.length}`);
  meshes.forEach((mesh, i) => {
    const prims = mesh.listPrimitives();
    console.log(`  Mesh[${i}]: "${mesh.getName()}" → ${prims.length} prim(s)`);
    prims.forEach((prim, j) => {
      const mat = prim.getMaterial();
      const pos = prim.getAttribute('POSITION');
      const uv = prim.getAttribute('TEXCOORD_0');
      const norm = prim.getAttribute('NORMAL');
      const idx = prim.getIndices();
      console.log(`    Prim[${j}]: mat="${mat?.getName()||'none'}" verts=${pos?.getCount()||0} hasUV=${!!uv} hasNormal=${!!norm} faces=${idx?idx.getCount()/3:'N/A'}`);
    });
  });

  const materials = root.listMaterials();
  console.log(`Materials: ${materials.length}`);
  materials.forEach((mat, i) => {
    const bc = mat.getBaseColorFactor();
    const tex = mat.getBaseColorTexture();
    console.log(`  Mat[${i}]: "${mat.getName()}" color=[${bc.map(c=>c.toFixed(2))}] metal=${mat.getMetallicFactor().toFixed(2)} rough=${mat.getRoughnessFactor().toFixed(2)} hasTex=${!!tex}`);
  });

  const textures = root.listTextures();
  console.log(`Textures: ${textures.length}`);
  textures.forEach((t, i) => {
    console.log(`  Tex[${i}]: "${t.getName()}" ${t.getMimeType()} ${(t.getImage()?.byteLength/1024).toFixed(0)}KB`);
  });
}

inspect(process.argv[2]).catch(console.error);
