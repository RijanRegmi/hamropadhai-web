import { handleLogout } from "./../../../lib/actions/auth-action";

export default function Dashboard() {
  return (
    <div>
      <h1>This is Dashboard page</h1>

      <form action={handleLogout}>
        <button type="submit">Signout</button>
      </form>
    </div>
  );
}
