import { User } from 'lucide-react';
import { fetchRedis } from './redis';

export const getFriendsByUserId = async (userId: string) => {
  const friendsIds = (await fetchRedis(
    'smembers',
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendsIds.map(async (friendId) => {
      const friendData = (await fetchRedis(
        'get',
        `user:${friendId}`
      )) as string;
      return JSON.parse(friendData) as User;
    })
  );

  return friends;
};
