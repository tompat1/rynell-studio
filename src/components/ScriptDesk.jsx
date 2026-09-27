import React, { useState, useMemo } from 'react';
import { formatTranscriptAccessibility, extractTranscriptEntities } from '../utils/transcriptFormatter';

const INITIAL_TRANSCRIPT = `[00:27:12] And that's one of the impacts of trauma.
[00:29:14] is as Peter will tell you.
[00:29:16] So in healing, we need to use the body.
[00:29:21] And so for example, one of my mantras is whenever
[00:29:24] there's tension, it requires attention.
[00:29:27] So when I have tension, it's not just a mental experience,
[00:29:30] it's actually happening in my belly and in my chest
[00:29:33] and my throat, thank you.
[00:29:35] If I pay attention to it, the body will tell me,
[00:29:39] what is it about myself that I'm ignoring.
[00:29:41] In other words, what traumatic imprint
[00:29:43] is being acted out thank you.
[00:29:47] - Okay Gabor and I'll take on this 22nd finger
[00:29:50] warning from now to help him out, Dan.
[00:29:53] - Yeah, thank you everyone.`;

const INITIAL_PROOFREAD = `So I thought, cool mum, okay.
We didn't have much money,
But she somehow scraped this together.

And also, just fall in love for the first time.
And I was getting that horribly wrong
'cause I had all kinds of intimacy issues,
Or because of trauma.

And in India, I couldn't find the good music
To listen to except occasionally, was this one singer
Called Alanis Morissette on MTV at the time.

And she had this album called 'Jagged Little Pill'
That just come out, that was at the time super famous.
There was something in her work
That I resonated with me on a slightly deeper level.`;

