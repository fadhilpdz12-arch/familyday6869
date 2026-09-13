"use client";

export default function Ralat({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-lagun-dalam px-6 text-center text-atas-gelap">
      <div>
        <h1 className="mb-3 text-3xl text-kerang-terang">Laman gagal dimuatkan</h1>
        <p className="mb-6 text-atas-gelap-lembut">
          Sambungan ke pangkalan data terputus. Cuba muat semula — data anda tidak hilang.
        </p>
        <button onClick={reset} className="btn btn-utama">Cuba lagi</button>
      </div>
    </main>
  );
}
