let branches = [
  { id: 1, name: "Bapat Square", status: "Active" as const },
  { id: 2, name: "Nanda Nagar", status: "Active" as const },
];

export const getBranches = () => branches;

export const setBranches = (
  newBranches: typeof branches
) => {
  branches = newBranches;
};