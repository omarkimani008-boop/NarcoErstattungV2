export interface CalcItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const calculatorItems: CalcItem[] = [
  // Essen
  { id: "essen_normal", name: "Normales Essen", price: 1000, category: "Essen" },
  { id: "essen_box", name: "Essen's Boxen", price: 3500, category: "Essen" },

  // Laden
  { id: "repairkit", name: "Repairkit", price: 1000, category: "Laden" },
  { id: "medkit", name: "Medkit", price: 1000, category: "Laden" },
  { id: "bandage", name: "Bandage", price: 120, category: "Laden" },
  { id: "waschlappen", name: "Waschlappen", price: 500, category: "Laden" },
  { id: "handy", name: "Handy", price: 5000, category: "Laden" },
  { id: "gps", name: "GPS", price: 5000, category: "Laden" },
  { id: "angel", name: "Angel", price: 10000, category: "Laden" },
  { id: "rucksack", name: "Rucksack", price: 8000, category: "Laden" },
  { id: "kleidungstasche", name: "Kleidungstasche", price: 23600, category: "Laden" },
  { id: "fernglass", name: "Fernglass", price: 18000, category: "Laden" },
  { id: "sprayentferner", name: "Sprayentferner", price: 5000, category: "Laden" },
  { id: "sonar", name: "Sonar", price: 6500, category: "Laden" },
  { id: "taucheranzug", name: "Taucheranzug", price: 19000, category: "Laden" },
  { id: "kochtopf", name: "Kochtopf", price: 150, category: "Laden" },
  { id: "brot", name: "Brot", price: 50, category: "Laden" },
  { id: "wasser", name: "Wasser", price: 50, category: "Laden" },
  { id: "lottoschein", name: "Lottoschein", price: 40000, category: "Laden" },
  { id: "metalldetektor", name: "Metalldetektor", price: 52000, category: "Laden" },

  // Waffenladen
  { id: "munition", name: "Munition", price: 15000, category: "Waffenladen" },
  { id: "taschenlampe_w", name: "Taschenlampe", price: 30000, category: "Waffenladen" },
  { id: "seile", name: "Seile", price: 1000, category: "Waffenladen" },
  { id: "fallschirm", name: "Fallschirm", price: 45000, category: "Waffenladen" },
  { id: "sack", name: "Sack", price: 20000, category: "Waffenladen" },

  // Beamte – Waffen
  { id: "kampfpistole", name: "Kampfpistole", price: 1000, category: "Beamte – Waffen" },
  { id: "kampf_pdw", name: "Kampf PDW", price: 1500, category: "Beamte – Waffen" },
  { id: "smg", name: "SMG", price: 1500, category: "Beamte – Waffen" },
  { id: "karabiner", name: "Karabiner", price: 3000, category: "Beamte – Waffen" },
  { id: "spezialkarabiner", name: "Spezialkarabiner", price: 9000, category: "Beamte – Waffen" },
  { id: "regierung", name: "Regierung", price: 2000, category: "Beamte – Waffen" },
  { id: "sniper", name: "Sniper", price: 250000, category: "Beamte – Waffen" },
  { id: "leuchtpistole", name: "Leuchtpistole", price: 1500, category: "Beamte – Waffen" },
  { id: "taschenlampe_b", name: "Taschenlampe (Beamte)", price: 500, category: "Beamte – Waffen" },
  { id: "schlagstock", name: "Schlagstock", price: 500, category: "Beamte – Waffen" },
  { id: "tazer", name: "Tazer", price: 1000, category: "Beamte – Waffen" },
  { id: "signalfackel", name: "Signalfackel", price: 1000, category: "Beamte – Waffen" },
  { id: "schwerer_revolver", name: "Schwerer Revolver", price: 3000, category: "Beamte – Waffen" },

  // Beamte – Items
  { id: "weste", name: "Weste", price: 3000, category: "Beamte – Items" },
  { id: "muni_b", name: "Muni", price: 1000, category: "Beamte – Items" },
  { id: "handy_b", name: "Handy (Beamte)", price: 500, category: "Beamte – Items" },
  { id: "aktenblatt", name: "Aktenblatt", price: 500, category: "Beamte – Items" },
  { id: "luftmessungsgeraet", name: "Luftmessungsgerät", price: 1000, category: "Beamte – Items" },
  { id: "brecheisen", name: "Brecheisen", price: 1000, category: "Beamte – Items" },
  { id: "teststreifen", name: "Teststreifen", price: 1000, category: "Beamte – Items" },
  { id: "virusstreifen", name: "Virusstreifen", price: 500, category: "Beamte – Items" },
  { id: "kleidungstasche_b", name: "Kleidungstasche (Beamte)", price: 1000, category: "Beamte – Items" },
  { id: "sprayentferner_b", name: "Sprayentferner (Beamte)", price: 1000, category: "Beamte – Items" },
  { id: "fingerabdruckscanner", name: "Fingerabdruckscanner", price: 5000, category: "Beamte – Items" },
  { id: "panicbutton", name: "Panicbutton (Leader)", price: 5000, category: "Beamte – Items" },
  { id: "rucksack_b", name: "Rucksack (Beamte)", price: 5000, category: "Beamte – Items" },
  { id: "pd_fallschirm", name: "PD Fallschirm", price: 15000, category: "Beamte – Items" },
  { id: "fib_fallschirm", name: "FIB Fallschirm", price: 45000, category: "Beamte – Items" },

  // Fisch
  { id: "stoer", name: "Stör", price: 180, category: "Fisch" },
  { id: "seeteufe", name: "Seeteufel", price: 2200, category: "Fisch" },
  { id: "heilbutt", name: "Heilbutt", price: 3000, category: "Fisch" },
  { id: "thunfisch", name: "Thunfisch", price: 3900, category: "Fisch" },
  { id: "marlin", name: "Marlin", price: 5200, category: "Fisch" },
  { id: "hummer", name: "Hummer", price: 6000, category: "Fisch" },
  { id: "schwertfisch", name: "Schwertfisch", price: 7000, category: "Fisch" },
  { id: "blauflossenthunfisch", name: "Blauflossen-Thunfisch", price: 8500, category: "Fisch" },
  { id: "goldfisch", name: "Goldfisch", price: 11000, category: "Fisch" },
  { id: "weisser_stoer", name: "Weißer Stör", price: 14500, category: "Fisch" },
];
