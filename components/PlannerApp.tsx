"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ListChecks, Lightbulb, Repeat, Plus, Trash2, Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const IDEA_BANK: Record<string, string[]> = {
  "Date Night": ["Cook a recipe from a place you both want to travel to","Slow-dance in the kitchen to your wedding playlist","Split an appetizer somewhere new","Walk a trail you've never done together","Write each other a top-5 list of favorite memories"],
  "One-on-One": ["Donut run before anyone else is up","Let them pick the music and drive around","Teach them one new skill","Coffee or milkshake date, then just listen","Take them to see what you do at work"],
  "Family Fun": ["Backyard campout with flashlights","Family game night, rotate who picks","Build a puzzle over the week","Stargazing — learn one constellation","Cook a meal together, kids on real jobs"],
  "Loving Your Wife": ["Take a task off her plate without being asked","Handle bedtime solo so she gets an evening off","Ask about her day, phone away the whole time","Write a note and leave it somewhere she'll find it","Plan something so she doesn't have to plan for once"],
  "Serving Community": ["Bring a meal to a family who just had a baby or a loss","Introduce your kids to every neighbor on the street","Volunteer as a family at a food bank","Check on a family member going through something hard","Mentor someone younger, formally or informally"],
};

function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setDate(date.getDate() - date.getDay());
  date.setHours(0, 0, 0, 0);
  return date;
}
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function fmtRange(start: Date, end: Date) {
  const s = `${MONTH_NAMES[start.getMonth()].slice(0,3)} ${start.getDate()}`;
  const e = start.getMonth() === end.getMonth() ? `${end.getDate()}` : `${MONTH_NAMES[end.getMonth()].slice(0,3)} ${end.getDate()}`;
  return `${s}–${e}`;
}

type Rhythm = { id: string; category: string; text: string };
type WeekData = { dateNight: string; oneOnOne: string; familyTime: string; serve: string; days: Record<string, string>; priorities: string[]; notes: string };

const EMPTY_WEEK: WeekData = { dateNight: "", oneOnOne: "", familyTime: "", serve: "", days: {}, priorities: ["", "", ""], notes: "" };

function Section({ icon: Icon, title, children }: any) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 text-rust">
        <Icon size={14} />
        <span className="text-xs font-semibold tracking-widest uppercase">{title}</span>
      </div>
      {children}
    </div>
  );
}

