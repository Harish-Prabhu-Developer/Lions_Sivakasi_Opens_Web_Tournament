export const API_URL=import.meta.env.VITE_NODE_API_URL || "http://localhost:3000";
export const CRYPTO_SECRET=import.meta.env.VITE_CRYPTO_SECRET || "TestSecretKey123456789";

  export const tournamentData = {
  entryFees: { singles: 800, doubles: 1400 }, // doubles fee covers Doubles and Mixed Doubles
  categories: [
    { name: "Under 09 Boys & Girls", afterBorn: 2017, events: ["Singles"] },
    { name: "Under 11 Boys & Girls", afterBorn: 2015, events: ["Singles"] },
    { name: "Under 13 Boys & Girls", afterBorn: 2013, events: ["Singles", "Doubles"] },
    { name: "Under 15 Boys & Girls", afterBorn: 2011, events: ["Singles", "Doubles", "Mixed Doubles"] },
    { name: "Under 17 Boys & Girls", afterBorn: 2009, events: ["Singles", "Doubles", "Mixed Doubles"] },
    { name: "Under 19 Boys & Girls", afterBorn: 2007, events: ["Singles", "Doubles", "Mixed Doubles"] },
  ],
  upi: "test@oksbi",
  upiQrUrl: "https://placehold.co/150x150/0000FF/FFFFFF/png?text=Mock+UPI+QR",
};

export  const mockUser = {
  id: "user-12345",
  email: "player@example.com",
  name: "Mock Player Name",
  TNBAID: "TNBA8584",
  dob: "2002-05-14",
  academy: "Mock Academy",
  place: "Mock Place",
  district: "Mock District",
};

export const playerFields = [
  { key: 'fullName', label: 'Full Name', type: 'text' },
  { key: 'tnbaId', label: 'TNBA ID', type: 'text' },
  { key: 'dob', label: 'Date of Birth', type: 'date' },
  { key: 'academyName', label: 'Academy Name', type: 'text' },
  { key: 'place', label: 'Place', type: 'text' },
  { key: 'district', label: 'District', type: 'text' },
];
