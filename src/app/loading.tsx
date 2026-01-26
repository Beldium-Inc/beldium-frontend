import Image from "next/image";
import React from "react";

const preloader = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Image src="/assets/images/logo.png" height={72} width={72} alt="logo" />
    </div>
  );
};

export default preloader;
