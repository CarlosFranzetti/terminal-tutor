'use client';

import { useState, useEffect } from 'react';
import { allPacks } from '@/lib/quests';
import type { Pack, Story, Step, BranchPoint, Branch } from '@/lib/types';

const C = {
  bg: '#0a0a0f',
  surface: '#12121a',
  border: '#2a2a3a',
  cyan: '#8be9fd',
  magenta: '#ff79c6',
  green: '#50fa7b',
  yellow: '#f1fa8c',
  orange: '#ffb86c',
  red: '#ff5555',
  muted: '#6272a4',
  white: '#f8f8f2',
  dimWhite: '#bfc7d5',
};

type View =
  | { kind: 'browser' }
  | { kind: 'stories'; pack: Pack }
  | { kind: 'quest'; pack: Pack; story: Story };

function Disclaimer({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{
      background: '#1a0a00',
      border: `2px solid ${C.orange}`,
      borderRadius: 8,
      padding: '16px 20px',
      margin: '0 0 16px 0',
    }}>
      <p style={{ margin: '0 0 8px', color: C.orange, fontWeight: 900, fontSize: 15 }}>
        ⚠️ PREVIEW MODE — This is not the real Terminal Tutor experience.
      </p>
      <p style={{ margin: '0 0 12px', color: C.dimWhite, fontSize: 13, lineHeight: 1.6 }}>
        This preview lets you read through quest content, but the actual game requires a
        real terminal and keyboard. For the full experience:
      </p>
      <ul style={{ margin: '0 0 12px', padding: '0 0 0 16px', color: C.dimWhite, fontSize: 13, lineHeight: 1.8 }}>
        <li>Install the CLI: <code style={{ color: C.cyan }}>npm install -g terminal-tutor &amp;&amp; tt</code></li>
        <li>Open this page on a <strong style={{ color: C.white }}>desktop browser</strong> for the full interactive terminal</li>
      </ul>
      <button onClick={onDismiss} style={{
        background: C.orange,
        border: 'none',
        borderRadius: 4,
        color: '#000',
        fontFamily: 'inherit',
        fontWeight: 700,
        fontSize: 13,
        padding: '6px 16px',
        cursor: 'pointer',
      }}>
        Got it, show me the preview
      </button>
    </div>
  );
}

