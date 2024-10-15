import { Message } from "@/lib/validations/message";
import { format } from "date-fns";

interface MessageSettingsProps {
  message: Message;
}

const MessageSettings = ({ message }: MessageSettingsProps) => {
  return (
    <div className="w-[180px] h-[170px] bg-white shadow-md flex flex-col">
      <div>{format(message.timestamp, "HH:mm")}</div>
    </div>
  );
};

export default MessageSettings;
