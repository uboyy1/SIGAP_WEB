const DEFAULT_PROFILE_COVER_ID = 'sigap-default';

const PROFILE_COVER_OPTIONS = [
  {
    id: DEFAULT_PROFILE_COVER_ID,
    label: 'Biru SIGAP Default',
    accent: '#0D6EFD',
    background: 'linear-gradient(135deg,#0D6EFD 0%,#0B65EE 100%)',
    pattern: 'linear-gradient(118deg,transparent 0 54%,rgba(255,255,255,0.18) 54% 54.6%,transparent 54.6% 68%,rgba(255,255,255,0.12) 68% 68.5%,transparent 68.5%)',
    patternSize: '720px 720px'
  },
  {
    id: 'noir-grid',
    label: 'Thunder Grid',
    accent: '#38BDF8',
    background: 'linear-gradient(135deg,#020617 0%,#0f172a 48%,#082f49 100%)',
    pattern: 'linear-gradient(118deg,transparent 0 32%,rgba(56,189,248,0.56) 32% 33.2%,transparent 33.2% 100%),linear-gradient(296deg,transparent 0 41%,rgba(125,211,252,0.36) 41% 42.2%,transparent 42.2% 100%),linear-gradient(118deg,transparent 0 62%,rgba(255,255,255,0.22) 62% 62.7%,transparent 62.7% 100%),linear-gradient(rgba(148,163,184,0.10) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.10) 1px,transparent 1px)',
    patternSize: '760px 420px,620px 360px,520px 300px,48px 48px,48px 48px'
  },
  {
    id: 'carbon-forge',
    label: 'Inferno Forge',
    accent: '#F97316',
    background: 'linear-gradient(135deg,#0c0a09 0%,#1c1917 44%,#7c2d12 100%)',
    pattern: 'radial-gradient(ellipse at 18% 100%,rgba(249,115,22,0.45) 0 18%,transparent 19%),radial-gradient(ellipse at 74% 112%,rgba(220,38,38,0.38) 0 22%,transparent 23%),conic-gradient(from 210deg at 42% 82%,transparent 0 18%,rgba(251,146,60,0.38) 18% 24%,transparent 24% 40%,rgba(253,186,116,0.18) 40% 47%,transparent 47% 100%),repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0 1px,transparent 1px 18px)',
    patternSize: '520px 300px,620px 340px,560px 320px,120px 120px'
  },
  {
    id: 'steel-command',
    label: 'Batik Steel',
    accent: '#D6A33A',
    background: 'linear-gradient(135deg,#030712 0%,#111827 48%,#312e81 100%)',
    pattern: 'radial-gradient(circle at 25% 25%,rgba(214,163,58,0.34) 0 3px,transparent 4px),radial-gradient(circle at 75% 75%,rgba(214,163,58,0.22) 0 3px,transparent 4px),linear-gradient(45deg,transparent 0 42%,rgba(214,163,58,0.22) 42% 46%,transparent 46% 54%,rgba(214,163,58,0.14) 54% 58%,transparent 58%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent 48%)',
    patternSize: '92px 92px,92px 92px,64px 64px,100% 100%'
  },
  {
    id: 'shadow-circuit',
    label: 'Storm Circuit',
    accent: '#22D3EE',
    background: 'linear-gradient(135deg,#06111f 0%,#0f172a 46%,#083344 100%)',
    pattern: 'linear-gradient(128deg,transparent 0 26%,rgba(34,211,238,0.50) 26% 27.2%,transparent 27.2% 100%),linear-gradient(308deg,transparent 0 54%,rgba(56,189,248,0.32) 54% 55%,transparent 55% 100%),linear-gradient(90deg,transparent 0 18%,rgba(34,211,238,0.24) 18% 18.7%,transparent 18.7% 100%),linear-gradient(0deg,transparent 0 62%,rgba(14,165,233,0.18) 62% 62.7%,transparent 62.7% 100%),repeating-linear-gradient(90deg,rgba(255,255,255,0.08) 0 4px,transparent 4px 42px)',
    patternSize: '680px 360px,560px 320px,220px 140px,240px 160px,180px 120px'
  },
  {
    id: 'onyx-strike',
    label: 'Onyx Strike',
    accent: '#FACC15',
    background: 'linear-gradient(135deg,#030712 0%,#18181b 48%,#422006 100%)',
    pattern: 'linear-gradient(124deg,transparent 0 16%,rgba(250,204,21,0.62) 16% 17.6%,transparent 17.6% 100%),linear-gradient(302deg,transparent 0 36%,rgba(253,224,71,0.38) 36% 37.5%,transparent 37.5% 100%),linear-gradient(124deg,transparent 0 58%,rgba(255,255,255,0.16) 58% 58.8%,transparent 58.8% 100%),radial-gradient(circle at 78% 28%,rgba(250,204,21,0.14) 0 78px,transparent 80px),repeating-linear-gradient(0deg,rgba(255,255,255,0.05) 0 1px,transparent 1px 16px)',
    patternSize: '780px 400px,620px 330px,540px 300px,520px 300px,120px 120px'
  },
  {
    id: 'tactical-matrix',
    label: 'Batik Tactical',
    accent: '#10B981',
    background: 'linear-gradient(135deg,#020617 0%,#052e16 46%,#14532d 100%)',
    pattern: 'radial-gradient(circle at 24px 24px,rgba(16,185,129,0.42) 0 2px,transparent 3px),radial-gradient(circle at 72px 56px,rgba(255,255,255,0.18) 0 2px,transparent 3px),linear-gradient(45deg,transparent 0 42%,rgba(16,185,129,0.24) 42% 47%,transparent 47% 53%,rgba(16,185,129,0.14) 53% 58%,transparent 58%),repeating-radial-gradient(ellipse at 50% 50%,rgba(34,197,94,0.13) 0 2px,transparent 2px 24px),linear-gradient(135deg,rgba(255,255,255,0.08),transparent 42%)',
    patternSize: '96px 96px,112px 112px,72px 72px,180px 100px,100% 100%'
  },
  {
    id: 'rose-linen',
    label: 'Rose Linen',
    accent: '#E11D48',
    isLight: true,
    background: 'linear-gradient(135deg,#fff1f2 0%,#fecdd3 48%,#fb7185 100%)',
    pattern: 'repeating-linear-gradient(45deg,rgba(225,29,72,0.14) 0 1px,transparent 1px 18px),repeating-linear-gradient(135deg,rgba(255,255,255,0.38) 0 1px,transparent 1px 20px),linear-gradient(118deg,transparent 0 56%,rgba(255,255,255,0.40) 56% 57%,transparent 57% 100%)',
    patternSize: '160px 160px,160px 160px,620px 360px'
  },
  {
    id: 'lavender-glass',
    label: 'Lavender Glass',
    accent: '#8B5CF6',
    isLight: true,
    background: 'linear-gradient(135deg,#f5f3ff 0%,#ddd6fe 46%,#a78bfa 100%)',
    pattern: 'linear-gradient(28deg,rgba(255,255,255,0.52) 0 16%,transparent 16% 100%),linear-gradient(152deg,transparent 0 42%,rgba(255,255,255,0.42) 42% 54%,transparent 54% 100%),repeating-linear-gradient(90deg,rgba(124,58,237,0.12) 0 1px,transparent 1px 38px)',
    patternSize: '520px 300px,620px 360px,120px 120px'
  },
  {
    id: 'peach-bloom',
    label: 'Peach Bloom',
    accent: '#F97316',
    isLight: true,
    background: 'linear-gradient(135deg,#fff7ed 0%,#fed7aa 48%,#fda4af 100%)',
    pattern: 'repeating-radial-gradient(circle at 24px 24px,rgba(249,115,22,0.18) 0 2px,transparent 3px 42px),repeating-linear-gradient(120deg,rgba(255,255,255,0.36) 0 2px,transparent 2px 30px),linear-gradient(135deg,rgba(255,255,255,0.32),transparent 46%)',
    patternSize: '96px 96px,220px 180px,100% 100%'
  },
  {
    id: 'mint-pearl',
    label: 'Mint Pearl',
    accent: '#0D9488',
    isLight: true,
    background: 'linear-gradient(135deg,#ecfeff 0%,#ccfbf1 48%,#99f6e4 100%)',
    pattern: 'repeating-linear-gradient(30deg,rgba(13,148,136,0.12) 0 1px,transparent 1px 26px),repeating-linear-gradient(150deg,rgba(255,255,255,0.52) 0 1px,transparent 1px 28px),linear-gradient(112deg,transparent 0 62%,rgba(13,148,136,0.18) 62% 63%,transparent 63% 100%)',
    patternSize: '180px 180px,180px 180px,620px 360px'
  },
  {
    id: 'aurora-silk',
    label: 'Aurora Silk',
    accent: '#DB2777',
    isLight: true,
    background: 'linear-gradient(135deg,#fdf2f8 0%,#fbcfe8 38%,#c4b5fd 74%,#bae6fd 100%)',
    pattern: 'radial-gradient(ellipse at 16% 28%,rgba(255,255,255,0.58) 0 18%,transparent 19%),radial-gradient(ellipse at 82% 74%,rgba(219,39,119,0.14) 0 22%,transparent 23%),repeating-linear-gradient(115deg,rgba(255,255,255,0.42) 0 2px,transparent 2px 34px),linear-gradient(24deg,transparent 0 48%,rgba(219,39,119,0.18) 48% 49%,transparent 49% 100%)',
    patternSize: '520px 300px,620px 360px,220px 180px,680px 360px'
  }
];

const getProfileCoverOption = (id) => (
  PROFILE_COVER_OPTIONS.find((cover) => cover.id === id) || PROFILE_COVER_OPTIONS[0]
);

const isValidProfileCoverId = (id) => PROFILE_COVER_OPTIONS.some((cover) => cover.id === id);

module.exports = {
  DEFAULT_PROFILE_COVER_ID,
  PROFILE_COVER_OPTIONS,
  getProfileCoverOption,
  isValidProfileCoverId
};
