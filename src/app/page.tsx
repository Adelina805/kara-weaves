import { FabricDesignerApp } from "@/components/fabric-designer/FabricDesignerApp";

export default function HomePage() {
  return (
    <main className="px-4 py-8">
      <header className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Kara Weaves Fabric Designer
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Create custom woven fabric previews with body colors, borders, and draggable stripes.
          Texture, softness, and intersection blending use fixed production defaults.
        </p>
      </header>
      <FabricDesignerApp />
    </main>
  );
}
