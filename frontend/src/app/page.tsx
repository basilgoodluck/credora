"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaTimes,
  FaFileAlt,
  FaComment,
  FaReceipt,
  FaPhoneAlt,
  FaUsers,
  FaPen,
  FaKey,
  FaChartLine,
  FaShareAlt,
  FaIdCard,
  FaGlobe,
  FaCheck,
} from "react-icons/fa";

const AMBER = "#FFB020";
const DARK  = "#0B1220";
const BG    = "#28ebc0";
const BG1   = "#22d9b0";
const TEXT  = "#052e24";
const TEXT2 = "#084534";
const EASE  = "cubic-bezier(0.25,0.46,0.45,0.94)";

/* REVEAL */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* DATA */
const problems = [
  {
    title: "Good borrowers the system cannot see",
    desc: "Amaka has paid her supplier every week for six years. She saves, repays, and grows. She walked into a bank and asked for a loan to expand. The bank said no not because she is a bad borrower, but because she does not exist in any system the bank can read.",
  },
  {
    title: "A loop with no entry point",
    desc: "No credit history means no loan. No loan means no credit history. The system offers no ladder for someone who starts outside it.",
  },
  {
    title: "The data exists but nothing can read it",
    desc: "Bank SMS alerts, WhatsApp payment confirmations, teller deposit slips, cooperative passbooks six years of consistent market activity. Every one of these is a real financial signal. None of them can be read by any formal lender.",
  },
  {
    title: "Existing tools do not solve the root cause",
    desc: "Microfinance runs at 80–120% annualised rates because their risk tools are crude. App-based lenders produce black-box scores that build nothing the worker owns. The missing piece is not a loan. It is a financial identity.",
  },
];

const evidenceItems = [
  { icon: <FaFileAlt size={15} />, name: "Bank statement PDF",         conf: 1.0 },
  { icon: <FaComment size={15} />, name: "Bank SMS alert",             conf: 0.9 },
  { icon: <FaUsers size={15} />,   name: "Cooperative passbook",       conf: 0.8 },
  { icon: <FaPhoneAlt size={15} />, name: "OPay / Palmpay screenshot", conf: 0.8 },
  { icon: <FaComment size={15} />, name: "WhatsApp payment paste",     conf: 0.7 },
  { icon: <FaReceipt size={15} />, name: "Teller deposit slip",        conf: 0.6 },
  { icon: <FaPen size={15} />,     name: "Handwritten receipt",        conf: 0.5 },
  { icon: <FaKey size={15} />,     name: "Manual text entry",          conf: 0.3 },
];

const pipeSteps = [
  { n: "01", t: "Ingest",    d: "Any format accepted PDF, image, plain text, CSV, raw SMS export.",                       lit: false },
  { n: "02", t: "Extract",   d: "AI agents parse every financial event from unstructured content.",                        lit: true  },
  { n: "03", t: "Normalise", d: "Dates, amounts and currencies unified into one consistent schema.",                       lit: false },
  { n: "04", t: "Verify",    d: "Sources cross-referenced. Conflicts flagged. Fraud signals surfaced.",                    lit: true  },
  { n: "05", t: "Score",     d: "Weighted signals produce a transparent, fully explainable credit score.",                 lit: true  },
  { n: "06", t: "Report",    d: "Lenders receive a structured, auditable report they can act on immediately.",             lit: false },
];

const scoreBars = [
  { name: "Consistency", v: 88 },
  { name: "Income flow", v: 74 },
  { name: "Repayment",   v: 91 },
  { name: "Liquidity",   v: 66 },
];

const trajectory = [
  { date: "Jan", val: "0.44", height: 38,  peak: false },
  { date: "Feb", val: "0.52", height: 52,  peak: false },
  { date: "Mar", val: "0.58", height: 64,  peak: false },
  { date: "Apr", val: "0.63", height: 74,  peak: false },
  { date: "May", val: "0.68", height: 86,  peak: false },
  { date: "Jun", val: "0.71", height: 100, peak: true  },
];

