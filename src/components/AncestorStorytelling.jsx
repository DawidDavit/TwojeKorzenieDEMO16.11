import React from 'react';
import {
  MapPin,
  Calendar,
  BookOpen,
  ScrollText,
  Camera,
  Users,
  ZoomIn,
  ShieldCheck,
  Award,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { AncestorPortrait, ArchivalDocumentScan } from './HeritageVisuals';
import { GoogleHeritageMap } from './GoogleMapsComponents';

export default function AncestorStorytelling({
  ancestor,
  allAncestors,
  documents,
  onSelectAncestor,
  onOpenDocumentLightbox,
  onBackToTree
}) {
  const person = ancestor || allAncestors[0];
  if (!person) {
    return (
      <div className="heritage-card animate-fade-in" style={{ padding: 'clamp(2rem, 4vw, 3.25rem)', textAlign: 'center', maxWidth: '720px', margin: '1rem auto', border: '1.5px solid var(--gold-base)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--forest-soft)',
            border: '1.5px solid var(--gold-base)',
            color: 'var(--forest-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.1rem'
          }}
        >
          <BookOpen size={28} aria-hidden="true" />
        </div>
        <span className="gold-badge" style={{ marginBottom: '0.75rem' }}>
          <Sparkles size={13} aria-hidden="true" /> Historia Rodziny (Storytelling)
        </span>
        <h2 style={{ fontSize: 'clamp(1.55rem, 2.5vw, 2.1rem)', color: 'var(--forest-base)', marginBottom: '0.75rem' }}>
          Twoja kronika rodzinna czeka na pierwsze wpisy
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 1.6rem' }}>
          W Twoim prywatnym archiwum nie ma jeszcze zapisanych przodków. Dodaj pierwszą wskazówkę rodzinną na mapie drzewa lub poczekaj, aż nasz genealog wgra zweryfikowane metryki — w tym miejscu pojawi się pełna biografia, oś życia oraz mapa migracji.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem' }}>
          <button type="button" onClick={onBackToTree} className="btn-primary">
            <ArrowLeft size={17} aria-hidden="true" />
            <span>Przejdź do Drzewa i dodaj wskazówkę</span>
          </button>
        </div>
      </div>
    );
  }

  // Powiązania rodzinne
  const parents = allAncestors.filter((a) => (person.parentIds || []).includes(a.id));
  const spouse = allAncestors.find((a) => a.id === person.spouseId);
  const siblings = allAncestors.filter((a) => (person.siblingIds || []).includes(a.id));
  const children = allAncestors.filter((a) => (person.childrenIds || []).includes(a.id));

  // Dokumenty powiązane z tym przodkiem (lub wszystkie powiązane z linią rodową)
  const linkedDocs = documents.filter(
    (d) => d.ancestorId === person.id || d.ancestorName.toLowerCase().includes(person.lastName.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Górny pasek wyboru przodka do Storytellingu */}
      <div
        className="heritage-card"
        style={{
          padding: '1.1rem 1.4rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onBackToTree}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Powrót do mapy drzewa
          </button>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Wybierz postać do opowieści:
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {allAncestors.map((item) => {
            const active = item.id === person.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectAncestor(item)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                  border: active ? '1.5px solid #C29A55' : '1px solid var(--ivory-border)',
                  backgroundColor: active ? 'var(--forest-base)' : 'var(--ivory-base)',
                  color: active ? 'var(--ivory-base)' : 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                {item.firstName} {item.lastName} ({item.birthYear})
              </button>
            );
          })}
        </div>
      </div>

      {/* GŁÓWNA KARTA PORTRETOWA PRZODKA (Hero Biografii) */}
      <div
        className="forest-surface"
        style={{
          borderRadius: '26px',
          padding: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          border: '2px solid var(--gold-base)',
          boxShadow: 'var(--shadow-elevated)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
            <AncestorPortrait ancestor={person} size={126} />
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span className="gold-badge-dark">
                  <Sparkles size={13} /> {person.generationLabel}
                </span>
                {person.coatOfArms && (
                  <span className="gold-badge-dark">
                    <Award size={13} /> Herb: {person.coatOfArms}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.65rem)', color: '#F3EFE5', marginBottom: '0.35rem' }}>
                {person.firstName} {person.lastName}
                {person.maidenName && (
                  <span style={{ fontSize: '1.25rem', fontWeight: 400, color: '#E5C98F', display: 'block' }}>
                    z domu {person.maidenName}
                  </span>
                )}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', color: '#D7E0DA', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} color="#C29A55" />
                  <strong>Lata życia:</strong> {person.birthDate} – {person.deathDate}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} color="#C29A55" />
                  <strong>Pochodzenie:</strong> {person.birthPlace} ({person.region})
                </span>
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: '#E5C98F', fontWeight: 500 }}>
                Powołanie i profesja: {person.profession}
              </div>
            </div>
          </div>

          {/* Pieczęć źródła weryfikacji */}
          <div
            style={{
              backgroundColor: 'rgba(243, 239, 229, 0.08)',
              border: '1px solid rgba(194, 154, 85, 0.45)',
              borderRadius: '18px',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E5C98F', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <ShieldCheck size={17} /> Źródło Weryfikacji Archiwalnej
            </div>
            <p style={{ fontSize: '0.9rem', color: '#F3EFE5', marginBottom: '0.65rem' }}>
              {person.verificationSource}
            </p>
            <div style={{ fontSize: '0.78rem', color: '#C9D5CE' }}>
              Rola w drzewie: <strong>{person.role}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* UKŁAD DWUKOLUMNOWY: OPOWIEŚĆ CHRONOLOGICZNA + MAPA MIEJSC ZAMIESZKANIA I POWIĄZANIA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Lewa kolumna: Chronologiczna opowieść o życiu i Oś Czasu Przodka */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="heritage-card" style={{ padding: '2rem' }}>
            <div className="gold-badge" style={{ marginBottom: '0.75rem' }}>
              <BookOpen size={14} /> Opowieść Biograficzna
            </div>
            <h2 style={{ fontSize: '1.65rem', color: 'var(--forest-base)', marginBottom: '1.15rem' }}>
              Historia życia i dziedzictwo
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {(person.storyParagraphs || []).map((para, index) => (
                <p
                  key={index}
                  style={{
                    fontSize: '1.04rem',
                    lineHeight: 1.8,
                    color: 'var(--text-primary)',
                    fontFamily: index === 0 ? 'var(--font-serif)' : 'var(--font-sans)'
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          </section>

          {/* Oś czasu życia przodka */}
          <section className="heritage-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.45rem', color: 'var(--forest-base)', marginBottom: '1.25rem' }}>
              Chronologiczna oś życia ({person.birthYear}–{person.deathYear || '2026'})
            </h3>
            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--gold-base)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(person.lifeEvents || []).map((ev, idx) => (
                <div key={idx} className="timeline-milestone" style={{ '--stagger-index': idx, position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.95rem',
                      top: '0.25rem',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--forest-base)',
                      border: '3px solid var(--gold-base)'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', color: '#9E7836' }}>
                      {ev.year}
                    </span>
                    <span style={{ fontSize: '0.78rem', backgroundColor: 'var(--ivory-muted)', padding: '0.15rem 0.6rem', borderRadius: '999px', fontWeight: 600 }}>
                      {ev.place}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--forest-base)', fontSize: '1rem' }}>{ev.title}</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{ev.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Prawa kolumna: Mapa Historyczna Miejsc Zamieszkania + Powiązania Rodzinne */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Interaktywna Mapa Google Maps Miejsc Zamieszkania */}
          <section className="heritage-card" style={{ padding: '1.75rem' }}>
            <div className="gold-badge" style={{ marginBottom: '0.6rem' }}>
              <MapPin size={14} /> Kartografia Historyczna • Google Maps
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--forest-base)', marginBottom: '0.9rem' }}>
              Miejsca zamieszkania i szlak życia na mapie
            </h3>

            <GoogleHeritageMap person={person} />
          </section>

          {/* Informacje o rodzicach, rodzeństwie, małżonku i dzieciach */}
          <section className="heritage-card" style={{ padding: '1.75rem' }}>
            <div className="gold-badge" style={{ marginBottom: '0.6rem' }}>
              <Users size={14} /> Więzi Rodzinne
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--forest-base)', marginBottom: '1rem' }}>
              Rodzice, małżonek, rodzeństwo i dzieci
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Rodzice:
                </div>
                {parents.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {parents.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelectAncestor(p)}
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem' }}
                      >
                        {p.firstName} {p.lastName} ({p.birthYear}) →
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Wcześniejsze pokolenie w trakcie kwerendy parafialnej (XVIII/XIX w.)
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Małżonek / Małżonka:
                </div>
                {spouse ? (
                  <button
                    type="button"
                    onClick={() => onSelectAncestor(spouse)}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem' }}
                  >
                    {spouse.firstName} {spouse.lastName} ({spouse.birthYear}) →
                  </button>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brak przypisanego rekordu w bieżącym widoku</div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Rodzeństwo i Dzieci:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[...siblings, ...children].length > 0 ? (
                    [...siblings, ...children].map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => onSelectAncestor(rel)}
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem' }}
                      >
                        {rel.firstName} {rel.lastName} ({rel.role}) →
                      </button>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Zobacz powiązania na głównej mapie drzewa</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* DOKUMENTY ARCHIWALNE I FOTOGRAFIE RODZINNE PRZODKA (Z powiększaniem) */}
      <section className="heritage-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="gold-badge" style={{ marginBottom: '0.4rem' }}>
              <ScrollText size={14} /> Skany Dokumentów i Fotografii
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--forest-base)' }}>
              Dokumenty archiwalne i pamiątki powiązane z tą postacią
            </h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Kliknij „Powiększ dokument”, aby otworzyć lupę archiwalną i pełną transkrypcję
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {linkedDocs.map((doc) => (
            <div
              key={doc.id}
              className="archival-doc-card"
              style={{
                backgroundColor: 'var(--ivory-base)',
                borderRadius: '18px',
                padding: '1.2rem',
                border: '1px solid var(--ivory-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <ArchivalDocumentScan doc={doc} compact />
                <div style={{ marginTop: '0.9rem' }}>
                  <span className="gold-badge" style={{ fontSize: '0.7rem' }}>{doc.category}</span>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--forest-base)', marginTop: '0.4rem' }}>
                    {doc.title}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    {doc.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDocumentLightbox(doc)}
                className="btn-primary"
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.88rem' }}
              >
                <ZoomIn size={16} />
                <span>Powiększ dokument i zobacz transkrypcję</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
