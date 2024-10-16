import Image from "next/image";

export default function User({ size }: { size?: number }) {
  return (
    <Image
      src="/einstein.png"
      className="cursor-pointer"
      alt={"User"}
      width={size || 60}
      height={size || 60}
    />
  );
}