function QuestBrowser({ onSelect }: { onSelect: (pack: Pack) => void }) {
  const MAIN_IDS = new Set(['terminal-basics', 'terminal-basics-2']);
  return (
    <div>
      <h2 style={{ color: C.magenta, margin: '0 0 16px', fontSize: 18 }}>Choose a Quest</h2>
      {allPacks.map(pack => (
        <button key={pack.id} onClick={() => onSelect(pack)} style={{
          display: 'block',
          width: '100%',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 10,
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          <div style={{ color: C.cyan, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            {pack.title}
            {MAIN_IDS.has(pack.id) && (
              <span style={{ color: C.green, fontSize: 12, marginLeft: 8, fontWeight: 600 }}>★ MAIN QUEST</span>
            )}
          </div>
          <div style={{ color: C.muted, fontSize: 12 }}>{pack.tool} · {pack.stories.length} {pack.stories.length === 1 ? 'story' : 'stories'}</div>
          <div style={{ color: C.dimWhite, fontSize: 13, marginTop: 4 }}>{pack.synopsis}</div>
        </button>
      ))}
    </div>
  );
}

function StoryPicker({ pack, onSelect, onBack }: { pack: Pack; onSelect: (s: Story) => void; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} style={backBtnStyle}>← Back</button>
      <h2 style={{ color: C.magenta, margin: '0 0 4px', fontSize: 17 }}>{pack.title}</h2>
      <p style={{ color: C.muted, margin: '0 0 16px', fontSize: 13 }}>Choose a story</p>
      {pack.stories.map(story => (
        <button key={story.id} onClick={() => onSelect(story)} style={{
          display: 'block',
          width: '100%',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 10,
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          <div style={{ color: C.cyan, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{story.title}</div>
          <div style={{ color: C.dimWhite, fontSize: 13 }}>{story.setting}</div>
        </button>
      ))}
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  color: C.muted,
  fontFamily: 'inherit',
  fontSize: 13,
  padding: '6px 12px',
  cursor: 'pointer',
  marginBottom: 16,
  display: 'block',
};

const primaryBtnStyle: React.CSSProperties = {
  background: C.magenta,
  border: 'none',
  borderRadius: 6,
  color: '#000',
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: 14,
  padding: '10px 20px',
  cursor: 'pointer',
  marginTop: 12,
  display: 'block',
  width: '100%',
};

const revealBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${C.green}`,
  borderRadius: 6,
  color: C.green,
  fontFamily: 'inherit',
  fontWeight: 600,
  fontSize: 14,
  padding: '10px 20px',
  cursor: 'pointer',
  marginTop: 12,
  display: 'block',
  width: '100%',
};

function QuestViewer({ pack, story, onBack }: { pack: Pack; story: Story; onBack: () => void }) {
  // We walk through the story items. When we hit a BranchPoint the user picks a branch;
  // then we continue through that branch's steps before returning to the next top-level item.
  type Segment =
    | { kind: 'step'; step: Step }
    | { kind: 'branch'; bp: BranchPoint };

  // Build the flat list of segments, inserting chosen branch steps on the fly
  const [segments, setSegments] = useState<Segment[]>(() =>
    story.steps.map(s => s.type === 'branch' ? { kind: 'branch' as const, bp: s as BranchPoint } : { kind: 'step' as const, step: s as Step })
  );
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const totalSteps = segments.filter(s => s.kind === 'step').length;
  const stepNum = segments.slice(0, idx + 1).filter(s => s.kind === 'step').length;

  function advance() {
    setRevealed(false);
    setChosenAnswer(null);
    if (idx + 1 >= segments.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
    }
  }

  function chooseBranch(branch: Branch) {
    const branchSegments: Segment[] = branch.steps.map(s => ({ kind: 'step', step: s }));
    setSegments(prev => {
      const before = prev.slice(0, idx + 1);
      const after = prev.slice(idx + 1);
      return [...before, ...branchSegments, ...after];
    });
    setIdx(i => i + 1);
    setRevealed(false);
    setChosenAnswer(null);
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
        <h2 style={{ color: C.green, margin: '0 0 8px' }}>Quest Complete!</h2>
        <p style={{ color: C.muted, marginBottom: 24 }}>{pack.title} — {story.title}</p>
        <button onClick={onBack} style={{ ...primaryBtnStyle, background: C.green }}>
          Back to Quests
        </button>
      </div>
    );
  }

  const current = segments[idx];
  if (!current) return null;

  if (current.kind === 'branch') {
    const bp = current.bp;
    return (
      <div>
        <button onClick={onBack} style={backBtnStyle}>← Quit Quest</button>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>
          {pack.title} · {story.title}
        </div>
        <div style={{
          background: C.surface,
          border: `1px solid ${C.magenta}`,
          borderRadius: 8,
          padding: '16px',
          marginBottom: 16,
        }}>
          <p style={{ color: C.magenta, fontWeight: 700, margin: '0 0 4px', fontSize: 13 }}>⚡ DECISION POINT</p>
          <p style={{ color: C.white, margin: 0, lineHeight: 1.6 }}>{bp.narration}</p>
        </div>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Tap to choose your path:</p>
        {bp.branches.map(b => (
          <button key={b.label} onClick={() => chooseBranch(b)} style={{
            display: 'block',
            width: '100%',
            background: C.surface,
            border: `1px solid ${C.cyan}`,
            borderRadius: 8,
            padding: '14px 16px',
            marginBottom: 10,
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            <div style={{ color: C.cyan, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{b.label}</div>
            <div style={{ color: C.dimWhite, fontSize: 13 }}>{b.flavor}</div>
          </button>
        ))}
      </div>
    );
  }

  const step = current.step;
  const isPrompt = step.verify.mode === 'prompt';
  const canAdvance = isPrompt ? chosenAnswer !== null : revealed;

  return (
    <div>
      <button onClick={onBack} style={backBtnStyle}>← Quit Quest</button>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>
        {pack.title} · {story.title} · Step {stepNum} of {totalSteps}
      </div>

      {/* Progress bar */}
      <div style={{ background: C.border, borderRadius: 4, height: 4, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          background: C.magenta,
          height: '100%',
          width: `${Math.round((stepNum / totalSteps) * 100)}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Narration */}
      <p style={{ color: C.white, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
        {step.narration}
      </p>

      {/* Objective */}
      <div style={{
        background: C.surface,
        border: `1px solid ${C.cyan}`,
        borderRadius: 8,
        padding: '12px 14px',
        marginBottom: 16,
      }}>
        <div style={{ color: C.cyan, fontSize: 11, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>OBJECTIVE</div>
        <div style={{ color: C.white, fontSize: 13, lineHeight: 1.5 }}>{step.objective}</div>
      </div>

      {/* Prompt mode — tap a choice */}
      {isPrompt && step.verify.choices && (
        <div>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>Tap your answer:</p>
          {step.verify.choices.map(choice => (
            <button key={choice} onClick={() => setChosenAnswer(choice)} style={{
              display: 'block',
              width: '100%',
              background: chosenAnswer === choice ? '#1a2a1a' : C.surface,
              border: `1px solid ${chosenAnswer === choice ? C.green : C.border}`,
              borderRadius: 6,
              color: chosenAnswer === choice ? C.green : C.dimWhite,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: chosenAnswer === choice ? 700 : 400,
              padding: '10px 14px',
              marginBottom: 8,
              textAlign: 'left',
              cursor: 'pointer',
            }}>
              {choice}
            </button>
          ))}
          {chosenAnswer && (
            <p style={{ color: C.green, fontSize: 13, marginTop: 4 }}>
              ✓ {chosenAnswer === (step.verify.answer ?? (step.verify.answers?.[0])) ? 'Correct!' : `The answer is: ${step.verify.answer ?? step.verify.answers?.[0]}`}
            </p>
          )}
        </div>
      )}

      {/* Shell mode — reveal command */}
      {!isPrompt && (
        <div>
          {!revealed ? (
            <button onClick={() => setRevealed(true)} style={revealBtnStyle}>
              👁 Reveal Command
            </button>
          ) : (
            <div style={{
              background: '#0a1a0a',
              border: `1px solid ${C.green}`,
              borderRadius: 8,
              padding: '12px 16px',
              marginTop: 12,
            }}>
              <div style={{ color: C.green, fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>COMMAND</div>
              <code style={{ color: C.green, fontSize: 15, fontWeight: 700, display: 'block' }}>
                {step.solution ?? step.hints[step.hints.length - 1] ?? '(see hints below)'}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Hints */}
      {step.hints.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ color: C.muted, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            💡 Show hints ({step.hints.length})
          </summary>
          <div style={{ marginTop: 8 }}>
            {step.hints.map((hint, i) => (
              <div key={i} style={{
                background: '#1a1800',
                border: `1px solid ${C.yellow}`,
                borderRadius: 6,
                padding: '10px 12px',
                marginBottom: 6,
                color: C.yellow,
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                <strong>Hint {i + 1}:</strong> {hint}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Next */}
      <button
        onClick={advance}
        disabled={!canAdvance}
        style={{
          ...primaryBtnStyle,
          opacity: canAdvance ? 1 : 0.4,
          cursor: canAdvance ? 'pointer' : 'not-allowed',
        }}
      >
        {idx + 1 >= segments.length ? '🏁 Complete Quest' : '→ Next Step'}
      </button>
    </div>
  );
}

export default function MobilePreview() {
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [view, setView] = useState<View>({ kind: 'browser' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDisclaimerDismissed(!!localStorage.getItem('tt_mobile_disclaimer_seen'));
    }
  }, []);

  function dismissDisclaimer() {
    localStorage.setItem('tt_mobile_disclaimer_seen', '1');
    setDisclaimerDismissed(true);
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: C.bg,
      color: C.white,
      fontFamily: "'Courier New', 'Courier', monospace",
      boxSizing: 'border-box',
      padding: '20px 16px 40px',
      overflowY: 'auto',
    }}>
      {!disclaimerDismissed && <Disclaimer onDismiss={dismissDisclaimer} />}

      {view.kind === 'browser' && (
        <QuestBrowser onSelect={pack => setView({ kind: 'stories', pack })} />
      )}

      {view.kind === 'stories' && (
        <StoryPicker
          pack={view.pack}
          onSelect={story => setView({ kind: 'quest', pack: view.pack, story })}
          onBack={() => setView({ kind: 'browser' })}
        />
      )}

      {view.kind === 'quest' && (
        <QuestViewer
          pack={view.pack}
          story={view.story}
          onBack={() => setView({ kind: 'stories', pack: view.pack })}
        />
      )}
    </div>
  );
}
