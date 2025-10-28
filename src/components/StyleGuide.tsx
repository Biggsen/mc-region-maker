interface ColorSwatch {
  name: string
  hex: string
  className: string
}

const colors: ColorSwatch[] = [
  { name: 'Lapis Lazuli', hex: '#386595', className: 'bg-lapis-lazuli' }, // primary
  { name: 'Viridian', hex: '#287B5F', className: 'bg-viridian' }, // secondary
  { name: 'Violet Blue', hex: '#4A429E', className: 'bg-violet-blue' },
  { name: 'Night', hex: '#121716', className: 'bg-night' },
  { name: 'Zomp', hex: '#319876', className: 'bg-zomp' },
  { name: 'Gunmetal', hex: '#252C2B', className: 'bg-gunmetal' },
  { name: 'Eerie Back', hex: '#171C1C', className: 'bg-eerie-back' },
]

export function StyleGuide() {
  return (
    <div className="min-h-screen bg-night text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Region Forge Style Guide</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-lapis-lazuli">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {colors.map((color) => (
              <div
                key={color.name}
                className="bg-eerie-back rounded-lg overflow-hidden border border-gunmetal shadow-lg"
              >
                <div className={`h-32 ${color.className} flex items-center justify-center`}>
                  {(color.name === 'Night' || color.name === 'Eerie Back' || color.name === 'Gunmetal') && (
                    <div className="w-full h-full border-2 border-dashed border-white/20"></div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{color.name}</h3>
                  <p className="text-sm text-gray-400 font-mono">{color.hex}</p>
                  <div className="mt-3 flex gap-2">
                    <div className={`flex-1 h-8 ${color.className} rounded border border-gunmetal`}></div>
                    <div className={`w-8 h-8 ${color.className} rounded-full border border-gunmetal`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-lapis-lazuli">Usage Examples</h2>
          
          <div className="space-y-6">
            <div className="bg-eerie-back border border-gunmetal rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Background Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-night p-4 rounded border border-gunmetal">
                  <p className="text-white">Night Background</p>
                  <p className="text-gray-400 text-sm mt-1">Used for canvas</p>
                </div>
                <div className="bg-eerie-back p-4 rounded border border-gunmetal">
                  <p className="text-white">Eerie Back Background</p>
                  <p className="text-gray-400 text-sm mt-1">Used for panels</p>
                </div>
              </div>
            </div>

            <div className="bg-eerie-back border border-gunmetal rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Action Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-lapis-lazuli hover:bg-lapis-lazuli/80 text-white rounded-md transition-colors font-medium">
                  Lapis Lazuli Button (Primary)
                </button>
                <button className="px-6 py-3 bg-viridian hover:bg-viridian/80 text-white rounded-md transition-colors font-medium">
                  Viridian Button (Secondary)
                </button>
                <button className="px-6 py-3 bg-violet-blue hover:bg-violet-blue/80 text-white rounded-md transition-colors font-medium">
                  Violet Blue Button
                </button>
                <button className="px-6 py-3 bg-zomp hover:bg-zomp/80 text-white rounded-md transition-colors font-medium">
                  Zomp Button
                </button>
              </div>
            </div>

            <div className="bg-eerie-back border border-gunmetal rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Borders & Accents</h3>
              <div className="space-y-3">
                <div className="p-4 border border-gunmetal rounded">
                  <p className="text-white">Gunmetal Border</p>
                  <p className="text-gray-400 text-sm mt-1">Standard border color</p>
                </div>
                <div className="p-4 border-2 border-lapis-lazuli rounded">
                  <p className="text-lapis-lazuli">Lapis Lazuli Accent</p>
                  <p className="text-gray-400 text-sm mt-1">Primary color</p>
                </div>
                <div className="p-4 border-2 border-viridian rounded">
                  <p className="text-viridian">Viridian Accent</p>
                  <p className="text-gray-400 text-sm mt-1">Secondary color</p>
                </div>
                <div className="p-4 border-2 border-violet-blue rounded">
                  <p className="text-violet-blue">Violet Blue Accent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-lapis-lazuli">Typography</h2>
          <div className="bg-eerie-back border border-gunmetal rounded-lg p-6 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Heading 1</h1>
              <p className="text-gray-400 text-sm">36px / Bold / White</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Heading 2</h2>
              <p className="text-gray-400 text-sm">24px / Semibold / White</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Heading 3</h3>
              <p className="text-gray-400 text-sm">20px / Semibold / White</p>
            </div>
            <div>
              <p className="text-base text-white mb-2">Body Text</p>
              <p className="text-gray-400 text-sm">16px / Regular / White</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Secondary Text</p>
              <p className="text-gray-400 text-sm">14px / Regular / Gray-400</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Small Text</p>
              <p className="text-gray-400 text-sm">12px / Regular / Gray-500</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

