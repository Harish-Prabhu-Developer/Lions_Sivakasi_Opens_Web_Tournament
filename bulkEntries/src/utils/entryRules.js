// utils/entryRules.js
export const canAddNewEntryCheck = (entries) => {
  const totalEntries = entries.length;
  const singlesOrDoublesCount = entries.filter(
    (e) =>
      e.type.toLowerCase() === "singles" || e.type.toLowerCase() === "doubles"
  ).length;
  const mixedDoublesCount = entries.filter(
    (e) => e.type.toLowerCase() === "mixed doubles"
  ).length;

  return (
    totalEntries < 4 &&
    (singlesOrDoublesCount < 3 || mixedDoublesCount < 1)
  );
};
