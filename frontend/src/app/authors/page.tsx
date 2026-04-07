import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

const AUTHOR_GROUPS: Record<string, string[]> = {
  A: ['Aragon, Lianne Marie'],
  B: ['Bautista, Noel Vincent', 'Bernardo, Keziah Mae'],
  C: ['Cabrera, Eliseo Miguel'],
  D: ['Del Rosario, Andrea Nicole', 'Domingo, Ryan Paolo'],
  E: ['Enriquez, Tricia Anne'],
  F: ['Flores, Mateo Gabriel'],
  G: ['Gonzales, Patricia Lou'],
  H: ['Hernandez, Joaquin Luis'],
  I: [],
  J: ['Javier, Danielle Cruz'],
  K: ['King, Marcus Allen'],
  L: ['Lim, Sophia Therese'],
  M: ['Mendoza, Zachary Cole'],
  N: ['Navarro, Elena Faith'],
  O: ['Ocampo, Andre Luis'],
  P: ['Pineda, Carissa Joy'],
  Q: ['Quimson, Rafael Jude'],
  R: ['Ramos, Isabelle Grace'],
  S: ['Santos, Dominic Kyle'],
  T: ['Torres, Bianca Camille'],
  U: [],
  V: ['Valdez, Hannah Paige'],
  W: ['Wu, Cedric James'],
  X: [],
  Y: ['Yu, Clarisse Anne'],
  Z: ['Zamora, Miguel Andres'],
}

const LETTERS = Object.keys(AUTHOR_GROUPS)

export default function AuthorsPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="Author"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Authors' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-8">
          <p className="font-body text-[14px] leading-[28px] text-[#555] mb-4">
            Browse contributors alphabetically. Click a name to view author materials.
          </p>

          <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-5">
            <h1 className="font-heading text-[32px] leading-[30px] text-[#555]">Browse by Author</h1>
            <div className="absolute left-0 bottom-[-1px] h-[3px] w-[95px] bg-[#f3aa2c] rounded-tr-[5px] rounded-br-[5px]" />
          </div>

          <div className="border border-[#d8d8d8] bg-[#f4f4f4] p-3 flex flex-wrap gap-x-3 gap-y-1 mb-6">
            {LETTERS.map((letter) => (
              <a key={letter} href={`#author-${letter}`} className="font-body text-[30px] leading-none text-cics-maroon hover:underline no-underline">
                {letter}
              </a>
            ))}
          </div>

          <div className="space-y-6">
            {LETTERS.map((letter) => {
              const names = AUTHOR_GROUPS[letter]

              return (
                <section key={letter} id={`author-${letter}`} className="scroll-mt-24">
                  <h2 className="font-heading text-[36px] text-cics-maroon leading-none mb-2">{letter}</h2>
                  {names.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {names.map((name) => (
                        <a
                          key={name}
                          href="/search"
                          className="font-body text-[15px] text-cics-maroon hover:underline w-fit"
                        >
                          {name}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-[13px] text-[#888]">No authors indexed.</p>
                  )}
                </section>
              )
            })}
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}