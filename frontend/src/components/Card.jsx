export default function Card({ title, desc, onClick }) {
  return (
    <div
      className="border rounded-lg shadow-md p-5 cursor-pointer hover:shadow-xl transition"
      onClick={onClick}
    >
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-gray-600 mt-2">{desc}</p>
    </div>
  );
}
