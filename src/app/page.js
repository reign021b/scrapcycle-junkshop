import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div>
      <main>
        <Navbar />
        <div className="w-full bg-gray-50 h-[91vh] mx-auto">
          <div className="max-w-[1340px] h-full mx-auto"></div>
        </div>
      </main>
    </div>
  );
}
