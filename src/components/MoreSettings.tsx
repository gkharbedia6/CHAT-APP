import { cn } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { format } from "date-fns";
import { Copy, Undo } from "lucide-react";

interface MoreSettingsProps {
  message: Message;
}

const MoreSettings = ({ message }: MoreSettingsProps) => {
  const formatTimestamp = (timestamp: number) => {
    const msgDate = new Date(timestamp);
    const now = new Date();
    const isToday = msgDate.toDateString() === now.toDateString();
    const isThisWeek =
      Math.abs(now.getTime() - msgDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
    if (isToday) {
      return format(msgDate, "HH:mm");
    } else if (isThisWeek) {
      return format(msgDate, "EEEE HH:mm");
    } else {
      return format(msgDate, "dd MMM yyyy HH:mm");
    }
  };

  return (
    <div className="w-[180px] h-[150px] bg-white shadow_box flex flex-col rounded-lg items-evenly">
      <div className="h-[30%] align-middle px-4 flex justify-start items-center text-xs text-gray-400 border-b-[1px] border-black">
        {formatTimestamp(message.timestamp)}
      </div>
      <div className="h-[35%] group  flex w-full justify-center items-center px-3 border-b-[1px] border-black  text-sm">
        <div
          onClick={() => {
            console.log("copy");
          }}
          className="flex w-full rounded-md hover:bg-gray-100 hover:text-indigo-600  px-2 py-2 cursor-pointer flex-row  justify-between items-center"
        >
          <div>Copy</div>

          <Copy className="w-4 h-4" />
        </div>
      </div>
      <div className="h-[35%] px-3 w-full flex items-center justify-center text-sm text-red-500">
        <div
          onClick={() => {
            console.log("unsend");
          }}
          className="flex w-full rounded-md hover:bg-gray-100 px-2 py-2 cursor-pointer flex-row  justify-between items-center"
        >
          <div>Unsend</div>
          <Undo className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default MoreSettings;
