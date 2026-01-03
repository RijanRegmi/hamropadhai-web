import Link from "next/link";
export default function Page() {
  return (
    <div>
      <h1>This is Dashboard page</h1>
      <Link href="/login">
        <button>Signout</button>
      </Link>
    </div>
  );
}
