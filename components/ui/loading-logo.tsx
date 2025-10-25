import Image from "next/image";

export default function LoadingLogo() {
  return (
    <div className="mb-6 flex justify-center">
      <div className="relative h-40 w-40">
        <Image
          src="/logo.png"
          alt="Loading"
          fill
          sizes="160px"
          className="animate-pulse object-contain"
          priority
        />
      </div>
    </div>
  );
}

