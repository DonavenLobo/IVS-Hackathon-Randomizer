import { useState, useRef, useCallback, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Dices, History as HistoryIcon, LayoutGrid, Plus, Trash2, ChevronRight, Sparkles, Check } from "lucide-react";
import Background3D from "./components/Background3D";
import { supabase } from "./supabaseClient";

const DEFAULT_INDUSTRIES = {
  "Healthcare & Life Sciences": ["Hospital Systems & Clinical Care", "Pharmaceuticals & Drug Development", "Medical Devices & Diagnostics", "Mental Health & Behavioral Services", "Telemedicine & Digital Health", "Elder Care & Assisted Living", "Health Insurance & Benefits", "Veterinary Medicine"],
  "Agriculture & Food": ["Crop Farming & Agronomy", "Livestock & Animal Husbandry", "Food Processing & Packaging", "Restaurant & Food Service", "Grocery & Food Retail", "Agricultural Equipment & Technology", "Aquaculture & Fisheries", "Organic & Specialty Foods"],
  "Energy & Utilities": ["Oil & Gas Exploration", "Solar & Wind Energy", "Nuclear Power", "Electric Utilities & Grid Management", "Water Treatment & Distribution", "Battery & Energy Storage", "Carbon Capture & Climate Tech"],
  "Financial Services": ["Retail Banking", "Investment Management & Wealth", "Insurance (Property & Casualty)", "Payments & Fintech", "Lending & Credit", "Cryptocurrency & Digital Assets", "Accounting & Audit Services"],
  "Manufacturing & Industrial": ["Automotive Manufacturing", "Aerospace & Defense", "Semiconductor Fabrication", "Chemical Manufacturing", "Textiles & Apparel Production", "Industrial Automation & Robotics", "Steel & Metals", "3D Printing & Additive Manufacturing"],
  "Technology & Software": ["Enterprise SaaS", "Cybersecurity", "Cloud Infrastructure", "AI & Machine Learning", "Gaming & Interactive Entertainment", "Developer Tools & Platforms", "IoT & Embedded Systems"],
  "Transportation & Logistics": ["Freight & Trucking", "Maritime Shipping", "Airlines & Aviation", "Last-Mile Delivery", "Public Transit Systems", "Warehousing & Fulfillment", "Autonomous Vehicles"],
  "Real Estate & Construction": ["Residential Development", "Commercial Real Estate", "Construction & General Contracting", "Property Management", "Architecture & Design", "Building Materials & Supplies", "Smart Buildings & PropTech"],
  "Education & Training": ["K-12 Education", "Higher Education & Universities", "Corporate Training & L&D", "EdTech & Online Learning", "Vocational & Trade Schools", "Tutoring & Test Preparation", "Early Childhood Education"],
  "Media & Entertainment": ["Film & Television Production", "Music & Audio", "Publishing & Journalism", "Advertising & Marketing", "Sports & Live Events", "Podcasting & Creator Economy", "Museums & Cultural Institutions"],
  "Government & Public Sector": ["Defense & National Security", "Municipal Services & Local Gov", "Tax & Revenue Administration", "Public Health & Epidemiology", "Elections & Civic Tech", "Parks & Natural Resources"],
  "Retail & Consumer": ["E-commerce & Marketplaces", "Luxury Goods & Fashion", "Home Improvement & Hardware", "Consumer Electronics", "Beauty & Personal Care", "Pet Products & Services", "Subscription & DTC Brands"],
  "Professional Services": ["Legal Services & Law Firms", "Management Consulting", "Staffing & Recruitment", "Engineering & Design Firms", "Research & Analytics", "Translation & Localization"],
  "Telecom & Connectivity": ["Wireless Carriers & 5G", "Internet Service Providers", "Satellite Communications", "Networking & Infrastructure"],
  "Environment & Sustainability": ["Waste Management & Recycling", "Environmental Consulting", "Sustainable Materials & Packaging", "Carbon Markets & Offsets"],
  "Travel & Hospitality": ["Hotels & Resorts", "Travel Booking & Agencies", "Cruise Lines", "Outdoor Recreation & Adventure", "Event Planning & Conferences"],
};

