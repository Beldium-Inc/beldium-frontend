import CustomModal from "@/components/ui/modals/CustomModal";
import { Form } from "antd";
import { useUIStore } from "@/store/ui/ui.store";
import OtpInputField from "../OtpInputField";

const TransactionPinModal = ({
  title,
  description,
}: {
  description: string;
  title?: string;
}) => {
  const { showTransactionPinModal, closeTransactionPinModal, openAlertModal } =
    useUIStore();
  return (
    <>
      <CustomModal
        open={showTransactionPinModal}
        onClose={closeTransactionPinModal}
        title={title || "Transaction PIN"}
        description={description}
        confirmText="Submit"
        onConfirm={() => {
          closeTransactionPinModal();
          openAlertModal();
        }}
      >
        <div className="mb-6">
          <Form layout="vertical" className="w-full">
            <OtpInputField
              length={4}
              onComplete={(otp) => {
                console.log("OTP entered:", otp);
              }}
            />
          </Form>
        </div>
      </CustomModal>
    </>
  );
};

export default TransactionPinModal;
