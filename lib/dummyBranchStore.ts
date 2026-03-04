type Branch = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

let branches: Branch[] = [
  { id: 1, name: "Bapat Square", status: "Active" },
  { id: 2, name: "Nanda Nagar", status: "Active" },
];

export const getBranches = () => branches;

export const setBranches = (newBranches: Branch[]) => {
  branches = newBranches;
};