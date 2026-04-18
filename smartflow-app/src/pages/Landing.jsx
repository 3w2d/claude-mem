import React from 'react';
import { C, F, GRAIN } from '../lib/theme.js';
import IrtahMark from '../components/IrtahMark.jsx';
import { I } from '../components/Icons.jsx';
import { useT } from '../lib/i18n.js';

function Section({ id, children, style }) {
  return (
    <section
      id={id}
      style={{
        padding: '64px 24px',
        maxWidth: 1120,
        margin: '0 auto',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div
      style={{
        background: C.paper,
        border: `1px solid ${C.sand200}`,
        borderRadius: 20,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 1px 2px rgba(61,53,43,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(61,53,43,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(61,53,43,0.04)';
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: C.terra50,
          color: C.terra500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 700, color: C.ink900, margin: 0 }}>{title}</h3>
      <p style={{ fontFamily: F.ui, fontSize: 14, color: C.ink600, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

function ScreenshotCard({ title, children, accent = C.terra50 }) {
  return (
    <div
      style={{
        background: accent,
        border: `1px solid ${C.sand200}`,
        borderRadius: 24,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 280,
        boxShadow: '0 6px 20px rgba(61,53,43,0.06)',
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.terra600 }}>
        {title}
      </div>
      <div
        style={{
          background: C.paper,
          borderRadius: 16,
          padding: 16,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          border: `1px solid ${C.sand200}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MockStat({ value, label, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 6px', background: C.sand50, borderRadius: 12 }}>
      <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: F.ui, fontSize: 10, color: C.sand500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MockTask({ text, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: C.sand50, borderRadius: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontFamily: F.ui, fontSize: 12, color: C.ink700, flex: 1 }}>{text}</span>
    </div>
  );
}

export default function Landing({ onEnter, onBack }) {
  const { t, dir, lang, setLang } = useT();

  const features = [
    { icon: I.files, title: t('landing.feat.files.title'), desc: t('landing.feat.files.desc') },
    { icon: I.cal, title: t('landing.feat.schedule.title'), desc: t('landing.feat.schedule.desc') },
    { icon: I.tasks, title: t('landing.feat.tasks.title'), desc: t('landing.feat.tasks.desc') },
    { icon: I.ai, title: t('landing.feat.ai.title'), desc: t('landing.feat.ai.desc') },
    { icon: I.bell, title: t('landing.feat.notify.title'), desc: t('landing.feat.notify.desc') },
    { icon: I.settings, title: t('landing.feat.security.title'), desc: t('landing.feat.security.desc') },
  ];

  return (
    <div
      dir={dir}
      style={{
        fontFamily: F.ui,
        color: C.ink900,
        minHeight: '100vh',
        background: C.sand50,
        position: 'relative',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,252,245,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.sand200}`,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <IrtahMark size={32} />
            <span style={{ fontFamily: F.display, fontSize: 24, fontWeight: 600, color: C.ink900 }}>
              {lang === 'ar' ? 'ارتَح' : 'Irtah'}
            </span>
          </button>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 14 }} className="nav-links">
            <a href="#features" style={navLink}>{t('landing.nav.features')}</a>
            <a href="#screens" style={navLink}>{t('landing.nav.screens')}</a>
            <a href="#contact" style={navLink}>{t('landing.nav.contact')}</a>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                background: C.sand100,
                border: `1px solid ${C.sand200}`,
                padding: '6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                color: C.ink700,
              }}
            >
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>
            <button
              onClick={onEnter}
              style={{
                fontFamily: F.ui,
                background: C.terra500,
                color: C.paper,
                border: 'none',
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('landing.cta.open')}
            </button>
          </nav>
        </div>
      </header>

      <Section style={{ paddingTop: 80, paddingBottom: 40 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: C.terra50,
                color: C.terra600,
                padding: '6px 12px',
                borderRadius: 999,
                fontFamily: F.mono,
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.terra500 }} />
              {t('landing.hero.eyebrow')}
            </div>
            <h1
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 600,
                lineHeight: 1.1,
                color: C.ink900,
                margin: 0,
              }}
            >
              {t('landing.hero.title')}
            </h1>
            <p
              style={{
                fontFamily: F.ui,
                fontSize: 17,
                color: C.ink600,
                lineHeight: 1.8,
                marginTop: 18,
                maxWidth: 520,
              }}
            >
              {t('landing.hero.subtitle')}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <button
                onClick={onEnter}
                style={{
                  fontFamily: F.ui,
                  background: C.terra500,
                  color: C.paper,
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(184,82,46,0.25)',
                }}
              >
                {t('landing.cta.start')}
              </button>
              <a
                href="#features"
                style={{
                  fontFamily: F.ui,
                  background: C.paper,
                  color: C.ink900,
                  border: `1px solid ${C.sand300}`,
                  borderRadius: 12,
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {t('landing.cta.learn')}
              </a>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color: C.terra500 }}>100%</div>
                <div style={{ fontFamily: F.ui, fontSize: 12, color: C.ink600 }}>{t('landing.stat.local')}</div>
              </div>
              <div>
                <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color: C.ai500 }}>AI</div>
                <div style={{ fontFamily: F.ui, fontSize: 12, color: C.ink600 }}>{t('landing.stat.ai')}</div>
              </div>
              <div>
                <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color: C.moss }}>AR/EN</div>
                <div style={{ fontFamily: F.ui, fontSize: 12, color: C.ink600 }}>{t('landing.stat.bilingual')}</div>
              </div>
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -30,
                background: `radial-gradient(circle at center, ${C.terra100} 0%, transparent 70%)`,
                filter: 'blur(30px)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'relative',
                width: 280,
                height: 560,
                background: C.ink900,
                borderRadius: 40,
                padding: 10,
                boxShadow: '0 30px 60px rgba(28,24,20,0.25)',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  background: C.sand50,
                  borderRadius: 32,
                  height: '100%',
                  padding: 16,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  backgroundImage: GRAIN,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: C.ink900 }}>
                      {t('dash.hello')}
                    </div>
                    <div style={{ fontFamily: F.ui, fontSize: 10, color: C.sand500 }}>
                      {lang === 'ar' ? 'الأربعاء • ١٨ أبريل' : 'Wed • Apr 18'}
                    </div>
                  </div>
                  <IrtahMark size={28} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <MockStat value={lang === 'ar' ? '١٢' : '12'} label={t('dash.stat.files')} color={C.terra500} />
                  <MockStat value={lang === 'ar' ? '٣' : '3'} label={t('dash.stat.events')} color={C.sky} />
                  <MockStat value={lang === 'ar' ? '٥' : '5'} label={t('dash.stat.pending')} color={C.medium} />
                </div>
                <div
                  style={{
                    background: C.paper,
                    border: `1px solid ${C.sand200}`,
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: C.ai500 }}>
                    {I.sparkle}
                    <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 600, color: C.ink900 }}>
                      {t('landing.mock.aiTitle')}
                    </span>
                  </div>
                  <p style={{ fontFamily: F.ui, fontSize: 11, color: C.ink700, lineHeight: 1.7, margin: 0 }}>
                    {t('landing.mock.aiLine')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <MockTask text={t('landing.mock.task1')} color={C.urgent} />
                  <MockTask text={t('landing.mock.task2')} color={C.medium} />
                  <MockTask text={t('landing.mock.task3')} color={C.moss} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="features" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.terra500, marginBottom: 10 }}>
            {t('landing.features.eyebrow')}
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 600, margin: 0 }}>
            {t('landing.features.title')}
          </h2>
          <p style={{ fontFamily: F.ui, fontSize: 16, color: C.ink600, marginTop: 12, maxWidth: 620, marginInline: 'auto' }}>
            {t('landing.features.subtitle')}
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </Section>

      <Section id="screens">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.terra500, marginBottom: 10 }}>
            {t('landing.screens.eyebrow')}
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 600, margin: 0 }}>
            {t('landing.screens.title')}
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          <ScreenshotCard title={t('landing.screens.dash')} accent={C.terra50}>
            <div style={{ display: 'flex', gap: 6 }}>
              <MockStat value="١٢" label={t('dash.stat.files')} color={C.terra500} />
              <MockStat value="٣" label={t('dash.stat.events')} color={C.sky} />
              <MockStat value="٥" label={t('dash.stat.pending')} color={C.medium} />
            </div>
            <MockTask text={t('landing.mock.task1')} color={C.urgent} />
            <MockTask text={t('landing.mock.task2')} color={C.medium} />
          </ScreenshotCard>
          <ScreenshotCard title={t('landing.screens.ai')} accent={C.ai50}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.ai500 }}>
              {I.sparkle}
              <span style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, color: C.ink900 }}>
                {t('ai.title')}
              </span>
            </div>
            <div style={{ background: C.ai50, borderRadius: 10, padding: 10, fontFamily: F.ui, fontSize: 11, color: C.ink700 }}>
              {t('landing.mock.aiLine')}
            </div>
            <div style={{ background: C.sand50, borderRadius: 10, padding: 10, fontFamily: F.ui, fontSize: 11, color: C.ink700, alignSelf: dir === 'rtl' ? 'flex-start' : 'flex-end' }}>
              {t('landing.mock.userLine')}
            </div>
          </ScreenshotCard>
          <ScreenshotCard title={t('landing.screens.schedule')} accent="#e3ecf3">
            <div style={{ fontFamily: F.ui, fontSize: 11, color: C.ink700, fontWeight: 600 }}>
              {lang === 'ar' ? 'الأربعاء ١٨ أبريل' : 'Wed, Apr 18'}
            </div>
            <MockTask text={t('landing.mock.ev1')} color={C.sky} />
            <MockTask text={t('landing.mock.ev2')} color={C.moss} />
            <MockTask text={t('landing.mock.ev3')} color={C.medium} />
          </ScreenshotCard>
        </div>
      </Section>

      <Section id="contact">
        <div
          style={{
            background: C.paper,
            border: `1px solid ${C.sand200}`,
            borderRadius: 28,
            padding: 'clamp(28px, 5vw, 56px)',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(61,53,43,0.06)',
          }}
        >
          <IrtahMark size={48} />
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, margin: '14px 0 10px' }}>
            {t('landing.contact.title')}
          </h2>
          <p style={{ fontFamily: F.ui, fontSize: 15, color: C.ink600, lineHeight: 1.8, maxWidth: 520, marginInline: 'auto' }}>
            {t('landing.contact.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
            <a href="mailto:hello@irtah.app" style={contactBtn()}>✉ hello@irtah.app</a>
            <a href="https://github.com/3w2d/claude-mem" target="_blank" rel="noreferrer" style={contactBtn(true)}>GitHub</a>
            <button onClick={onEnter} style={{ ...contactBtn(), background: C.terra500, color: C.paper, border: 'none' }}>
              {t('landing.cta.start')}
            </button>
          </div>
        </div>
      </Section>

      <footer style={{ borderTop: `1px solid ${C.sand200}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ fontFamily: F.ui, fontSize: 12, color: C.sand500 }}>
          © {new Date().getFullYear()} Irtah · {t('landing.footer.tagline')}
        </div>
      </footer>
    </div>
  );
}

const navLink = {
  fontFamily: F.ui,
  fontSize: 13,
  color: C.ink700,
  textDecoration: 'none',
  padding: '6px 4px',
};

const contactBtn = (ghost) => ({
  fontFamily: F.ui,
  background: ghost ? 'transparent' : C.sand100,
  color: C.ink900,
  border: `1px solid ${C.sand300}`,
  borderRadius: 12,
  padding: '12px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
});
