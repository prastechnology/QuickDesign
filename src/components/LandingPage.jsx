import { useEffect, useMemo, useState } from "react";
import { listSavedProjects } from "../design/localProjects.js";
import TemplateArtwork from "./TemplateArtwork";
import "./LandingPage.css";

const categories = ["All templates", "Birthday", "Business", "Wedding / Invitation", "Festival", "Social Media"];
const quickStarts = [
  { label: "Blank canvas", id: "blank", tint: "sage" },
  { label: "Birthday", id: "birthday-bloom", tint: "peach" },
  { label: "Wedding", id: "wedding-olive", tint: "sage" },
  { label: "Shop promotion", id: "business-sale", tint: "blue" },
  { label: "Restaurant", id: "business-coffee", tint: "tomato" },
  { label: "Festival", id: "festival-lights", tint: "gold" },
  { label: "Social post", id: "social-launch", tint: "lilac" },
  { label: "Real estate", id: "business-real-estate", tint: "sand" },
  { label: "Invitation", id: "invite-dinner", tint: "rose" },
];

function Arrow({ diagonal = false }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="dw-arrow"><path d={diagonal ? "M5 15 15 5M6 5h9v9" : "M3 10h13m-5-5 5 5-5 5"} /></svg>;
}

function TemplatePreview({ template, className = "" }) {
  return <TemplateArtwork template={template} className={className} />;
}

function MiniEditor({ template }) {
  return (
    <div className="dw-editor" aria-label="Preview of the simple design editor">
      <div className="dw-editor-top">
        <span className="dw-editor-brand"><i /> Dzinewallah</span>
        <span className="dw-editor-file">Untitled design <span>· Saved on this device</span></span>
        <div className="dw-editor-actions" aria-hidden="true"><span>↶</span><span>↷</span><span className="dw-download">Download</span></div>
      </div>
      <div className="dw-editor-body">
        <aside className="dw-editor-rail" aria-label="Editor tools">
          <span><b>▧</b>Templates</span>
          <span><b>T</b>Text</span>
          <span><b>◈</b>Photos</span>
          <span><b>◐</b>Background</span>
        </aside>
        <div className="dw-editor-canvas"><TemplatePreview template={template} className="dw-editor-art" /></div>
        <aside className="dw-editor-inspector">
          <strong>Make it yours</strong><span>Change the details</span>
          <label>Headline<div>{template.headline}</div></label>
          <label>Supporting text<div>{template.subline}</div></label>
          <label>Colour palette<div className="dw-swatches"><i /><i /><i /><i /></div></label>
          <span className="dw-inspector-button">Replace photo</span>
        </aside>
      </div>
      <div className="dw-editor-bottom"><span>Page 1 of 1</span><span className="dw-zoom">− &nbsp; 82% &nbsp; +</span></div>
    </div>
  );
}

function CafePreview({ templates }) {
  return (
    <div className="dw-cafe-window" aria-label="Concept preview of a future cyber cafe workspace">
      <div className="dw-cafe-sidebar">
        <div className="dw-cafe-mark"><i /> Dzinewallah</div>
        {["Overview", "Quick Create", "Customers", "Orders", "Print queue", "My designs"].map((item, index) =>
          <div className={`dw-cafe-nav ${index === 1 ? "is-active" : ""}`} key={item}><span>{["◫", "＋", "♙", "▤", "▣", "◇"][index]}</span>{item}</div>
        )}
        <div className="dw-cafe-help">A simpler way to serve every customer.</div>
      </div>
      <div className="dw-cafe-main">
        <div className="dw-cafe-greeting"><div><small>YOUR CREATIVE DESK</small><h3>What are we making today?</h3></div><span className="dw-cafe-new">+ New design</span></div>
        <div className="dw-cafe-search">⌕ &nbsp; Find a template, customer or order</div>
        <div className="dw-cafe-label">POPULAR QUICK STARTS</div>
        <div className="dw-cafe-tiles">{[
          ["Birthday poster", "birthday-bloom"], ["Wedding invite", "wedding-olive"], ["Shop promotion", "business-sale"],
          ["Festival greeting", "festival-harvest"], ["Social post", "social-launch"], ["Cafe special", "business-coffee"],
        ].map(([label, id]) => <div className="dw-cafe-tile" key={label}><div className="dw-cafe-thumb"><TemplatePreview template={templates.find(template => template.id === id) || templates[0]} /></div><span>{label}</span><b>＋</b></div>)}</div>
        <div className="dw-cafe-queue"><span><i /> Print queue</span><strong>Planned feature</strong><span className="dw-queue-line" /></div>
      </div>
    </div>
  );
}

