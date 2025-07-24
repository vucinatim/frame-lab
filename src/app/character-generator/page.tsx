import { CharacterGenerator } from "@/components/character-generator";

export default function CharacterGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Fantasy Hero Generator
          </h1>
          <p className="text-gray-600">
            Generate fantasy hero characters in T-pose using AI
          </p>
        </div>
        <CharacterGenerator />
      </div>
    </div>
  );
}
