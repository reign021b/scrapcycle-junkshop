import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div>
      <main>
        <Navbar />
        <div className="max-w-[1440px] bg-black min-h-screen mx-auto"></div>
      </main>
    </div>
  );
}
