/* Kretia — Tweaks island. Applies curated brand directions + accent + display weight
   to <html> via data-direction and CSS variables. Page content stays static HTML. */

const KRETIA_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "mint",
  "accent": "#8A4FFF",
  "displayWeight": "800",
  "grain": true
}/*EDITMODE-END*/;

function KretiaTweaks() {
  const [t, setTweak] = useTweaks(KRETIA_TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-direction', t.direction);
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--display-weight', String(t.displayWeight));
    if (!t.grain) root.style.setProperty('--grain', '0');
    else root.style.removeProperty('--grain');
  }, [t.direction, t.accent, t.displayWeight, t.grain]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Dirección" />
      <TweakRadio
        label="Look"
        value={t.direction}
        options={['mint', 'lavender', 'dark']}
        onChange={(v) => setTweak('direction', v)}
      />
      <TweakSection label="Marca" />
      <TweakColor
        label="Violeta"
        value={t.accent}
        options={['#8A4FFF', '#6E34F0', '#A77BFF', '#5B3BD6']}
        onChange={(v) => setTweak('accent', v)}
      />
      <TweakRadio
        label="Peso titulares"
        value={t.displayWeight}
        options={['700', '800']}
        onChange={(v) => setTweak('displayWeight', v)}
      />
      <TweakToggle
        label="Textura (grain)"
        value={t.grain}
        onChange={(v) => setTweak('grain', v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<KretiaTweaks />);
