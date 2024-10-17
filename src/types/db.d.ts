import { EmojiClickData } from "emoji-picker-react";

interface User {
  name: string;
  email: string;
  image: string;
  id: string;
}

interface Chat {
  id: string;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  replyToUserId?: string;
  replyToMessegeId?: string;
  reactions?: Reaction[];
}

interface Reaction {
  emoji: EmojiClickData;
  senderId: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}
