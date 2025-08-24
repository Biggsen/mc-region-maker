const prefixes = [
  'Dra', 'Mys', 'Sha', 'Gol', 'Cry', 'Dar', 'Lig', 'Sac', 'Hid', 'Los',
  'For', 'Ete', 'Anc', 'Mys', 'Enc', 'Ble', 'Cur', 'Hol', 'Pro', 'Whi',
  'Sil', 'Thu', 'Fro', 'Bur', 'Eme', 'Sap', 'Rub', 'Dia', 'Iro', 'Ste',
  'Bro', 'Sil', 'Gol', 'Obs', 'Gra', 'Mar', 'Jad', 'Ara', 'Val', 'Nor',
  'Eas', 'Wes', 'Sou', 'Nor', 'Mid', 'Upp', 'Low', 'Out', 'Inn', 'Cen',
  'Sum', 'Kra', 'Dem', 'Hel', 'Kam', 'Zor', 'Vex', 'Nyx', 'Rav', 'Sol',
  'Lun', 'Ast', 'Cos', 'Neb', 'Gal', 'Sta', 'Com', 'Met', 'Aur', 'Ion'
]

const suffixes = [
  'monia', 'taria', 'doria', 'landia', 'aria', 'oria', 'enia', 'ania', 'onia', 'eria',
  'land', 'realm', 'kingdom', 'empire', 'domain', 'territory', 'province', 'region', 'zone', 'area',
  'hold', 'keep', 'fort', 'castle', 'tower', 'citadel', 'palace', 'sanctuary', 'haven', 'refuge',
  'vale', 'peak', 'ridge', 'hollow', 'grove', 'forest', 'marsh', 'swamp', 'moor', 'heath',
  'glade', 'meadow', 'field', 'plains', 'hills', 'mountains', 'valley', 'canyon', 'ravine',
  'spring', 'falls', 'lake', 'river', 'stream', 'pond', 'bay', 'cove', 'harbor', 'port',
  'esi', 'ado', 'ish', 'itha', 'masa', 'dora', 'nara', 'kora', 'lara', 'vara',
  'thos', 'mos', 'dos', 'tos', 'nos', 'ros', 'kos', 'los', 'vos', 'zos'
]

const themes = [
  'Dragon', 'Phoenix', 'Wolf', 'Eagle', 'Lion', 'Bear', 'Stag', 'Hawk', 'Raven', 'Owl',
  'Serpent', 'Wyvern', 'Griffin', 'Unicorn', 'Centaur', 'Troll', 'Giant', 'Dwarf', 'Elf',
  'Knight', 'Wizard', 'Sage', 'Warrior', 'Hunter', 'Ranger', 'Mage', 'Priest', 'Monk',
  'Storm', 'Thunder', 'Lightning', 'Fire', 'Ice', 'Wind', 'Earth', 'Water', 'Light', 'Shadow',
  'Dawn', 'Dusk', 'Midnight', 'Noon', 'Twilight', 'Sunrise', 'Sunset', 'Moon', 'Star', 'Comet',
  'Crystal', 'Magic', 'Mystic', 'Ancient', 'Eternal', 'Sacred', 'Blessed', 'Cursed', 'Holy', 'Profane',
  'Kama', 'Lida', 'Masa', 'Nara', 'Kora', 'Lara', 'Vara', 'Thos', 'Mos', 'Dos'
]

const connectors = ['of', 'the', 'in', 'at', 'by', 'near', 'beyond', 'within', 'under', 'over']

const complexSyllables = [
  'ka', 'ma', 'li', 'da', 'mu', 'sa', 'na', 'ra', 'ko', 'la', 'va', 'tho', 'mo', 'do', 'to', 'no', 'ro', 'ko', 'lo', 'vo', 'zo',
  'dra', 'mys', 'sha', 'gol', 'cry', 'dar', 'lig', 'sac', 'hid', 'los', 'for', 'ete', 'anc', 'enc', 'ble', 'cur', 'hol', 'pro', 'whi', 'sil',
  'thu', 'fro', 'bur', 'eme', 'sap', 'rub', 'dia', 'iro', 'ste', 'bro', 'obs', 'gra', 'mar', 'jad', 'ara', 'val', 'nor', 'eas', 'wes', 'sou'
]

export function generateMedievalName(): string {
  const random = Math.random()
  
  // Different name patterns with different probabilities
  if (random < 0.4) {
    // Pattern: "Prefix + Suffix" (e.g., "Dramonia", "Mystaria")
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${prefix}${suffix}`
  } else if (random < 0.7) {
    // Pattern: "Theme + Suffix" (e.g., "Dragonland", "Crystalrealm")
    const theme = themes[Math.floor(Math.random() * themes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${theme}${suffix}`
  } else if (random < 0.9) {
    // Pattern: Complex multi-syllable name (e.g., "Kamalidumasana")
    const syllableCount = Math.floor(Math.random() * 3) + 3 // 3-5 syllables
    let complexName = ''
    for (let i = 0; i < syllableCount; i++) {
      const syllable = complexSyllables[Math.floor(Math.random() * complexSyllables.length)]
      complexName += syllable
    }
    // Capitalize first letter
    return complexName.charAt(0).toUpperCase() + complexName.slice(1)
  } else {
    // Pattern: "Theme + of + Theme" (e.g., "Dragon of Fire")
    const theme1 = themes[Math.floor(Math.random() * themes.length)]
    const theme2 = themes[Math.floor(Math.random() * themes.length)]
    return `${theme1} of ${theme2}`
  }
}