const differentiators = [
  {
    icon: <FaCheck size={17} />,
    title: "Meet workers where they are",
    desc: "Amaka changes nothing. No new apps, no new habits, no new accounts. She brings what she already has. Credora does the translation.",
  },
  {
    icon: <FaShareAlt size={17} />,
    title: "Built on existing trust networks",
    desc: "We reach workers through cooperative secretaries, microfinance officers, and market association chairmen people who already have relationships with hundreds of workers. One partner unlocks 200 profiles.",
  },
  {
    icon: <FaChartLine size={17} />,
    title: "The moat is the dataset",
    desc: "Every profile makes the scoring smarter. After 10,000 profiles we can distinguish a December income dip that is seasonal from one that signals genuine distress insight that cannot be replicated overnight.",
  },
  {
    icon: <FaIdCard size={17} />,
    title: "A financial passport, not a one-time score",
    desc: "The Credora profile belongs to the worker. She takes it to any lender, landlord, or supplier. It grows over time and is entirely hers.",
  },
  {
    icon: <FaGlobe size={17} />,
    title: "A global problem",
    desc: "Japan has no national credit system. Spain has no credit scores. France only tracks negative information. A worker moving from Nigeria to the UK becomes credit-invisible overnight. Credora is designed to travel with a person across borders.",
  },
  {
    icon: <FaUsers size={17} />,
    title: "Two users, one product",
    desc: "The loan officer gets a structured tool that replaces gut-feel assessments and lets them profile 30 people a week instead of 3. The worker gets a growing financial identity. Both win from the same action.",
  },
];

