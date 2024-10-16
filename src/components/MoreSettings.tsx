import { Message } from "@/lib/validations/message";
import { format } from "date-fns";

interface MoreSettingsProps {
  message: Message;
}

const MoreSettings = ({ message }: MoreSettingsProps) => {
  return (
    <div className="w-[180px] h-[170px] bg-white shadow-md flex flex-col">
      <div>{format(message.timestamp, "HH:mm")}</div>
    </div>
  );
};

export default MoreSettings;
