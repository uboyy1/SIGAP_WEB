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
    id: 'ocean-blue',
    label: 'Ocean Blue',
    accent: '#0284C7',
    background: 'linear-gradient(135deg,#06204f 0%,#0369a1 48%,#06b6d4 100%)',
    pattern: 'radial-gradient(ellipse at 16% 112%,rgba(125,211,252,0.34) 0 31%,transparent 32%),radial-gradient(ellipse at 78% -12%,rgba(255,255,255,0.24) 0 30%,transparent 31%),repeating-radial-gradient(ellipse at 50% 116%,rgba(255,255,255,0.24) 0 2px,transparent 2px 26px),linear-gradient(135deg,rgba(255,255,255,0.13),transparent 50%)',
    patternSize: '560px 260px,620px 290px,420px 210px,100% 100%'
  },
  {
    id: 'emerald-flow',
    label: 'Emerald Flow',
    accent: '#059669',
    background: 'linear-gradient(135deg,#064e3b 0%,#059669 50%,#14b8a6 100%)',
    pattern: 'radial-gradient(ellipse at 18% 18%,rgba(167,243,208,0.22) 0 26%,transparent 27%),radial-gradient(ellipse at 82% 82%,rgba(2,44,34,0.24) 0 34%,transparent 35%),conic-gradient(from 210deg at 28% 66%,transparent 0 24%,rgba(255,255,255,0.18) 25% 29%,transparent 30% 100%),linear-gradient(118deg,transparent 0 42%,rgba(255,255,255,0.12) 42% 43%,transparent 43%)',
    patternSize: '560px 300px,640px 360px,520px 280px,500px 280px'
  },
  {
    id: 'sunset-orange',
    label: 'Sunset Orange',
    accent: '#EA580C',
    background: 'linear-gradient(135deg,#7c2d12 0%,#ea580c 48%,#facc15 100%)',
    pattern: 'linear-gradient(112deg,transparent 0 18%,rgba(255,255,255,0.2) 18% 30%,transparent 30% 100%),linear-gradient(112deg,transparent 0 44%,rgba(255,255,255,0.14) 44% 54%,transparent 54% 100%),linear-gradient(112deg,transparent 0 69%,rgba(120,53,15,0.18) 69% 80%,transparent 80% 100%),radial-gradient(circle at 84% 18%,rgba(255,255,255,0.22) 0 76px,transparent 78px)',
    patternSize: '620px 340px,680px 360px,760px 400px,520px 280px'
  },
  {
    id: 'royal-purple',
    label: 'Royal Purple',
    accent: '#7C3AED',
    background: 'linear-gradient(135deg,#2e1065 0%,#6d28d9 48%,#a855f7 100%)',
    pattern: 'linear-gradient(30deg,rgba(255,255,255,0.16) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,0.16) 87.5%),linear-gradient(150deg,rgba(255,255,255,0.1) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,0.1) 87.5%),conic-gradient(from 45deg at 76% 32%,rgba(255,255,255,0.22) 0 10%,transparent 10% 36%,rgba(255,255,255,0.12) 36% 46%,transparent 46% 100%)',
    patternSize: '96px 56px,96px 56px,460px 280px'
  },
  {
    id: 'crimson-red',
    label: 'Crimson Red',
    accent: '#DC2626',
    background: 'linear-gradient(135deg,#450a0a 0%,#991b1b 46%,#e11d48 100%)',
    pattern: 'linear-gradient(28deg,transparent 0 30%,rgba(255,255,255,0.14) 30% 44%,transparent 44%),linear-gradient(145deg,transparent 0 18%,rgba(127,29,29,0.3) 18% 32%,transparent 32% 100%),linear-gradient(70deg,transparent 0 62%,rgba(255,255,255,0.12) 62% 74%,transparent 74%),radial-gradient(circle at 82% 72%,rgba(254,202,202,0.18) 0 96px,transparent 98px)',
    patternSize: '520px 320px,620px 360px,560px 320px,560px 330px'
  },
  {
    id: 'midnight-dark',
    label: 'Midnight Dark',
    accent: '#38BDF8',
    background: 'linear-gradient(135deg,#020617 0%,#111827 50%,#0f172a 100%)',
    pattern: 'linear-gradient(rgba(148,163,184,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.12) 1px,transparent 1px),linear-gradient(116deg,transparent 0 45%,rgba(34,211,238,0.42) 45% 45.6%,transparent 45.6% 100%),radial-gradient(circle at 78% 26%,rgba(59,130,246,0.22) 0 92px,transparent 94px)',
    patternSize: '46px 46px,46px 46px,720px 400px,560px 320px'
  },
  {
    id: 'batik-modern-indonesia',
    label: 'Batik Modern Indonesia',
    accent: '#D6A33A',
    background: 'linear-gradient(135deg,#061733 0%,#0f2f61 54%,#10213f 100%)',
    pattern: 'radial-gradient(circle at 25% 25%,rgba(214,163,58,0.32) 0 4px,transparent 5px),radial-gradient(circle at 75% 75%,rgba(214,163,58,0.2) 0 4px,transparent 5px),linear-gradient(45deg,transparent 0 43%,rgba(214,163,58,0.18) 43% 47%,transparent 47% 53%,rgba(214,163,58,0.13) 53% 57%,transparent 57%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent 46%)',
    patternSize: '98px 98px,98px 98px,64px 64px,100% 100%'
  },
  {
    id: 'hexagon-tech',
    label: 'Hexagon Tech',
    accent: '#0EA5E9',
    background: 'linear-gradient(135deg,#031b4e 0%,#1d4ed8 50%,#22d3ee 100%)',
    pattern: 'linear-gradient(30deg,rgba(255,255,255,0.16) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,0.16) 87.5%),linear-gradient(150deg,rgba(255,255,255,0.12) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,0.12) 87.5%),linear-gradient(30deg,rgba(255,255,255,0.08) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,0.08) 87.5%),radial-gradient(circle at 74% 28%,rgba(255,255,255,0.18) 0 76px,transparent 78px)',
    patternSize: '86px 50px,86px 50px,172px 100px,520px 300px'
  },
  {
    id: 'glass-gradient',
    label: 'Glass Gradient',
    accent: '#C026D3',
    background: 'linear-gradient(135deg,#f9a8d4 0%,#8b5cf6 46%,#2563eb 100%)',
    pattern: 'radial-gradient(circle at 20% 24%,rgba(255,255,255,0.42) 0 74px,transparent 76px),radial-gradient(circle at 78% 66%,rgba(255,255,255,0.24) 0 108px,transparent 110px),linear-gradient(135deg,rgba(255,255,255,0.24),transparent 25%,rgba(255,255,255,0.12) 56%,transparent 78%),linear-gradient(118deg,transparent 0 58%,rgba(255,255,255,0.22) 58% 59%,transparent 59%)',
    patternSize: '520px 300px,620px 360px,100% 100%,640px 360px'
  },
  {
    id: 'water-network',
    label: 'Water Network',
    accent: '#2196F3',
    background: 'linear-gradient(135deg,#158CD6 0%,#2196F3 52%,#38BDF8 100%)',
    pattern: 'radial-gradient(circle at 18% 34%,rgba(255,255,255,0.5) 0 4px,transparent 5px),radial-gradient(circle at 46% 20%,rgba(255,255,255,0.42) 0 4px,transparent 5px),radial-gradient(circle at 72% 58%,rgba(255,255,255,0.48) 0 4px,transparent 5px),linear-gradient(28deg,transparent 0 32%,rgba(255,255,255,0.26) 32% 32.5%,transparent 32.5% 100%),linear-gradient(152deg,transparent 0 50%,rgba(255,255,255,0.2) 50% 50.5%,transparent 50.5% 100%),radial-gradient(ellipse at 82% -12%,rgba(255,255,255,0.24) 0 30%,transparent 31%)',
    patternSize: '360px 190px,420px 230px,480px 260px,560px 320px,620px 340px,520px 260px'
  },
  {
    id: 'cyber-lime',
    label: 'Cyber Lime',
    accent: '#84CC16',
    background: 'linear-gradient(135deg,#111827 0%,#365314 48%,#84cc16 100%)',
    pattern: 'radial-gradient(circle at 20% 28%,rgba(217,249,157,0.24) 0 72px,transparent 74px),radial-gradient(circle at 82% 70%,rgba(22,101,52,0.28) 0 104px,transparent 106px),linear-gradient(90deg,transparent 0 18%,rgba(217,249,157,0.2) 18% 18.5%,transparent 18.5% 100%),linear-gradient(0deg,transparent 0 58%,rgba(217,249,157,0.16) 58% 58.5%,transparent 58.5% 100%),radial-gradient(circle,rgba(255,255,255,0.42) 0 2px,transparent 3px)',
    patternSize: '520px 300px,620px 360px,220px 120px,240px 140px,120px 80px'
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
