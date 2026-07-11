import React from 'react';
import type { PageId } from '../components/Layout';

interface LandingProps {
  onEnter: (page: PageId) => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  return (
    <div className="chronos-canvas hero-container">

      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <header className="chronos-header">
        <div className="brand">Chronos</div>

        <nav>
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#contact">Contact</a>
          <button
            onClick={() => onEnter('dashboard')}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
          >
            Launch Portal
          </button>
        </nav>
      </header>

      {/* ── HERO CONTENT ─────────────────────────────────────── */}
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '900px' }}>

        <span className="badge">Faculty Operations Platform</span>

        <h1 className="hero-h1">
          Smart Leave.<br />Instant&nbsp;Cover.
        </h1>

        <p className="subheading" style={{ margin: '0 auto 3.5rem auto' }}>
          Automating faculty absence detection, real-time timetable adjustments,
          and instant substitute routing — without missing a single lecture block.
        </p>

        <div className="buttons">
          <button
            id="btn-deploy"
            className="btn btn-primary"
            onClick={() => onEnter('dashboard')}
          >
            Deploy Platform
          </button>
          <button
            id="btn-explore"
            className="btn btn-secondary"
            onClick={() => onEnter('leaves')}
          >
            Explore Engine
          </button>
        </div>
      </div>

      {/* ── WORKFLOW TRACK CARDS ─────────────────────────────── */}
      <div
        id="workflow"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1100px',
          marginBottom: '5rem',
        }}
      >
        {/* Card 01 */}
        <div className="track-card animate-fade-in" style={{ animationDelay: '0ms' }}>
          <span className="badge">01 · Capture</span>
          <h3 className="card-title">Faculty Applies</h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: '1.65', margin: 0 }}>
            Leave requests immediately launch the automated availability audit matrix engine,
            scanning every period slot across the active academic calendar.
          </p>
        </div>

        {/* Card 02 */}
        <div className="track-card animate-fade-in" style={{ animationDelay: '80ms' }}>
          <span className="badge">02 · Resolve</span>
          <h3 className="card-title">Auto-Assign</h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: '1.65', margin: 0 }}>
            System cross-checks alternative schedule openings and locks in the optimal substitute
            based on specialization match and period availability.
          </p>
        </div>

        {/* Card 03 */}
        <div className="track-card animate-fade-in" style={{ animationDelay: '160ms' }}>
          <span className="badge">03 · Dispatch</span>
          <h3 className="card-title">Sync Updates</h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: '1.65', margin: 0 }}>
            Timetables update dynamically while broadcasting live substitution alerts
            to confirmed coverage faculty — zero manual coordination required.
          </p>
        </div>
      </div>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <div
        id="features"
        style={{
          width: '100%',
          maxWidth: '1100px',
          marginBottom: '4rem',
          textAlign: 'center',
        }}
      >
        <span className="badge">Platform Capabilities</span>
        <h2
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            marginBottom: '0.75rem',
            lineHeight: 1.1,
          }}
        >
          Built for Institutional Scale
        </h2>
        <p
          className="subheading"
          style={{ margin: '0 auto 3rem auto', maxWidth: '32rem' }}
        >
          Every component engineered to eliminate substitution overhead and guarantee continuity.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {[
            { label: 'HOD Approval Queue', desc: 'Real-time pending leave review with one-click approve/reject controls.' },
            { label: 'Substitute Allocation Engine', desc: 'Conflict-free auto-assignment using timetable cross-reference logic.' },
            { label: 'Peer Hour Swaps', desc: 'Faculty-to-faculty period exchange with dual acceptance and admin sign-off.' },
            { label: 'Live Schedule View', desc: 'Date-driven dynamic timetable rendering with live substitution overlays.' },
            { label: 'Substitution Requests', desc: 'Pending substitution request notifications with Accept / Decline controls.' },
            { label: 'Audit Event Logs', desc: 'Timestamped operational logs capturing every approval, swap, and coverage event.' },
          ].map((f, i) => (
            <div
              key={i}
              className="track-card"
              style={{ padding: '1.75rem 1.5rem', animationDelay: `${i * 60}ms` }}
            >
              <h3 className="card-title" style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                {f.label}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <div
        className="track-card"
        style={{
          width: '100%',
          maxWidth: '700px',
          textAlign: 'center',
          padding: '3.5rem 2rem',
        }}
      >
        <span className="badge">Get Started</span>
        <h2
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}
        >
          Ready to deploy?
        </h2>
        <p
          className="subheading"
          style={{ margin: '0 auto 2.5rem auto', fontSize: '1.05rem' }}
        >
          Sign in or register your institution to activate the Chronos operations layer.
        </p>
        <div className="buttons" style={{ marginBottom: 0 }}>
          <button
            id="btn-cta-deploy"
            className="btn btn-primary"
            onClick={() => onEnter('dashboard')}
          >
            Sign In
          </button>
          <button
            id="btn-cta-register"
            className="btn btn-secondary"
            onClick={() => onEnter('dashboard')}
          >
            Register
          </button>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        id="contact"
        style={{
          marginTop: '4rem',
          color: 'rgba(255,255,255,0.45)',
          fontSize: '0.8rem',
          textAlign: 'center',
          width: '100%',
        }}
      >
        © {new Date().getFullYear()} Chronos Faculty Automation Platform · All rights reserved.
      </footer>
    </div>
  );
};
