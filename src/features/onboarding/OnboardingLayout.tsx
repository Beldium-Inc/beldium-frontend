"use client";

import Image from "next/image";
import { Carousel } from "antd";
import { ReactNode } from "react";

const slides = [
  {
    src: "/assets/images/get-started.jpg",
    heading: "Compliant Lithium Market Access Starts Here",
    body: "Register your operation and receive support with licensing, ESG, and buyer readiness",
  },
  {
    src: "/assets/images/lithium.jpg",
    heading: "Compliant Lithium Market Access Starts Here",
    body: "Register your operation and receive support with licensing, ESG, and buyer readiness",
  },
  {
    src: "/assets/images/bg-cover-02.jpg",
    heading: "Compliant Lithium Market Access Starts Here",
    body: "Register your operation and receive support with licensing, ESG, and buyer readiness",
  },
];

function ImagePanel() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div className="h-full [&_.ant-carousel]:h-full [&_.slick-slider]:h-full [&_.slick-list]:h-full [&_.slick-track]:h-full [&_.slick-slide]:h-full [&_.slick-slide>div]:h-full [&_.slick-slide>div>div]:h-full [&_.slick-dots]:bottom-6">
        <Carousel autoplay dotPlacement="bottom">
          {slides.map((slide) => (
            <div key={slide.src} className="relative w-full h-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.src}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-14 left-6 right-6 text-white z-10 pointer-events-none">
                <h2 className="text-2xl lg:text-3xl font-bold leading-snug mb-3">{slide.heading}</h2>
                <p className="text-sm text-white/85 leading-relaxed max-w-md">{slide.body}</p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="absolute top-6 left-6 h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm z-10">
        <Image src="/assets/images/logo.png" height={22} width={22} alt="Beldium logo" />
      </div>
    </div>
  );
}

export function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4 py-6 lg:py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 lg:h-[720px]">
        <div className="hidden lg:block h-full p-3">
          <ImagePanel />
        </div>
        <div className="flex items-center justify-center px-6 py-10 lg:px-16 lg:py-10 overflow-y-auto">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
