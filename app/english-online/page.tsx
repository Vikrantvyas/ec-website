import ClientPage from "./ClientPage";

export const metadata = {
  title: "Spoken English Course - English Club",
  description: "3 महीने में English बोलना सीखें",
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