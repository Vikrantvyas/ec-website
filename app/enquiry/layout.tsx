import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "English Club - Perfect Demo Class Time",
  description:
    "बस 5 आसान सवालों के जवाब दें और अपना Perfect Demo Class Time जानें।",

  openGraph: {
    title: "अपना Perfect Demo Class Time जानें",
    description:
      "बस 5 आसान सवालों के जवाब दें।",
    type: "website",
    url: "https://ecindore.com/enquiry",
  },

  twitter: {
    card: "summary_large_image",
    title: "अपना Perfect Demo Class Time जानें",
    description:
      "बस 5 आसान सवालों के जवाब दें।",
  },
};

export default function EnquiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}