const CUSTOMER_LEVELS = [
  { id: "primary", label: "Primary", tag: "B2C", description: "Direct to end users — you're building for the people who actually use the product or service.", color: "#5a9e6f", accent: "#e8f5ec" },
  { id: "secondary", label: "Secondary", tag: "B2B", description: "Serving businesses that provide to end users — your customer has their own customers.", color: "#b8860b", accent: "#faf3e0" },
  { id: "tertiary", label: "Tertiary", tag: "B2B2B+", description: "Deep in the value chain — providing to a business that provides to another business (or more).", color: "#c27a5a", accent: "#fdf0ea" },
];

const REEL_REPEATS = 12;
const REEL_ITEMS = [];
for (let i = 0; i < REEL_REPEATS; i++) {
  CUSTOMER_LEVELS.forEach(l => REEL_ITEMS.push(l));
}

function getAllIndustries(s) {
  const a = [];
  Object.entries(s).forEach(([sec, ind]) => { ind.forEach(i => a.push({ sector: sec, name: i })) });
  return a;
}

function slotCycle({ pool, pickFn, onTick, onLand, totalDuration = 3000 }) {
  const fp = pickFn(pool), fast = totalDuration * .50, slow = totalDuration * .38, pause = totalDuration * .12, fi = 55, ss = 10, ts = [];
  let el = 0;
  const ft = setInterval(() => { el += fi; if (el >= fast) { clearInterval(ft); return } onTick(pool[Math.floor(Math.random() * pool.length)], false) }, fi);
  ts.push(ft);
  for (let i = 0; i < ss; i++) { const d = fast + (slow / ss) * i; ts.push(setTimeout(() => onTick(pool[Math.floor(Math.random() * pool.length)], false), d)) }
  ts.push(setTimeout(() => { onTick(fp, true); onLand(fp) }, fast + slow + pause));
  return () => ts.forEach(t => { clearInterval(t); clearTimeout(t) });
}