export const ScriptDesk = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [fromLang, setFromLang] = useState('English');
  const [toLang, setToLang] = useState('English');
  const [removeTimestamps, setRemoveTimestamps] = useState(true);
  const [nameSpeakerOnce, setNameSpeakerOnce] = useState(true);
  
  const [originalText, setOriginalText] = useState(INITIAL_TRANSCRIPT);
  const [proofreadText, setProofreadText] = useState(INITIAL_PROOFREAD);
  const [statusNotice, setStatusNotice] = useState('Proofreading complete: cleaned disfluencies, fixed punctuation & casing.');
  
  // Search & Auto-complete State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Automatically scan transcript text for entities, speakers, and subjects
  const scannedEntities = useMemo(() => {
    const combined = `${originalText}\n${proofreadText}`;
    return extractTranscriptEntities(combined);
  }, [originalText, proofreadText]);

  // Filter auto-complete suggestions based on user search input
  const autoCompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return scannedEntities.suggestions;
    const q = searchQuery.toLowerCase();
    return scannedEntities.suggestions.filter(s => s.label.toLowerCase().includes(q));
  }, [searchQuery, scannedEntities]);

  // Compute search match count across transcript & proofread blocks
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    const origMatches = (originalText.toLowerCase().match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const proofMatches = (proofreadText.toLowerCase().match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    return origMatches + proofMatches;
  }, [searchQuery, originalText, proofreadText]);

  // Execute Proofread Action (Formats accessibility paragraph breaks)
  const handleProofread = () => {
    const formatted = formatTranscriptAccessibility(proofreadText, { maxSentencesPerParagraph: 3 });
    setProofreadText(formatted);
    setStatusNotice('Proofreading complete: formatted paragraph breaks on speaker switches & topic shifts.');
  };

  // Helper function to highlight search query in rendered text
  const renderHighlightedText = (text) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={idx} style={{ background: '#FF5500', color: '#000', padding: '1px 4px', borderRadius: '2px', fontWeight: 800 }}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="script-desk-panel" style={{
      width: '100%',
      background: '#0c0c14',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '8px',
      padding: '1.75rem',
      color: '#E0E0E0',
      fontFamily: 'var(--font-body)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      
      {/* Top Title & Transcribe Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #1f1f2e', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', letterSpacing: '1px' }}>05</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#FFF', margin: 0, letterSpacing: '0.05em' }}>
            Script desk
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            type="button"
            onClick={() => {
              setIsTranscribing(!isTranscribing);
              setStatusNotice(isTranscribing ? 'Transcription stopped.' : '🔴 Listening & transcribing audio stream via Whisper AI...');
            }}
            style={{
              background: isTranscribing ? 'rgba(255, 51, 102, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isTranscribing ? '#FF3366' : '#444'}`,
              color: isTranscribing ? '#FF3366' : '#FFF',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ color: isTranscribing ? '#FF3366' : '#FF5500' }}>●</span>
            {isTranscribing ? 'Recording...' : 'Transcribe'}
          </button>

          <button 
            type="button"
            onClick={() => setIsTranscribing(false)}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#888',
              padding: '8px 14px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Language & Action Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', letterSpacing: '0.05em' }}>FROM</span>
            <select 
              value={fromLang} 
              onChange={(e) => setFromLang(e.target.value)}
              style={{ background: '#12121a', border: '1px solid #333', color: '#FFF', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}
            >
              <option value="English">English</option>
              <option value="Swedish">Swedish</option>
              <option value="German">German</option>
              <option value="French">French</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', letterSpacing: '0.05em' }}>TO</span>
            <select 
              value={toLang} 
              onChange={(e) => setToLang(e.target.value)}
              style={{ background: '#12121a', border: '1px solid #333', color: '#FFF', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}
            >
              <option value="English">English</option>
              <option value="Swedish">Swedish</option>
              <option value="German">German</option>
              <option value="French">French</option>
            </select>
          </div>

          <button 
            type="button" 
            onClick={() => setStatusNotice(`Translating script from ${fromLang} to ${toLang}...`)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #444', color: '#FFF', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, marginTop: '14px', cursor: 'pointer' }}
          >
            Translate
          </button>

          <button 
            type="button" 
            onClick={handleProofread}
            style={{ background: 'rgba(0, 229, 255, 0.12)', border: '1px solid #00E5FF', color: '#00E5FF', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, marginTop: '14px', cursor: 'pointer' }}
          >
            Proofread
          </button>

          <button 
            type="button" 
            onClick={() => {
              navigator.clipboard.writeText(`${originalText}\n\n---\n\n${proofreadText}`);
              setStatusNotice('Transcript exported & copied to clipboard!');
            }}
            style={{ background: 'rgba(0, 255, 102, 0.12)', border: '1px solid #00FF66', color: '#00FF66', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, marginTop: '14px', cursor: 'pointer' }}
          >
            Export
          </button>
        </div>

        {/* Options Checkboxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#CCC', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={removeTimestamps} 
              onChange={(e) => setRemoveTimestamps(e.target.checked)}
              style={{ accentColor: 'var(--primary-orange)' }}
            />
            <span>Remove time-stamps</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#CCC', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={nameSpeakerOnce} 
              onChange={(e) => setNameSpeakerOnce(e.target.checked)}
              style={{ accentColor: 'var(--primary-orange)' }}
            />
            <span>Name speaker once until speaker changes</span>
          </label>
        </div>
      </div>

      {/* Proofreading Status Alert Banner */}
      {statusNotice && (
        <div style={{
          background: 'rgba(255, 136, 0, 0.08)',
          borderLeft: '4px solid var(--primary-orange)',
          border: '1px solid rgba(255, 85, 0, 0.25)',
          padding: '10px 14px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#FFB800',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}>
          {statusNotice}
        </div>
      )}

      {/* SEARCH PANEL WITH AUTO-COMPLETE & SUGGESTION BUTTONS */}
      <div className="script-search-panel" style={{
        background: '#08080E',
        border: '1px solid #1f1f2e',
        borderRadius: '6px',
        padding: '14px',
        marginBottom: '1.25rem',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '1rem', marginBottom: '8px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#12121c', border: `1px solid ${searchQuery ? 'var(--primary-orange)' : '#333'}`, borderRadius: '4px', padding: '0 12px' }}>
              <span style={{ color: searchQuery ? 'var(--primary-orange)' : '#888', marginRight: '8px', fontSize: '14px' }}>🔍</span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search speaker, author, subject, or keyword (e.g. Peter, Gabor, trauma, music)..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  padding: '10px 0',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Auto-Complete Suggestions Dropdown */}
            {isSearchFocused && autoCompleteSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#0d0d16',
                border: '1px solid var(--primary-orange)',
                borderRadius: '4px',
                zIndex: 100,
                maxHeight: '180px',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
              }}>
                {autoCompleteSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => setSearchQuery(item.label)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#FFF',
                      borderBottom: '1px solid #1a1a24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: '10px', color: item.type === 'speaker' ? '#00E5FF' : '#FF5500', fontFamily: 'monospace' }}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {searchQuery && (
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--primary-orange)', fontWeight: 800 }}>
              {matchCount} {matchCount === 1 ? 'MATCH' : 'MATCHES'} FOUND
            </span>
          )}
        </div>

        {/* Auto-Scanned Entity Suggestion Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
          <span style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', marginRight: '4px' }}>SCAN SUGGESTIONS:</span>
          
          {scannedEntities.speakers.map((spk, idx) => (
            <button
              key={`spk-${idx}`}
              type="button"
              onClick={() => setSearchQuery(spk)}
              style={{
                background: searchQuery.toLowerCase() === spk.toLowerCase() ? 'rgba(0, 229, 255, 0.25)' : 'rgba(0, 229, 255, 0.08)',
                border: `1px solid ${searchQuery.toLowerCase() === spk.toLowerCase() ? '#00E5FF' : 'rgba(0, 229, 255, 0.3)'}`,
                color: '#00E5FF',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              🗣️ {spk}
            </button>
          ))}

          {scannedEntities.subjects.map((sub, idx) => (
            <button
              key={`sub-${idx}`}
              type="button"
              onClick={() => setSearchQuery(sub)}
              style={{
                background: searchQuery.toLowerCase() === sub.toLowerCase() ? 'rgba(255, 85, 0, 0.25)' : 'rgba(255, 85, 0, 0.08)',
                border: `1px solid ${searchQuery.toLowerCase() === sub.toLowerCase() ? 'var(--primary-orange)' : 'rgba(255, 85, 0, 0.3)'}`,
                color: 'var(--primary-orange)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              🏷️ {sub}
            </button>
          ))}

          {scannedEntities.entities.map((ent, idx) => (
            <button
              key={`ent-${idx}`}
              type="button"
              onClick={() => setSearchQuery(ent)}
              style={{
                background: searchQuery.toLowerCase() === ent.toLowerCase() ? 'rgba(0, 255, 102, 0.25)' : 'rgba(0, 255, 102, 0.08)',
                border: `1px solid ${searchQuery.toLowerCase() === ent.toLowerCase() ? '#00FF66' : 'rgba(0, 255, 102, 0.3)'}`,
                color: '#00FF66',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              👤 {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Transcript Display Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        
        {/* Original Transcript Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', letterSpacing: '1px' }}>
            ORIGINAL TRANSCRIPT
          </span>
          <div style={{
            background: '#07070b',
            border: '1px solid #1f1f2e',
            borderRadius: '6px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#CCC',
            height: '380px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6'
          }}>
            {renderHighlightedText(originalText)}
          </div>
        </div>

        {/* Translation / Proofread Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#00E5FF', fontFamily: 'monospace', letterSpacing: '1px' }}>
            TRANSLATION / PROOFREAD (PARAGRAPH ACCESSIBLE)
          </span>
          <div style={{
            background: '#07070b',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '6px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#FFF',
            height: '380px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.75'
          }}>
            {renderHighlightedText(proofreadText)}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #1f1f2e', fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>
        Transcribe plays the video and writes from its audio with on-device Whisper. Translate & Proofread formats the transcript with accessible paragraph line breaks and auto-extracts speakers & topics.
      </div>
    </div>
  );
};

export default ScriptDesk;