export default function LandingPage({ templates, onCreate, onCreateBlank, onChooseTemplate, onOpenProject }) {
  const [activeCategory, setActiveCategory] = useState("All templates");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  useEffect(() => {
    setSavedProjects(listSavedProjects());
  }, []);
  const available = useMemo(() => Array.isArray(templates) ? templates : [], [templates]);
  const templateFor = (id) => available.find((template) => template.id === id) || available[0];
  const visibleTemplates = useMemo(() => available.filter(template => {
    const matchesCategory = activeCategory === "All templates" || String(template.category || "").toLowerCase().includes(activeCategory.toLowerCase().split(" / ")[0]);
    const query = search.trim().toLowerCase();
    return matchesCategory && (!query || `${template.name} ${template.category} ${template.headline}`.toLowerCase().includes(query));
  }), [available, activeCategory, search]);
  const startCreate = (template) => {
    if (onCreate) onCreate(template);
  };
  const chooseTemplate = (template) => {
    if (onChooseTemplate) onChooseTemplate(template);
    else if (onCreate) onCreate(template);
  };
  const navItems = [["Templates", "#templates"], ["Create", ""], ["Features", "#features"], ["My designs", "#my-designs"], ["For Cyber Cafes", "#cyber-cafes"]];
  const menuClick = () => setMenuOpen(false);

  return (
    <main className="dw-page">
      <header className="dw-header">
        <a href="#top" className="dw-brand" aria-label="Dzinewallah home"><span className="dw-brand-mark"><i /><i /><i /></span><span>Dzinewallah</span></a>
        <nav className={`dw-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {navItems.map(([label, href]) => href
            ? <a href={href} onClick={menuClick} key={label}>{label}</a>
            : <button type="button" onClick={() => { menuClick(); startCreate(); }} key={label}>{label}</button>)}
          <button type="button" className="dw-mobile-create" onClick={() => { menuClick(); startCreate(); }}>Make something <Arrow /></button>
        </nav>
        <div className="dw-header-right"><a href="#features" className="dw-login-link">How it works</a><button type="button" className="dw-nav-cta" onClick={() => startCreate()}>Create a design <Arrow /></button></div>
        <button className={`dw-menu-toggle ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}><span /><span /></button>
      </header>

      <section className="dw-hero" id="top">
        <div className="dw-hero-copy">
          <div className="dw-eyebrow"><span className="dw-eyebrow-line" /> GOOD DESIGN, MADE SIMPLE</div>
          <h1>Design banana<br /><em>nahi aata?</em></h1>
          <p>Bas batao kya banana hai — professional design ready.</p>
          <div className="dw-hero-actions"><button className="dw-button dw-button-primary" onClick={() => startCreate()}>Create Your Design <Arrow /></button><button className="dw-button dw-button-secondary" onClick={() => startCreate()}>Try Without Login <Arrow diagonal /></button></div>
          <div className="dw-trust"><span className="dw-trust-mark">✳</span><span>No design skills or complicated tools needed.</span></div>
          <div className="dw-proof"><span>Made for Cyber Cafes, Print Shops, Small Businesses &amp; Everyone.</span></div>
        </div>
        <div className="dw-hero-art" aria-label="A collection of finished poster and social designs">
          <div className="dw-art-orbit dw-orbit-one" /><div className="dw-art-orbit dw-orbit-two" />
          <div className="dw-hero-sticker dw-sticker-edit"><span>↗</span> Ready to make yours</div>
          <div className="dw-hero-card dw-card-main"><TemplatePreview template={templateFor("birthday-bloom")} /><span className="dw-card-caption">Birthday poster <i>Customize</i></span></div>
          <div className="dw-hero-card dw-card-wedding"><TemplatePreview template={templateFor("wedding-olive")} /><span className="dw-card-caption">Wedding invitation</span></div>
          <div className="dw-hero-card dw-card-food"><TemplatePreview template={templateFor("business-coffee")} /><span className="dw-card-caption">Restaurant offer</span></div>
          <div className="dw-hero-card dw-card-social"><TemplatePreview template={templateFor("social-menu")} /><span className="dw-card-caption">Instagram post</span></div>
          <div className="dw-floating-note"><span className="dw-note-check">✓</span><div><b>Looks like you.</b><small>Made in a few clicks</small></div></div>
          <span className="dw-art-index">01 — A FEW GOOD STARTING POINTS</span>
        </div>
        <div className="dw-hero-bottom"><span>MAKE SOMETHING GOOD</span><span>Posters&nbsp; · &nbsp;Invitations&nbsp; · &nbsp;Social&nbsp; · &nbsp;So much more</span><a href="#quick-start">SCROLL TO EXPLORE <span>↓</span></a></div>
      </section>

      <section className="dw-quick section-wrap" id="quick-start">
        <div className="dw-section-top"><div><div className="dw-kicker">A GOOD PLACE TO BEGIN</div><h2>What are you making today?</h2></div><a href="#templates" className="dw-text-link">See all templates <Arrow /></a></div>
          <div className="dw-quick-grid">
          {quickStarts.map((item, index) => {
            const template = item.id === "blank" ? { id: "blank", name: "Blank canvas" } : (templateFor(item.id) || available[index]);
            return <button type="button" className={`dw-quick-card tint-${item.tint}`} key={`${item.label}-${index}`} onClick={() => chooseTemplate(template)}>
              <span className={`dw-quick-thumb${item.id === "blank" ? " dw-blank-thumb" : ""}`}>{item.id === "blank" ? <span aria-hidden="true">＋</span> : <TemplatePreview template={template} />}</span><span className="dw-quick-label">{item.label}<i><Arrow diagonal /></i></span>
            </button>;
          })}
        </div>
      </section>

      <section className="dw-recent section-wrap" id="my-designs">
        <div className="dw-section-top"><div><div className="dw-kicker">YOUR WORK, ON THIS DEVICE</div><h2>Pick up where you left off.</h2></div><button type="button" className="dw-text-link" onClick={() => startCreate()}>New design <Arrow /></button></div>
        {savedProjects.length ? <div className="dw-recent-list">
          {savedProjects.slice(0, 6).map((project) => {
            const projectTemplate = available.find((item) => item.id === project.templateId);
            return <button type="button" className="dw-recent-card" key={project.id} onClick={() => onOpenProject?.(project)}>
              <span className="dw-recent-thumb">{projectTemplate ? <TemplatePreview template={projectTemplate} /> : <span>＋</span>}</span>
              <span className="dw-recent-info"><b>{project.title || "Untitled design"}</b><small>Saved here · {new Date(project.updatedAt).toLocaleDateString()}</small></span>
              <span className="dw-recent-open"><Arrow /></span>
            </button>;
          })}
        </div> : <div className="dw-recent-empty"><span>Designs you create here will appear on this device.</span><button type="button" onClick={() => onCreateBlank?.()}>Start with a blank canvas <Arrow /></button></div>}
      </section>

      <section className="dw-template-section" id="templates">
        <div className="dw-template-inner">
          <div className="dw-section-top dw-template-heading"><div><div className="dw-kicker">A HEAD START, NOT A BLANK PAGE</div><h2>Start with a design<br className="dw-desktop-br" /> you already love.</h2></div><p>Good-looking, ready-to-make designs for the things you do every day. Pick one, make it yours, and get on with it.</p></div>
          <div className="dw-template-controls">
            <div className="dw-filter-list" role="tablist" aria-label="Filter templates by category">
              {categories.map(category => <button type="button" role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)} key={category}>{category}</button>)}
            </div>
            <label className="dw-search"><span aria-hidden="true">⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a design" aria-label="Search templates" /><kbd>/</kbd></label>
          </div>
          {visibleTemplates.length ? <div className="dw-template-grid">
            {visibleTemplates.map((template, index) => <article className="dw-template-card" key={template.id}>
              <button type="button" className="dw-template-visual" onClick={() => chooseTemplate(template)} aria-label={`Use ${template.name}`}>
                <TemplatePreview template={template} />
                <span className="dw-use-overlay">Customize this <Arrow diagonal /></span>
                <span className="dw-template-number">{String(index + 1).padStart(2, "0")}</span>
              </button>
              <div className="dw-template-meta"><div><span>{template.category}</span><h3>{template.name}</h3></div><button type="button" className="dw-template-use" onClick={() => chooseTemplate(template)}>Use this design <Arrow /></button></div>
            </article>)}
          </div> : <div className="dw-empty-state"><span>Nothing in this little corner yet.</span><p>Try another search or browse all templates.</p><button type="button" onClick={() => { setSearch(""); setActiveCategory("All templates"); }}>Show all templates</button></div>}
          <div className="dw-template-foot"><span>25 starting points, plenty of ways to make them yours.</span><a href="#create">Have an idea? Start making <Arrow /></a></div>
        </div>
      </section>

      <section className="dw-editor-section section-wrap" id="features">
        <div className="dw-editor-copy"><div className="dw-kicker">YOUR IDEA, WITH A LITTLE HELP</div><h2>Simple enough<br />for <em>anyone.</em></h2><p>Start with a balanced design. Change the words, photos and colours. The layout does the hard work.</p>
          <ul className="dw-editor-points"><li><span>01</span><div><b>Everything in its place</b><small>Thoughtful layouts that look good from the start.</small></div></li><li><span>02</span><div><b>Your details, your design</b><small>Make the words, colours and image feel like yours.</small></div></li><li><span>03</span><div><b>Ready when you are</b><small>Preview and make it yours at your own pace.</small></div></li></ul>
          <button className="dw-button dw-button-dark" onClick={() => startCreate()}>Try a design <Arrow /></button>
        </div>
          <div className="dw-editor-showcase"><div className="dw-window-label"><span><i /><i /><i /></span><span>THE SIMPLE DESIGN EDITOR</span><span>PREVIEW</span></div><MiniEditor template={templateFor("business-studio")} /><div className="dw-editor-callout"><span>1</span> Change a few details. The design stays balanced.</div></div>
      </section>

      <section className="dw-steps-section">
        <div className="dw-steps-heading"><div className="dw-kicker">THREE LITTLE STEPS</div><h2>From idea to<br />finished design.</h2><p>No tutorials to sit through. No complicated tools to learn. Just a simple way to get it done.</p></div>
        <div className="dw-steps">
          {[
            { n: "01", title: "Choose a template", sub: "Find a starting point that feels right.", t: templateFor("wedding-olive"), kind: "step-template" },
            { n: "02", title: "Add your details", sub: "A name, a date, a few words of your own.", t: templateFor("wedding-olive"), kind: "step-form" },
            { n: "03", title: "Make it yours", sub: "Give it a final look. You're ready.", t: templateFor("wedding-olive"), kind: "step-finish" },
          ].map(step => <article className="dw-step" key={step.n}>
            <div className={`dw-step-visual ${step.kind}`}>
          {step.kind === "step-form" ? <div className="dw-mini-form"><span>YOUR INVITATION</span><b>Make it personal</b><label>The names<div>Maya &amp; James</div></label><label>When<div>Saturday, 14 June</div></label><span className="dw-mini-submit">Update design ↗</span></div> :
                <TemplatePreview template={step.t} className="dw-step-art" />}
              {step.kind === "step-template" && <span className="dw-step-tag">A good starting point</span>}
              {step.kind === "step-finish" && <span className="dw-step-tag dw-finish-tag">Ready to share <b>✓</b></span>}
            </div><div className="dw-step-caption"><span>{step.n}</span><div><h3>{step.title}</h3><p>{step.sub}</p></div></div>
          </article>)}
        </div>
      </section>

      <section className="dw-comparison section-wrap">
        <div className="dw-compare-title"><div className="dw-kicker">LESS FUSS, MORE MAKING</div><h2>No blank-canvas<br />panic.</h2><p>Professional design tools can feel like a lot when you just need to make something good.</p></div>
        <div className="dw-compare-visual">
          <div className="dw-workflow dw-old-way"><div className="dw-workflow-head"><span className="dw-xmark">×</span><div><small>THE LONG WAY</small><h3>Where do I even start?</h3></div></div><div className="dw-layer-stack"><div className="dw-layer-canvas"><div className="dw-layer-empty">Your canvas<br /><span>Everything is up to you.</span></div></div><div className="dw-layer-list">{["Layer 04 · type", "Layer 03 · image", "Layer 02 · shape", "Layer 01 · background"].map((x, i) => <span key={x}><i>{i + 1}</i>{x}<b>⋮</b></span>)}</div></div><div className="dw-workflow-tags"><span>Fonts?</span><span>Alignment?</span><span>Export settings?</span></div></div>
          <div className="dw-compare-connector"><span>OR,</span><i>→</i></div>
          <div className="dw-workflow dw-new-way"><div className="dw-workflow-head"><span className="dw-checkmark">✓</span><div><small>THE DZINEWALLAH WAY</small><h3>That was easy.</h3></div></div><div className="dw-easy-preview"><TemplatePreview template={templateFor("business-sale")} /></div><div className="dw-easy-steps"><span><b>01</b> Choose</span><i>→</i><span><b>02</b> Fill</span><i>→</i><span><b>03</b> Make yours</span><i>→</i><span><b>04</b> Done</span></div></div>
        </div>
      </section>

      <section className="dw-cafe-section" id="cyber-cafes">
        <div className="dw-cafe-content"><div className="dw-cafe-copy"><div className="dw-kicker">CYBER CAFE WORKSPACE · COMING SOON</div><h2>A simpler workspace for people who make designs for <em>everyone else.</em></h2><p>We’re shaping a focused workspace for cyber cafes, print shops and small design businesses. The guest editor works now; customer, order and print-queue tools are not connected yet.</p>
            <div className="dw-cafe-benefits"><div><span>↗</span><b>Quick starts</b><small>Planned for frequent jobs.</small></div><div><span>▤</span><b>Orders & print queue</b><small>Planned workspace tools.</small></div><div><span>♡</span><b>Made for real people</b><small>Designed for everyday users.</small></div></div>
            <span className="dw-button dw-cafe-button dw-coming-soon">Cyber Cafe Mode · Coming soon</span>
          </div><div className="dw-cafe-visual"><CafePreview templates={available} /><div className="dw-cafe-sticker">A good day<br /><b>starts here.</b> <span>✳</span></div></div>
        </div>
      </section>

      <section className="dw-final-cta" id="create">
        <div className="dw-final-art"><div className="dw-final-poster dw-final-one"><TemplatePreview template={templateFor("festival-lights")} /></div><div className="dw-final-poster dw-final-two"><TemplatePreview template={templateFor("business-sale")} /></div><div className="dw-final-poster dw-final-three"><TemplatePreview template={templateFor("social-menu")} /></div><div className="dw-final-orbit" /></div>
        <div className="dw-final-copy"><div className="dw-kicker">GO ON, MAKE SOMETHING</div><h2>Your idea looks<br /><em>good already.</em></h2><p>Pick a design, add your details and see where it goes.</p><button className="dw-button dw-button-primary" onClick={() => startCreate()}>Create Your Design <Arrow /></button><span>Drafts save on this device. Account sync is coming soon.</span></div>
      </section>

      <section className="dw-faq section-wrap" id="faq">
        <div className="dw-faq-heading"><div className="dw-kicker">A FEW USEFUL DETAILS</div><h2>Good questions.</h2></div>
        <div className="dw-faq-list">
          <details><summary>Can I start designing without an account?</summary><p>Yes. Choose a template and edit it right away. Your draft is saved in this browser on this device.</p></details>
          <details><summary>Can I download my design?</summary><p>Yes. The editor can export a PNG or JPG file. Google sign-in and permanent account saving are not connected in this preview.</p></details>
          <details><summary>Can I reopen a design on another device?</summary><p>Not yet. Drafts currently stay in this browser; account-based cloud saving is still to be connected.</p></details>
          <details><summary>Is Cyber Cafe Mode ready?</summary><p>Not yet. The cafe workspace shown above is a concept preview; customer, order and print-queue tools are coming later.</p></details>
        </div>
      </section>

      <footer className="dw-footer">
        <a href="#top" className="dw-brand dw-footer-brand"><span className="dw-brand-mark"><i /><i /><i /></span><span>Dzinewallah</span></a>
        <p>A little help for the things you want to make.</p>
        <div className="dw-footer-links"><a href="#templates">Templates</a><a href="#create">Create</a><a href="#features">How it works</a><a href="#cyber-cafes">For cyber cafes</a><a href="#faq">FAQ</a></div>
        <span className="dw-copyright">Made for making things. © 2026 Dzinewallah</span>
      </footer>
    </main>
  );
}
