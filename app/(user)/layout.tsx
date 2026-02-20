import "./user.css";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="user-wrapper">{children}</div>;
}
