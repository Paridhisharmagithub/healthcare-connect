import Navbar from "../../components/Navbar";

export default function ManageUsers() {
  const users = [
    { name:"Patient A", role:"Patient"},
    { name:"Dr. Sharma", role:"Doctor"}
  ]; // fetch real users from backend

  return (
    <div>
      <Navbar userType="admin"/>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">Manage Users</h2>
        <ul>
          {users.map((u,i) => (
            <li key={i} className="border p-2 rounded my-1">{u.name} – {u.role}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
