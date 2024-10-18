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
  messageId: string;
  emoji?: EmojiClickData;
  timestamp: number;
  messageText: string;
  senderId: string;
  senderName: string;
  senderImageUrl: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}