/* PAGE */
export default function Page() {
  const router = useRouter();

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "'Montserrat', sans-serif" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 1.5rem 3rem" }}>
        <div className="anim-fade" style={{ animationDelay: "0.05s", fontSize: "0.88rem", fontWeight: 600, color: TEXT2, marginBottom: "1.4rem" }}>
          Financial identity infrastructure
        </div>
        <h1 className="anim-fade" style={{ animationDelay: "0.15s", fontSize: "clamp(2.1rem,4.8vw,3.5rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.07, color: TEXT, maxWidth: 820, marginBottom: "1.25rem" }}>
          2 billion people work every day.<br />
          <em style={{ fontStyle: "normal", color: DARK }}>Banks still cannot see them.</em>
        </h1>
        <p className="anim-fade" style={{ animationDelay: "0.25s", fontSize: "1.1rem", color: TEXT2, maxWidth: 540, lineHeight: 1.75, fontWeight: 400, marginBottom: "2.25rem" }}>
          They are not poor. They are not irresponsible. They are not risky. They are invisible. Credora fixes that.
        </p>
        <div className="anim-fade" style={{ animationDelay: "0.35s", display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => router.push("/signup")}
            style={{ background: DARK, color: "#fff", fontSize: "0.95rem", fontWeight: 600, padding: "0.75rem 1.5rem", borderRadius: 10, border: "none", cursor: "pointer", transition: `transform 0.18s ${EASE}, box-shadow 0.18s ${EASE}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(11,18,32,0.28)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
          >Get started</button>
          <button
            onClick={() => router.push("/login")}
            style={{ background: "rgba(0,0,0,0.05)", color: TEXT, fontSize: "0.95rem", fontWeight: 500, padding: "0.75rem 1.5rem", borderRadius: 10, border: "1px solid rgba(0,0,0,0.13)", cursor: "pointer", transition: `background 0.18s ${EASE}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.09)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; }}
          >Log in</button>
        </div>
      </div>

      {/* STORY CARD */}
      <div style={{ padding: "0 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", background: DARK, borderRadius: 16, padding: "2.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,176,32,0.1)", pointerEvents: "none" }} />
          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,176,32,0.75)", marginBottom: "1.25rem" }}>A real story</div>
          <p style={{ fontSize: "clamp(1.05rem,2.2vw,1.3rem)", fontWeight: 500, lineHeight: 1.65, color: "#fff", maxWidth: 700, borderLeft: `3px solid ${AMBER}`, paddingLeft: "1.25rem", marginBottom: "1.5rem" }}>
            Amaka wakes up at 5am in Lagos. She buys stock from her supplier. She has been doing this for six years. She sells, collects money, repays what she owes, saves, and grows.
            <span style={{ color: "rgba(255,255,255,0.55)" }}> Any reasonable person looking at her financial behavior would say: this person is reliable.</span>
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: AMBER, color: DARK, fontSize: "0.92rem", fontWeight: 700, padding: "0.5rem 1.1rem", borderRadius: 99 }}>
            <FaTimes size={14} /> She asked for 200,000 naira. The bank said no.
          </div>
        </div>
      </div>

      {/* PROBLEMS */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.5rem,2.6vw,2.1rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: TEXT, marginBottom: "0.6rem" }}>
              What we are solving
            </h2>
            <p style={{ fontSize: "1rem", color: TEXT2, lineHeight: 1.75, fontWeight: 400, maxWidth: 520, marginBottom: "2.5rem" }}>
              The data these workers produce is real. The problem is that no system translates it into something a lender can act on.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {problems.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div
                  style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.13)", borderRadius: 16, padding: "1.75rem 1.5rem", height: "100%", display: "flex", flexDirection: "column", transition: `background 0.2s ${EASE}, transform 0.2s ${EASE}, box-shadow 0.2s ${EASE}`, cursor: "default" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(0,0,0,0.09)"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 10px 28px rgba(0,0,0,0.07)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(0,0,0,0.05)"; el.style.transform = "none"; el.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: DARK, background: AMBER, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9, marginBottom: "1rem", flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: TEXT, marginBottom: "0.55rem", lineHeight: 1.3, letterSpacing: "-0.015em" }}>{p.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: TEXT2, lineHeight: 1.75, fontWeight: 400 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INSIGHT BANNER */}
      <div style={{ padding: "0 1.5rem 5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ background: DARK, borderRadius: 16, padding: "2rem 2.5rem" }}>
              <p style={{ fontSize: "clamp(1.05rem,2vw,1.35rem)", fontWeight: 600, lineHeight: 1.55, color: "#fff", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                Credora is the translation layer scattered, unstructured, informal data in; structured, scored, explainable credit profile out.
              </p>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, fontWeight: 400 }}>
                The gap is informational. There is no system that takes real-world informal evidence and turns it into something a formal lender can act on. Until now.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding: "5rem 1.5rem", background: BG1, borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.5rem,2.6vw,2.1rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: TEXT, marginBottom: "0.6rem" }}>
              How Credora works
            </h2>
            <p style={{ fontSize: "1rem", color: TEXT2, lineHeight: 1.75, fontWeight: 400, maxWidth: 520, marginBottom: "3rem" }}>
              Workers submit what they already have. Credora processes it and returns a structured, explainable credit profile ready for any lender.
            </p>
          </Reveal>

          <Reveal>
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
                Accepted evidence sources
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                {evidenceItems.map((e) => (
                  <div
                    key={e.name}
                    style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.13)", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem", transition: `background 0.18s ${EASE}, transform 0.18s ${EASE}` }}
                    onMouseEnter={el => { (el.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.09)"; (el.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={el => { (el.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.05)"; (el.currentTarget as HTMLDivElement).style.transform = "none"; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: DARK, display: "flex", alignItems: "center", justifyContent: "center", color: AMBER }}>
                      {e.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 600, color: TEXT, lineHeight: 1.3, marginBottom: 3 }}>{e.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(0,0,0,0.1)", overflow: "hidden" }}>
                          <div style={{ width: `${e.conf * 100}%`, height: "100%", borderRadius: 99, background: e.conf >= 0.8 ? "#1a9c6b" : e.conf >= 0.5 ? AMBER : "rgba(0,0,0,0.25)" }} />
                        </div>
                        <span style={{ fontSize: "0.8rem", color: TEXT2, fontWeight: 600, flexShrink: 0 }}>{e.conf.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
                Processing pipeline
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", border: "1px solid rgba(0,0,0,0.13)", borderRadius: 16, overflow: "hidden" }}>
                {pipeSteps.map((s, i) => (
                  <div
                    key={s.n}
                    style={{ padding: "1.5rem 1rem", borderRight: i < pipeSteps.length - 1 ? "1px solid rgba(0,0,0,0.1)" : "none", background: s.lit ? DARK : "transparent", transition: `background 0.18s ${EASE}` }}
                    onMouseEnter={e => { if (!s.lit) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.05)"; }}
                    onMouseLeave={e => { if (!s.lit) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.lit ? AMBER : "rgba(0,0,0,0.15)", marginBottom: "0.5rem", lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: s.lit ? "#fff" : TEXT, marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>{s.t}</div>
                    <p style={{ fontSize: "0.82rem", color: s.lit ? "rgba(255,255,255,0.5)" : TEXT2, lineHeight: 1.55, fontWeight: 400 }}>{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
              Output the Credora profile
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ background: DARK, borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: "1.75rem" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: AMBER, marginBottom: "0.25rem" }}>Signal breakdown</div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>Amaka · NGN-00412</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {scoreBars.map((b) => (
                    <div key={b.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{b.name}</span>
                        <span style={{ fontSize: "0.9rem", color: "#fff", fontWeight: 700 }}>{b.v}</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                        <div className="bar-fill" style={{ width: `${b.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                  Average monthly income of ₦67,000. December dip appears seasonal. 8 of 14 events from bank SMS high confidence.<br />
                  <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Recommended: ₦75,000 over 90 days.</strong>
                </p>
              </div>
              <div style={{ background: DARK, borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: "1.75rem" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: AMBER, marginBottom: "0.25rem" }}>Score trajectory</div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>The profile grows with every new piece of evidence</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 110, marginBottom: "0.5rem" }}>
                  {trajectory.map((t) => (
                    <div key={t.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, justifyContent: "flex-end", height: "100%" }}>
                      <div style={{ fontSize: "0.8rem", color: t.peak ? AMBER : "rgba(255,255,255,0.45)", fontWeight: t.peak ? 700 : 400 }}>{t.val}</div>
                      <div style={{ width: "100%", height: t.height, borderRadius: "4px 4px 0 0", background: t.peak ? AMBER : "rgba(255,255,255,0.12)" }} />
                      <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.3)" }}>{t.date}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                  A rising trajectory signals reliability. The profile belongs to the worker she takes it to any lender on the platform.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.5rem,2.6vw,2.1rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: TEXT, marginBottom: "0.6rem" }}>
              What makes Credora different
            </h2>
            <p style={{ fontSize: "1rem", color: TEXT2, lineHeight: 1.75, fontWeight: 400, maxWidth: 520, marginBottom: "2.5rem" }}>
              The data already exists. The behavior is already there. The problem has always been the translation layer.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem" }}>
            {differentiators.map((d, i) => (
              <Reveal key={d.title} delay={i * 60}>
                <div
                  style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.13)", borderRadius: 16, padding: "1.6rem 1.5rem", height: "100%", display: "flex", flexDirection: "column", transition: `background 0.2s ${EASE}, transform 0.2s ${EASE}, box-shadow 0.2s ${EASE}`, cursor: "default" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(0,0,0,0.09)"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 10px 28px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(0,0,0,0.05)"; el.style.transform = "none"; el.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: DARK, display: "flex", alignItems: "center", justifyContent: "center", color: AMBER, marginBottom: "1rem", flexShrink: 0 }}>
                    {d.icon}
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: TEXT, marginBottom: "0.45rem", letterSpacing: "-0.015em", lineHeight: 1.3 }}>{d.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: TEXT2, lineHeight: 1.72, fontWeight: 400 }}>{d.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "7rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: TEXT, marginBottom: "0.75rem" }}>
              Credit for the people banks cannot see.
            </h2>
            <p style={{ fontSize: "1.05rem", color: TEXT2, marginBottom: "2rem", fontWeight: 400 }}>
              Built for scale. Designed to last.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => router.push("/signup")}
                style={{ background: DARK, color: "#fff", fontSize: "0.95rem", fontWeight: 600, padding: "0.75rem 1.5rem", borderRadius: 10, border: "none", cursor: "pointer", transition: `transform 0.18s ${EASE}, box-shadow 0.18s ${EASE}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(11,18,32,0.28)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
              >Get started</button>
              <button
                onClick={() => router.push("/login")}
                style={{ background: "rgba(0,0,0,0.05)", color: TEXT, fontSize: "0.95rem", fontWeight: 500, padding: "0.75rem 1.5rem", borderRadius: 10, border: "1px solid rgba(0,0,0,0.13)", cursor: "pointer", transition: `background 0.18s ${EASE}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.09)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; }}
              >Log in</button>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}