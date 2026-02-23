import SideBar from "../../../components/layout/SideBar";

export default function SiteLayout({ children }) {
  return (
    <>
      <SideBar>{children}</SideBar>
    </>
  );
}
