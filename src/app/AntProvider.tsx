import { ConfigProvider } from "antd";

const AntProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-poppins)",
          colorPrimary: "#101E3D",
          colorFillSecondary: "#D3E4FE",
          colorLink: "#2563EB",
          borderRadius: 8,
          fontSize: 16,
          colorText: "#101E3D",
        },
        components: {
          Form: {
            labelFontSize: 14,
            labelColor: "#374151",
            labelRequiredMarkColor: "#EF4444",
          },

          Input: {
            controlHeight: 46,
            fontSize: 14,
            borderRadius: 8,
          },

          Select: {
            controlHeight: 46,
            fontSize: 14,
            borderRadius: 8,
          },

          DatePicker: {
            controlHeight: 46,
            fontSize: 14,
            borderRadius: 8,
          },
          Button: {
            controlHeight: 48,
            fontSize: 16,
            borderRadius: 12,
            paddingInline: 32,
            colorBgBase: "#101E3D",
            textTextColor: "#ffffff",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntProviders;
