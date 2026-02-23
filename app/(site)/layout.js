import Header from "../../components/layout/Header";

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
