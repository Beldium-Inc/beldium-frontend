import CustomModal from "@/components/ui/modals/CustomModal";
import { Form } from "antd";
import { useUIStore } from "@/store/ui/ui.store";
import OtpInputField from "../OtpInputField";

const OTPModal = ({
  title,
  description,
}: {
  description: string;
  title?: string;
}) => {
  const { showOtpModal, closeOtpModal, openAlertModal } = useUIStore();
  return (
    <>
      <CustomModal
        open={showOtpModal}
        onClose={closeOtpModal}
        title={title || "Input OTP"}
        description={description}
        confirmText="Submit"
        onConfirm={() => {
          closeOtpModal();
          openAlertModal();
        }}
      >
        <Form layout="vertical" className="w-full">
          <OtpInputField
            onComplete={(otp) => {
              console.log("OTP entered:", otp);
            }}
          />
        </Form>
      </CustomModal>
    </>
  );
};

export default OTPModal;
