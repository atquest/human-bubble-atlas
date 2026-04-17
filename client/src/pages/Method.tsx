import { Link } from 'wouter';
import { ArrowLeft, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { DIMENSIONS } from '../lib/dimensions';

const CONFIDENCE_META = {
  high: { label: 'Hoog', color: 'text-[hsl(var(--primary))]', desc: 'Gebaseerd op breed geaccepteerd wetenschappelijk onderzoek.' },
  medium: { label: 'Middel', color: 'text-[hsl(var(--accent))]', desc: 'Gebaseerd op zachte schattingen of modelmatige vertalingen.' },
  low: { label: 'Laag', color: 'text-muted-foreground', desc: 'Indicatief, niet empirisch goed onderbouwd.' },
};

export default function Method() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-4">
        <Link href="/">
          <a className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back">
            <ArrowLeft size={16} />
            Terug naar de kaart
          </a>
        </Link>
        <div className="w-px h-4 bg-border" />
        <h1 className="text-sm font-semibold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Methode & Verantwoording</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-12">

        {/* Core framing */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Wat is dit?</h2>
          <p className="text-base text-foreground/80 leading-relaxed">
            Human Bubble Atlas is een <strong>exploratieve visualisatietool</strong>, geen diagnose-instrument.
            De centrale vraag die het probeert te beantwoorden is: <em>"Als ik deze eigenschappen heb, hoe ver zit ik dan van de statistische middenmens — en met welke clusters van mensen heb ik de meeste overlap?"</em>
          </p>
          <p className="text-base text-foreground/80 leading-relaxed">
            De visualisaties zijn bedoeld om menselijke variatie begrijpelijk te maken. Ze zijn niet bedoeld als persoonlijkheidstest, klinische screening of biologische indeling van mensen.
          </p>
        </section>

        {/* Datamodel layers */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Drie lagen data</h2>
          <div className="grid gap-4">
            {[
              {
                icon: <CheckCircle2 size={18} className="text-[hsl(var(--primary))]" />,
                title: 'Harde verdelingen',
                body: 'Voor goed onderzochte eigenschappen zoals persoonlijkheidstrekken (Big Five) gebruiken we gestandaardiseerde distributies uit groot psychologisch onderzoek.',
              },
              {
                icon: <Info size={18} className="text-[hsl(var(--accent))]" />,
                title: 'Zachte schattingen',
                body: 'Voor constructen als routinebehoefte, normgerichtheid en autonomiebehoeften gebruiken we modelmatige benaderingen. De schalen zijn indicatief, geen universele meetlat.',
              },
              {
                icon: <AlertTriangle size={18} className="text-muted-foreground" />,
                title: 'Afgeleide clusters',
                body: 'Clusters zijn berekende zones in de visualisatieruimte — geen biologisch echte mensensoorten. Ze helpen patronen te zien, maar zijn vereenvoudigingen van een continu spectrum.',
              },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <p className="font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dimensions */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Dimensies</h2>
          <div className="flex flex-col divide-y divide-border">
            {DIMENSIONS.map(dim => {
              const conf = CONFIDENCE_META[dim.confidenceLevel];
              return (
                <div key={dim.id} className="py-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-sm">{dim.label}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/[0.05] ${conf.color}`}>
                      {conf.label}
                    </span>
                    {dim.cultureSensitive && (
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-white/[0.05]">
                        Cultuurgevoelig
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{dim.description}</p>
                  <p className="text-xs text-muted-foreground italic">Bron: {dim.source}</p>
                  <p className="text-xs text-muted-foreground">{conf.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* What this is NOT */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Wat dit niet is</h2>
          <div className="grid gap-3">
            {[
              'Een diagnose-tool of vervanging voor klinische beoordeling.',
              'Een bewijs dat mensen in vaste typen of "mensensoorten" vallen.',
              'Een uitspraak over morele waarde: statistisch frequent ≠ beter.',
              'Een absolute meting — zelfinschatting is ruisgevoelig.',
              'Cultureel universeel: normgerichtheid en routinebehoeften variëren sterk per context.',
            ].map(item => (
              <div key={item} className="flex gap-3 items-start">
                <XCircle size={15} className="text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compute model */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Rekenmodel</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sliderwaarden (0–100) worden genormaliseerd. De X-as in de Bubble Map representeert autonomie
            (hoge normgerichtheid = links, hoog open + laag normgericht = rechts). De Y-as representeert
            exploratie versus routinegerichtheid.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Clusteroverlap wordt berekend als de genormaliseerde afstand in de 8-dimensionele ruimte.
            Overlap van 0% = geen overeenkomst; 100% = identiek aan het clustercentrum.
            Afstand tot de mediaan is een Euclidische maat over alle dimensies, geschaald naar 0–100.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Percentielen zijn benaderingen op basis van een normale verdeling met standaarddeviatie ≈ 20.
            Dit zijn indicaties, geen empirisch vastgestelde populatiewaarden.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-xs text-muted-foreground border-t border-border pt-6">
          Human Bubble Atlas — open-source verkenner van menselijke variatie.
          Geen medische claims. Gebruik verantwoord.
        </footer>
      </main>
    </div>
  );
}