const sid = "hk-styles-v3";
if (typeof document !== "undefined" && !document.getElementById(sid)) {
  const s = document.createElement("style"); s.id = sid;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap');
    
    body {
      margin: 0;
      background-color: #f7f2ec;
      overflow-x: hidden;
    }
    
    * { box-sizing: border-box; }
    
    .glass-panel {
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
    }
    
    .glass-active {
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.08);
    }
  `;
  document.head.appendChild(s);
}

const font = "'DM Sans', system-ui, sans-serif";
const displayFont = "'Fraunces', Georgia, serif";

export default function HackathonRandomizer() {
  const [sectors, setSectors] = useState(DEFAULT_INDUSTRIES);
  const [industry, setIndustry] = useState(null);
  const [level, setLevel] = useState(null);
  const [displayInd, setDisplayInd] = useState(null);
  const [indLanded, setIndLanded] = useState(false);
  const [indSpinning, setIndSpinning] = useState(false);
  const [lvlLanded, setLvlLanded] = useState(false);
  const [lvlSpinning, setLvlSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("randomizer");
  const [editSector, setEditSector] = useState(null);
  const [newIndustry, setNewIndustry] = useState("");
  const [newSector, setNewSector] = useState("");
  const cInd = useRef(null);
  const [dbReady, setDbReady] = useState(false);

  // Load history and custom sectors from Supabase on mount
  useEffect(() => {
    async function load() {
      const [{ data: histData }, { data: sectorData }] = await Promise.all([
        supabase.from("roll_history").select("*").order("rolled_at", { ascending: false }),
        supabase.from("custom_sectors").select("*"),
      ]);
      if (histData && histData.length > 0) {
        setHistory(histData.map(h => ({
          industry: h.industry, sector: h.sector, level: h.level, tag: h.tag, color: h.color,
          date: new Date(h.rolled_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          id: h.id, dbId: h.id,
        })));
      }
      if (sectorData && sectorData.length > 0) {
        const custom = {};
        sectorData.forEach(s => { custom[s.sector] = s.industries; });
        setSectors(custom);
      }
      setDbReady(true);
    }
    load();
  }, []);

  // Slot reel state
  const slotContainerRef = useRef(null);
  const [slotOffset, setSlotOffset] = useState(0);
  const slotAnimRef = useRef(null);
  const slotStartTime = useRef(null);

  const CELL_W = 150;

  const total = getAllIndustries(sectors).length;

  const rollIndustry = useCallback(() => {
    if (indSpinning) return;
    setIndSpinning(true); setIndLanded(false); setIndustry(null);
    setLevel(null); setLvlLanded(false); setLvlSpinning(false); setSlotOffset(0);
    if (cInd.current) cInd.current();
    const pool = getAllIndustries(sectors);
    cInd.current = slotCycle({
      pool, pickFn: p => p[Math.floor(Math.random() * p.length)],
      onTick: item => setDisplayInd(item),
      onLand: item => { setIndustry(item); setIndLanded(true); setIndSpinning(false) },
      totalDuration: 3200
    });
  }, [indSpinning, sectors]);

  const rollLevel = useCallback(() => {
    if (lvlSpinning || !indLanded) return;
    setLvlSpinning(true); setLvlLanded(false); setLevel(null);

    const pick = CUSTOMER_LEVELS[Math.floor(Math.random() * CUSTOMER_LEVELS.length)];
    const targetRegion = Math.floor(REEL_ITEMS.length * 0.7);
    let targetIdx = targetRegion;
    for (let i = targetRegion; i < REEL_ITEMS.length; i++) {
      if (REEL_ITEMS[i].id === pick.id) { targetIdx = i; break }
    }

    const containerW = slotContainerRef.current ? slotContainerRef.current.offsetWidth : 400;
    const targetOffset = -(targetIdx * CELL_W) + (containerW / 2) - (CELL_W / 2);
    const duration = 3400;
    const startOffset = 0;
    slotStartTime.current = performance.now();
    setSlotOffset(0);

    if (slotAnimRef.current) cancelAnimationFrame(slotAnimRef.current);

    const animate = (now) => {
      const elapsed = now - slotStartTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setSlotOffset(startOffset + (targetOffset - startOffset) * eased);
      if (progress < 1) {
        slotAnimRef.current = requestAnimationFrame(animate);
      } else {
        setSlotOffset(targetOffset);
        setLevel(pick);
        setLvlLanded(true);
        setLvlSpinning(false);
      }
    };
    slotAnimRef.current = requestAnimationFrame(animate);
  }, [lvlSpinning, indLanded, CELL_W]);

  useEffect(() => {
    return () => { if (slotAnimRef.current) cancelAnimationFrame(slotAnimRef.current) };
  }, []);

  const lockIn = async () => {
    if (!industry || !level) return;
    const entry = {
      industry: industry.name, sector: industry.sector, level: level.label, tag: level.tag, color: level.color,
    };
    const { data } = await supabase.from("roll_history").insert(entry).select().single();
    const histEntry = {
      ...entry,
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      id: data?.id || Date.now(), dbId: data?.id,
    };
    setHistory(p => [histEntry, ...p]);
    setIndustry(null); setLevel(null); setDisplayInd(null); setIndLanded(false); setLvlLanded(false); setSlotOffset(0);
  };

  // Persist sectors to Supabase whenever they change (after initial load)
  const saveSectorsRef = useRef(false);
  useEffect(() => {
    if (!dbReady) return;
    if (!saveSectorsRef.current) { saveSectorsRef.current = true; return; }
    async function save() {
      await supabase.from("custom_sectors").delete().neq("id", 0);
      const rows = Object.entries(sectors).map(([sector, industries]) => ({ sector, industries }));
      if (rows.length > 0) await supabase.from("custom_sectors").insert(rows);
    }
    save();
  }, [sectors, dbReady]);

  const removeIndustry = (sec, ind) => setSectors(p => { const u = { ...p }; u[sec] = u[sec].filter(i => i !== ind); if (!u[sec].length) delete u[sec]; return u });
  const addIndustry = sec => { if (!newIndustry.trim()) return; setSectors(p => ({ ...p, [sec]: [...(p[sec] || []), newIndustry.trim()] })); setNewIndustry("") };
  const addSector = () => { if (!newSector.trim() || sectors[newSector.trim()]) return; setSectors(p => ({ ...p, [newSector.trim()]: [] })); setNewSector("") };
  const removeSector = sec => { setSectors(p => { const u = { ...p }; delete u[sec]; return u }); if (editSector === sec) setEditSector(null) };

  const bothLanded = indLanded && lvlLanded;

  const tabVariants = {
    inactive: { backgroundColor: "rgba(90,158,111,0)", color: "#a89a86" },
    active: { backgroundColor: "rgba(90,158,111,0.12)", color: "#4a7c59" }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "linear-gradient(160deg, #faf8f4 0%, #f3efe7 30%, #eef5ef 60%, #f7f2ec 100%)",
      fontFamily: font, color: "#3d3529", position: "relative", overflow: "hidden",
    }}>
      {/* 3D Background Canvas */}
      <Background3D />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "48px 28px 60px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Header Animating In */}
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "#a89a86", margin: "0 0 12px", fontWeight: 600 }}>Monthly Hackathon</p>
          <h1 style={{ fontFamily: displayFont, fontSize: 44, fontWeight: 700, margin: 0, color: "#3d3529", letterSpacing: -0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Sparkles size={32} color="#5a9e6f" style={{ opacity: 0.8 }} />
            Constraint Generator
            <Sparkles size={32} color="#c27a5a" style={{ opacity: 0.8 }} />
          </h1>
          <p style={{ fontSize: 14, color: "#b0a494", margin: "14px 0 0", fontWeight: 400 }}>
            {total} industries · {Object.keys(sectors).length} sectors · 3 levels
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 44 }}>
          {[
            { id: "randomizer", label: "Randomize", icon: Dices },
            { id: "history", label: `History (${history.length})`, icon: HistoryIcon },
            { id: "edit", label: "Edit Lists", icon: LayoutGrid }
          ].map(t => (
            <motion.button key={t.id}
              onClick={() => setView(t.id)}
              variants={tabVariants}
              initial="inactive"
              animate={view === t.id ? "active" : "inactive"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", fontSize: 13, fontWeight: view === t.id ? 600 : 500, letterSpacing: 0.5,
                border: "none", cursor: "pointer", fontFamily: font,
                borderRadius: 30, transition: "box-shadow 0.25s ease",
                boxShadow: view === t.id ? "0 4px 12px rgba(90,158,111,0.15)" : "none",
              }}>
              <t.icon size={16} strokeWidth={2.5} />
              {t.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Dynamic Content Views */}
        <AnimatePresence mode="wait">

          {/* ═══ RANDOMIZER ═══ */}
          {view === "randomizer" && (
            <motion.div key="randomizer" variants={pageVariants} initial="initial" animate="enter" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>

              {/* INDUSTRY CARD */}
              <motion.div layout className={indLanded ? "glass-panel glass-active" : "glass-panel"} style={{
                borderRadius: 28, padding: "48px 36px", textAlign: "center",
                border: indLanded ? "1.5px solid rgba(90,158,111,0.35)" : "1px solid rgba(255,255,255,0.4)",
                minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              }}>
                <motion.p layout style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: indSpinning ? "#8a9e8f" : "#a89a86", margin: "0 0 12px", fontWeight: 600, transition: "color 0.3s", minHeight: 14 }}>
                  {displayInd ? displayInd.sector : "Step 1 — Industry"}
                </motion.p>

                <AnimatePresence mode="wait">
                  <motion.div key={displayInd ? displayInd.name : "placeholder"}
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
                    transition={{ duration: indSpinning ? 0.1 : 0.4 }}
                    style={{
                      fontFamily: displayFont, fontSize: displayInd ? 32 : 18, fontWeight: displayInd ? 700 : 400,
                      color: displayInd ? "#2d271e" : "#c0b5a4", letterSpacing: displayInd ? -0.5 : 0,
                      minHeight: 46, lineHeight: 1.2,
                    }}>
                    {displayInd ? displayInd.name : "Roll for your industry"}
                  </motion.div>
                </AnimatePresence>

                <motion.button whileHover={indSpinning ? {} : { scale: 1.05 }} whileTap={indSpinning ? {} : { scale: 0.95 }}
                  onClick={rollIndustry} disabled={indSpinning} style={{
                    marginTop: 32, padding: "14px 40px", fontSize: 13, fontWeight: 700, letterSpacing: 1,
                    fontFamily: font, borderRadius: 50, cursor: indSpinning ? "wait" : "pointer",
                    border: indSpinning ? "1.5px solid #d5cfc5" : "1.5px solid rgba(90,158,111,0.45)",
                    background: indSpinning ? "rgba(240,237,230,0.6)" : "rgba(90,158,111,0.1)",
                    color: indSpinning ? "#b0a494" : "#3d7a4a", transition: "all 0.25s ease",
                    boxShadow: indSpinning ? "none" : "0 8px 16px rgba(90,158,111,0.15)",
                  }}>
                  {indSpinning ? "Rolling..." : indLanded ? "Re-roll Industry" : "Roll Industry"}
                </motion.button>
              </motion.div>

              {/* Connector */}
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 32 }} transition={{ duration: 0.5 }} style={{ display: "flex", justifyContent: "center" }}>
                <div style={{
                  width: 2, height: "100%", borderRadius: 1,
                  background: indLanded ? "linear-gradient(to bottom, rgba(90,158,111,0.4), rgba(184,134,11,0.3))" : "rgba(200,192,180,0.2)",
                  transition: "background 0.5s"
                }} />
              </motion.div>

              {/* SLOT MACHINE CARD */}
              <motion.div layout className={lvlLanded && level ? "glass-panel glass-active" : "glass-panel"} style={{
                background: lvlLanded && level ? `linear-gradient(135deg, rgba(255,255,255,0.85), ${level.accent}d9)` : "rgba(255,255,255,0.4)",
                border: lvlLanded && level ? `1.5px solid ${level.color}55` : "1px solid rgba(255,255,255,0.4)",
                borderRadius: 28, padding: "40px 0", textAlign: "center",
                transition: "all 0.5s ease",
                opacity: indLanded || lvlSpinning ? 1 : 0.5,
                pointerEvents: indLanded || lvlSpinning ? "auto" : "none",
                minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                overflow: "hidden",
                boxShadow: lvlLanded && level ? `0 12px 40px ${level.color}15` : "0 8px 32px 0 rgba(31, 38, 135, 0.04)"
              }}>
                <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#a89a86", margin: "0 0 20px", fontWeight: 600, minHeight: 14, padding: "0 36px" }}>
                  Step 2 — Customer Level
                </p>

                {/* The slot reel window */}
                <div style={{ position: "relative", width: "100%", height: 74, marginBottom: 12 }}>
                  {/* Center indicator lines */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
                    width: CELL_W + 12, zIndex: 2, pointerEvents: "none",
                    borderLeft: `2.5px solid ${lvlLanded && level ? level.color + "77" : "rgba(90,158,111,0.35)"}`,
                    borderRight: `2.5px solid ${lvlLanded && level ? level.color + "77" : "rgba(90,158,111,0.35)"}`,
                    borderRadius: 16,
                    background: lvlLanded && level ? `${level.color}11` : "rgba(90,158,111,0.04)",
                    transition: "all 0.4s ease",
                  }} />
                  {/* Fade edges */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, left: 0, width: 120, zIndex: 3, pointerEvents: "none",
                    background: "linear-gradient(to right, rgba(250,248,244,0.98), transparent)",
                  }} />
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, right: 0, width: 120, zIndex: 3, pointerEvents: "none",
                    background: "linear-gradient(to left, rgba(250,248,244,0.98), transparent)",
                  }} />

                  {/* Reel strip */}
                  <div ref={slotContainerRef} style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, overflow: "hidden" }}>
                    <motion.div animate={{ x: slotOffset }} transition={{ duration: 0, ease: "linear" }} style={{
                      display: "flex", alignItems: "center", height: "100%", willChange: "transform",
                    }}>
                      {REEL_ITEMS.map((item, idx) => {
                        const isLandedItem = lvlLanded && level && level.id === item.id &&
                          Math.abs(slotOffset + idx * CELL_W + CELL_W / 2 - 200) < 5;
                        return (
                          <div key={idx} style={{
                            minWidth: CELL_W, width: CELL_W, height: "100%",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transform: isLandedItem ? "scale(1.1)" : "scale(1)", transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                          }}>
                            <span style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, color: item.color, transition: "color 0.3s" }}>
                              {item.label}
                            </span>
                            <span style={{ fontSize: 10, letterSpacing: 2, color: item.color, opacity: 0.6, marginTop: 4, fontWeight: 600 }}>
                              {item.tag}
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>
                  </div>
                </div>

                {/* Description after landing */}
                <AnimatePresence>
                  {lvlLanded && level && (
                    <motion.p initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                      style={{
                        margin: "12px 0 0", fontSize: 14, color: "#6a5c4a", maxWidth: 460, lineHeight: 1.6, fontWeight: 400, padding: "0 36px",
                      }}>
                      {level.description}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button whileHover={lvlSpinning || !indLanded ? {} : { scale: 1.05 }} whileTap={lvlSpinning || !indLanded ? {} : { scale: 0.95 }}
                  onClick={rollLevel} disabled={lvlSpinning || !indLanded} style={{
                    marginTop: 24, padding: "14px 40px", fontSize: 13, fontWeight: 700, letterSpacing: 1,
                    fontFamily: font, borderRadius: 50,
                    cursor: !indLanded ? "not-allowed" : lvlSpinning ? "wait" : "pointer",
                    border: !indLanded ? "1.5px solid rgba(200,192,180,0.15)" : lvlSpinning ? "1.5px solid #d5cfc5" : "1.5px solid rgba(184,134,11,0.4)",
                    background: !indLanded ? "transparent" : lvlSpinning ? "rgba(240,237,230,0.6)" : "rgba(184,134,11,0.08)",
                    color: !indLanded ? "rgba(200,192,180,0.4)" : lvlSpinning ? "#b0a494" : "#8a6914",
                    transition: "all 0.25s ease",
                    boxShadow: lvlSpinning || !indLanded ? "none" : "0 8px 16px rgba(184,134,11,0.12)",
                  }}>
                  {lvlSpinning ? "Rolling..." : lvlLanded ? "Re-roll Level" : "Roll Level"}
                </motion.button>
              </motion.div>

              {/* LOCK IN */}
              <AnimatePresence>
                {bothLanded && (
                  <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                    <motion.button whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(90,158,111,0.3)" }} whileTap={{ scale: 0.95 }} onClick={lockIn} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "16px 56px", fontSize: 16, fontWeight: 700, letterSpacing: 1.5,
                      fontFamily: font, borderRadius: 50, cursor: "pointer",
                      border: "2px solid rgba(90,158,111,0.45)",
                      background: "linear-gradient(135deg, rgba(90,158,111,0.15), rgba(168,200,140,0.1))",
                      color: "#3d7a4a", transition: "all 0.25s ease",
                      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                    }}>
                      <Check size={20} strokeWidth={3} />
                      Lock It In
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reference */}
              <motion.div layout className="glass-panel" style={{
                marginTop: 36, padding: 24, paddingBottom: 16, borderRadius: 24,
              }}>
                <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#a89a86", margin: "0 0 16px", fontWeight: 600 }}>
                  Customer Level Reference
                </p>
                {CUSTOMER_LEVELS.map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: l.color, minWidth: 84 }}>{l.label}</span>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, color: l.color, opacity: 0.65, minWidth: 46, fontWeight: 600 }}>{l.tag}</span>
                    <span style={{ fontSize: 13, color: "#8a7f6e", lineHeight: 1.5, fontWeight: 400 }}>{l.description}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ═══ HISTORY ═══ */}
          {view === "history" && (
            <motion.div key="history" variants={pageVariants} initial="initial" animate="enter" exit="exit" style={{ flex: 1 }}>
              {history.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{
                  textAlign: "center", padding: 80, color: "#a89a86", fontSize: 15, fontWeight: 400,
                  borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16
                }}>
                  <HistoryIcon size={40} opacity={0.3} />
                  No challenges locked in yet. Go generate one!
                </motion.div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <AnimatePresence>
                    {history.map((h, i) => (
                      <motion.div key={h.id} layout initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                        className="glass-panel" style={{
                          padding: "20px 28px", borderRadius: 20,
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                        <div>
                          <p style={{ fontSize: 10, color: "#a89a86", letterSpacing: 2, margin: "0 0 6px", textTransform: "uppercase", fontWeight: 600 }}>
                            #{history.length - i} · {h.date} · {h.sector}
                          </p>
                          <p style={{ fontSize: 18, fontWeight: 600, color: "#2d271e", margin: 0, fontFamily: displayFont }}>{h.industry}</p>
                        </div>
                        <div style={{
                          padding: "8px 20px", borderRadius: 24,
                          background: `${h.color}15`, border: `1.5px solid ${h.color}35`,
                          fontSize: 13, fontWeight: 700, color: h.color, whiteSpace: "nowrap",
                        }}>
                          {h.level} <span style={{ opacity: 0.6, fontSize: 11, fontWeight: 500, marginLeft: 4 }}>{h.tag}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              {history.length > 0 && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { supabase.from("roll_history").delete().neq("id", 0); setHistory([]); }} style={{
                    marginTop: 24, padding: "12px 24px", fontSize: 12, fontWeight: 600,
                    background: "transparent", border: "1.5px solid rgba(180,170,155,0.3)",
                    borderRadius: 30, color: "#a89a86", cursor: "pointer", fontFamily: font,
                    display: "flex", alignItems: "center", gap: 6, margin: "24px auto 0"
                  }}>
                  <Trash2 size={14} /> Clear History
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ═══ EDIT ═══ */}
          {view === "edit" && (
            <motion.div key="edit" variants={pageVariants} initial="initial" animate="enter" exit="exit" style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                <input value={newSector} onChange={e => setNewSector(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addSector()}
                  placeholder="New sector name..." className="glass-panel" style={{
                    flex: 1, padding: "14px 20px", fontSize: 14, fontWeight: 400,
                    borderRadius: 18, color: "#3d3529", outline: "none", fontFamily: font,
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                  }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addSector} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "14px 28px", fontSize: 13, fontWeight: 700,
                  background: "rgba(90,158,111,0.1)", border: "1.5px solid rgba(90,158,111,0.35)",
                  borderRadius: 18, color: "#4a7c59", cursor: "pointer", fontFamily: font,
                }}>
                  <Plus size={16} strokeWidth={3} /> Sector
                </motion.button>
              </div>

              <AnimatePresence>
                {Object.entries(sectors).map(([sec, inds]) => (
                  <motion.div key={sec} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="glass-panel" style={{ marginBottom: 12, borderRadius: 20, overflow: "hidden" }}>

                    <div onClick={() => setEditSector(editSector === sec ? null : sec)}
                      style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: editSector === sec ? "rgba(255,255,255,0.4)" : "transparent", transition: "background 0.3s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#2d271e" }}>{sec}</span>
                        <span style={{ fontSize: 12, color: "#a89a86", fontWeight: 500, background: "rgba(0,0,0,0.04)", padding: "2px 8px", borderRadius: 12 }}>{inds.length}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button onClick={e => { e.stopPropagation(); removeSector(sec) }} style={{
                          background: "none", border: "none", color: "#c0b5a4", cursor: "pointer",
                          fontSize: 12, padding: "4px 8px", fontFamily: font, fontWeight: 500, transition: "color 0.2s"
                        }}>Delete</button>
                        <ChevronRight size={18} color="#c0b5a4" style={{ transform: editSector === sec ? "rotate(90deg)" : "none", transition: "transform 0.3s" }} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {editSector === sec && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                          <div style={{ padding: "8px 24px 24px", background: "rgba(250,248,244,0.4)" }}>
                            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                              <input value={newIndustry} onChange={e => setNewIndustry(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addIndustry(sec)}
                                placeholder="Add industry..." style={{
                                  flex: 1, padding: "10px 16px", fontSize: 13, fontWeight: 400,
                                  background: "rgba(255,255,255,0.8)", border: "1px solid rgba(180,170,155,0.25)",
                                  borderRadius: 12, color: "#3d3529", outline: "none", fontFamily: font,
                                }} />
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addIndustry(sec)} style={{
                                padding: "10px 20px", fontSize: 12, fontWeight: 600,
                                background: "rgba(255,255,255,0.9)", border: "1px solid rgba(180,170,155,0.3)",
                                borderRadius: 12, color: "#6a5c4a", cursor: "pointer", fontFamily: font,
                              }}>Add</motion.button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <AnimatePresence>
                                {inds.map(ind => (
                                  <motion.div key={ind} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                      display: "flex", justifyContent: "space-between", alignItems: "center",
                                      padding: "8px 12px", borderRadius: 10, fontSize: 13, color: "#6a5c4a", fontWeight: 400,
                                      background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)"
                                    }}>
                                    <span>{ind}</span>
                                    <button onClick={() => removeIndustry(sec, ind)} style={{
                                      background: "none", border: "none", color: "#c0b5a4", cursor: "pointer",
                                      padding: "2px 6px", display: "flex", alignItems: "center"
                                    }}>
                                      <Trash2 size={14} />
                                    </button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                              {inds.length === 0 && (
                                <p style={{ color: "#c0b5a4", fontSize: 13, padding: "8px 12px", margin: 0, fontWeight: 400 }}>No industries — add some above</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { supabase.from("custom_sectors").delete().neq("id", 0); setSectors(DEFAULT_INDUSTRIES); }} style={{
                    padding: "12px 24px", fontSize: 12, fontWeight: 600,
                    background: "transparent", border: "1.5px solid rgba(180,170,155,0.3)",
                    borderRadius: 30, color: "#a89a86", cursor: "pointer", fontFamily: font,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                  <HistoryIcon size={14} /> Reset to Defaults
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div >
    </div >
  );
}