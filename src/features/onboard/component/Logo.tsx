import React from 'react';
import Image from "next/image";

function Logo() {
  return (
    <div className="flex h-16 w-14 items-center justify-center rounded-xl bg-white shadow-sm lg:hidden">
      <Image src="/assets/images/logo.png" height={30} width={30} alt="Beldium logo" />
    </div>
  );
}

export default Logo;
