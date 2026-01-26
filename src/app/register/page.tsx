"use client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";
import { Carousel } from "antd";
import Image from "next/image";

export default function Page() {
  return (
    <div className="relative w-full h-screen flex justify-between items-center">
      <div className="hidden lg:block bg-white text-primary w-1/2 h-screen p-0">
        <Carousel
          autoplay
          dotPlacement="bottom"
          className="h-screen flex flex-col justify-center items-center"
        >
          <div className="relative w-full h-screen border-red-600 bg-[url('/assets/images/get-started.jpg')] bg-cover bg-red-600">
            <div className="absolute bottom-10 w-full text-white text-2xl text-shadow-lg px-5">
              <h2 className="my-5 font-bold! text-4xl text-left w-3/4">
                Compliant Lithium Market Access Starts Here
              </h2>
              <p className="text-md">
                Register your operation and receive support with licensing, ESG,
                and buyer readiness
              </p>
            </div>
          </div>
          <div className="relative w-full h-screen bg-[url('/assets/images/lithium.jpg')] bg-cover">
            <div className="absolute bottom-10 w-full text-white text-2xl text-shadow-lg px-5">
              <h2 className="my-5 font-bold! text-4xl text-left w-3/4">
                Compliant Lithium Market Access Starts Here
              </h2>
              <p className="text-md">
                Register your operation and receive support with licensing, ESG,
                and buyer readiness
              </p>
            </div>
          </div>
          <div className="relative w-full h-screen bg-[url('/assets/images/bg-cover-02.jpg')] bg-cover">
            <div className="absolute bottom-10 w-full text-white text-2xl text-shadow-lg px-5">
              <h2 className="my-5 font-bold! text-4xl text-left w-3/4">
                Compliant Lithium Market Access Starts Here
              </h2>
              <p className="text-md">
                Register your operation and receive support with licensing, ESG,
                and buyer readiness
              </p>
            </div>
          </div>
        </Carousel>
      </div>
      <div className="w-full lg:w-3/4 lg:p-10 h-screen flex justify-center items-center overflow-y-scroll">
        <OnboardingWizard />
      </div>
    </div>
  );
}
