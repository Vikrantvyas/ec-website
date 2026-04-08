import ClientPage from "./ClientPage";

export const metadata = {
  title: "English Club - Indore (M.P.)",
  description: "छोड़िए ता है, ती है, रहा है, रही है...",
  openGraph: {
    title: "Spoken English Course - English Club",
    description: "3 महीने में English बोलना सीखें",
    url: "https://ecindore.com/english-online",
    images: [
      {
        url: "https://ecindore.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "English Club",
      },
    ],
  },
};

export default function Page() {
  return <ClientPage />;
}