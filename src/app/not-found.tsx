import Link from "next/link";

export default function TidakJumpa() {
  return (
    <main className="grid min-h-dvh place-items-center bg-lagun-dalam px-6 text-center text-atas-gelap">
      <div>
        <h1 className="mb-3 text-3xl text-kerang-terang">Halaman tidak dijumpai</h1>
        <p className="mb-6 text-atas-gelap-lembut">Pautan itu mungkin sudah bertukar.</p>
        <Link href="/" className="btn btn-utama">Kembali ke laman utama</Link>
      </div>
    </main>
  );
}