function RhythmList({ label, items, onAdd, onRemove }: { label: string; items: Rhythm[]; onAdd: (t: string) => void; onRemove: (id: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="mb-5">
      <div className="text-sm font-bold mb-2">{label}</div>
      <div className="space-y-1.5 mb-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between rounded px-3 py-2 bg-paperDk border border-line">
            <span className="text-sm">{it.text}</span>
            <button onClick={() => onRemove(it.id)} className="opacity-50 hover:opacity-100">
              <Trash2 size={13} className="text-rust" />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-xs italic opacity-50 px-1">Nothing set yet</div>}
      </div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }}
          placeholder={`Add a ${label.toLowerCase()} rhythm…`}
          className="flex-1 text-sm px-3 py-2 rounded outline-none border border-line bg-white"
        />
        <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }} className="px-3 rounded text-white bg-pine">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function PlannerApp({ userId, userEmail }: { userId: string; userEmail: string }) {
  const supabase = createClient();
  const [tab, setTab] = useState("week");
  const [loading, setLoading] = useState(true);
  const [rhythms, setRhythms] = useState<Rhythm[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [weekData, setWeekData] = useState<WeekData>(EMPTY_WEEK);

  // Load rhythms once
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("rhythms").select("*").order("created_at");
      if (data) setRhythms(data as Rhythm[]);
      setLoading(false);
    })();
  }, []);

  // Load the selected week whenever it changes
  const weekKey = isoDate(weekStart);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("weeks").select("data").eq("week_start", weekKey).maybeSingle();
      setWeekData(data ? (data.data as WeekData) : EMPTY_WEEK);
    })();
  }, [weekKey]);

  const saveWeek = useCallback(async (next: WeekData) => {
    setWeekData(next);
    await supabase.from("weeks").upsert({ user_id: userId, week_start: weekKey, data: next, updated_at: new Date().toISOString() });
  }, [weekKey, userId]);

  const addRhythm = async (category: string, text: string) => {
    const { data } = await supabase.from("rhythms").insert({ user_id: userId, category, text }).select().single();
    if (data) setRhythms((r) => [...r, data as Rhythm]);
  };
  const removeRhythm = async (id: string) => {
    await supabase.from("rhythms").delete().eq("id", id);
    setRhythms((r) => r.filter((x) => x.id !== id));
  };

  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

  const tabs = [
    { id: "week", label: "This Week", icon: ListChecks },
    { id: "rhythms", label: "Rhythms", icon: Repeat },
    { id: "month", label: "Month", icon: Calendar },
    { id: "ideas", label: "Idea Bank", icon: Lightbulb },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-paper">
        <Loader2 className="animate-spin text-rust" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink" style={{ fontFamily: "Georgia, serif" }}>
      <div className="max-w-md mx-auto">
        <div className="bg-pine px-5 pt-6 pb-4 flex justify-between items-start">
          <div>
            <div className="text-xs tracking-widest uppercase text-gold">{userEmail}</div>
            <div className="text-white text-xl font-bold mt-1">The Family Man Planner</div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = "/login")} className="text-white/70 hover:text-white mt-1">
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex border-b border-line bg-white">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide ${active ? "text-pine border-b-2 border-rust" : "text-gray-400 border-b-2 border-transparent"}`}>
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 bg-paper" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {tab === "week" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })} className="text-xs px-2 py-1 rounded border border-line">&larr; Prev</button>
                <div className="text-sm font-bold text-pine">{fmtRange(weekStart, weekEnd)}</div>
                <button onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })} className="text-xs px-2 py-1 rounded border border-line">Next &rarr;</button>
              </div>

              <Section icon={Repeat} title="This Week's Rhythm Ideas">
                {[["dateNight","Date night idea"],["oneOnOne","One-on-one focus"],["familyTime","Family time idea"],["serve","Serve / community"]].map(([k,label]) => (
                  <input key={k} value={(weekData as any)[k]} placeholder={label}
                    onChange={(e) => saveWeek({ ...weekData, [k]: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded mb-1.5 outline-none border border-line bg-white" />
                ))}
              </Section>

              <Section icon={ListChecks} title="Top 3 Priorities">
                {weekData.priorities.map((p, i) => (
                  <input key={i} value={p} placeholder={`Priority ${i + 1}`}
                    onChange={(e) => { const next = [...weekData.priorities]; next[i] = e.target.value; saveWeek({ ...weekData, priorities: next }); }}
                    className="w-full text-sm px-3 py-2 rounded mb-1.5 outline-none border border-line bg-white" />
                ))}
              </Section>

              <Section icon={Calendar} title="Day by Day">
                {DAY_NAMES.map((d, i) => (
                  <div key={d} className="flex gap-2 mb-1.5 items-center">
                    <div className="w-10 text-[10px] font-bold text-rust">{DAY_ABBR[i]}</div>
                    <input value={weekData.days[d] || ""} placeholder="…"
                      onChange={(e) => saveWeek({ ...weekData, days: { ...weekData.days, [d]: e.target.value } })}
                      className="flex-1 text-sm px-2 py-1.5 rounded outline-none border border-line bg-white" />
                  </div>
                ))}
              </Section>
            </div>
          )}

          {tab === "rhythms" && (
            <div>
              {["weekly", "monthly", "quarterly", "annual"].map((cat) => (
                <RhythmList key={cat} label={cat[0].toUpperCase() + cat.slice(1)}
                  items={rhythms.filter((r) => r.category === cat)}
                  onAdd={(t) => addRhythm(cat, t)}
                  onRemove={removeRhythm} />
              ))}
            </div>
          )}

          {tab === "month" && (
            <div>
              <div className="text-sm font-bold mb-3 text-pine">{MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()}</div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {DAY_ABBR.map((d) => <div key={d} className="text-[9px] font-bold text-rust">{d}</div>)}
                {(() => {
                  const now = new Date();
                  const first = new Date(now.getFullYear(), now.getMonth(), 1);
                  const startPad = first.getDay();
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  const cells = [];
                  for (let i = 0; i < startPad; i++) cells.push(<div key={"pad" + i} />);
                  for (let d = 1; d <= daysInMonth; d++) {
                    const isToday = d === now.getDate();
                    cells.push(
                      <div key={d} className={`aspect-square flex items-center justify-center text-xs rounded border border-line ${isToday ? "bg-pine text-white" : "bg-paperDk"}`}>
                        {d}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>
          )}

          {tab === "ideas" && (
            <div>
              {Object.entries(IDEA_BANK).map(([cat, items]) => (
                <Section key={cat} icon={Lightbulb} title={cat}>
                  <ul className="space-y-1.5">
                    {items.map((it, i) => (
                      <li key={i} className="text-sm px-3 py-2 rounded bg-paperDk border border-line">{it}</li>
                    ))}
                  </ul>
                </Section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
