/**
 * Preset Demo Sequences & Colors for Studio Animated GIF Maker
 */

import merchHoodie from '../assets/merch/hoodie_merch_blackout_07.webp';
import merchCap from '../assets/merch/cap_merch_blackout_07.webp';
import merchTee from '../assets/merch/tee_merch_blackout_06.webp';
import merchTote from '../assets/merch/tote_merch_blackout_09.webp';
import merchCase from '../assets/merch/caseiphone_merch_blackout_10.webp';
import merchSticker from '../assets/merch/bolt_sticker_merch_neutral_01.webp';

import camp01 from '../assets/campaigns/campaign_01.webp';
import camp02 from '../assets/campaigns/campaign_02.webp';
import camp03 from '../assets/campaigns/campaign_03.webp';
import camp04 from '../assets/campaigns/campaign_04.webp';

import pulseBolt01 from '../assets/pulse_bolt_frame1.svg';
import pulseBolt02 from '../assets/pulse_bolt_frame2.svg';
import pulseBolt03 from '../assets/pulse_bolt_frame3.svg';
import pulseBolt04 from '../assets/pulse_bolt_frame4.svg';

export const BG_COLOR_MAP = {
  transparent: 'transparent',
  black: '#000000',
  white: '#ffffff',
  orange: '#ff6a00'
};

export const DEMO_SEQUENCES = [
  {
    id: 'merch_drop',
    title: '⚡ STUDIO MERCH DROP (6 FRAMES)',
    desc: 'High-speed streetwear sequence cycling through hoodie, cap, tee, tote, case, and sticker.',
    delayMs: 250,
    frames: [
      { name: 'hoodie_blackout.webp', url: merchHoodie, delayMs: 250 },
      { name: 'cap_blackout.webp', url: merchCap, delayMs: 250 },
      { name: 'tee_blackout.webp', url: merchTee, delayMs: 250 },
      { name: 'tote_blackout.webp', url: merchTote, delayMs: 250 },
      { name: 'case_blackout.webp', url: merchCase, delayMs: 250 },
      { name: 'sticker_bolt.webp', url: merchSticker, delayMs: 250 }
    ]
  },
  {
    id: 'campaign_pulse',
    title: '🎨 CAMPAIGN EDIT (4 FRAMES)',
    desc: 'Brutalist graphic design campaign posters cycling with studio rhythm.',
    delayMs: 350,
    frames: [
      { name: 'campaign_01.webp', url: camp01, delayMs: 350 },
      { name: 'campaign_02.webp', url: camp02, delayMs: 350 },
      { name: 'campaign_03.webp', url: camp03, delayMs: 350 },
      { name: 'campaign_04.webp', url: camp04, delayMs: 350 }
    ]
  },
  {
    id: 'rotating_bolt',
    title: '⚡ PULSE VECTOR BOLT (4 FRAMES)',
    desc: 'Studio lightning icon oscillating with rotational dynamics, shockwaves and hyper-voltage pulse.',
    delayMs: 140,
    frames: [
      { name: 'pulse_bolt_01_norm.svg', url: pulseBolt01, delayMs: 140, transform: 'scale(0.95)' },
      { name: 'pulse_bolt_02_surge.svg', url: pulseBolt02, delayMs: 140, transform: 'rotate(-4deg) scale(1.08)' },
      { name: 'pulse_bolt_03_overdrive.svg', url: pulseBolt03, delayMs: 140, transform: 'rotate(4deg) scale(1.22)' },
      { name: 'pulse_bolt_04_afterglow.svg', url: pulseBolt04, delayMs: 140, transform: 'rotate(-1deg) scale(1.02)' }
    ]
  }
];

export const getDefaultFrames = () => {
  const defaultDemo = DEMO_SEQUENCES[0];
  return defaultDemo.frames.map((item, index) => ({
    id: `frame_${index}_${item.name}`,
    name: item.name,
    url: item.url,
    delayMs: item.delayMs || defaultDemo.delayMs,
    transform: item.transform || 'none',
    width: 600,
    height: 600
  }));
};
