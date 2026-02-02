import React from 'react';
import Image from "next/image";

function Logo() {
  return (
    <div className="">
      <Image src="/assets/images/logo.png" height={72} width={72} alt="logo" />
    </div>
  );
}

export default Logo;
